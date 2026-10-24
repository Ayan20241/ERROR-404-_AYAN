import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const migrationsDirectory = fileURLToPath(
  new URL('../../supabase/migrations/', import.meta.url),
);
const migrationFiles = readdirSync(migrationsDirectory).sort();
const schemaSql = readFileSync(
  new URL('../../supabase/migrations/001_core_schema.sql', import.meta.url),
  'utf8',
);
const securitySql = readFileSync(
  new URL(
    '../../supabase/migrations/002_rls_and_integrity.sql',
    import.meta.url,
  ),
  'utf8',
);
const coreApiSql = readFileSync(
  new URL('../../supabase/migrations/003_core_api.sql', import.meta.url),
  'utf8',
);
const phase5Sql = readFileSync(
  new URL(
    '../../supabase/migrations/004_engagement_and_insights.sql',
    import.meta.url,
  ),
  'utf8',
);
const indiaLocationsSql = readFileSync(
  new URL(
    '../../supabase/migrations/005_india_location_catalog.sql',
    import.meta.url,
  ),
  'utf8',
);

describe('database migration contracts', () => {
  it('uses ordered, numbered migration filenames', () => {
    expect(migrationFiles).toEqual([
      '001_core_schema.sql',
      '002_rls_and_integrity.sql',
      '003_core_api.sql',
      '004_engagement_and_insights.sql',
      '005_india_location_catalog.sql',
    ]);
    expect(
      migrationFiles.every((file) => /^\d{3}_[a-z0-9_]+\.sql$/.test(file)),
    ).toBe(true);
  });

  it('defines the documented core tables and integrity constraints', () => {
    for (const table of [
      'profiles',
      'events',
      'registrations',
      'saved_events',
      'notifications',
      'event_feedback',
    ]) {
      expect(schemaSql).toMatch(
        new RegExp(`create table public\\.${table}\\s*\\(`, 'i'),
      );
    }

    expect(schemaSql).toMatch(
      /create unique index registrations_one_active_per_attendee_event_idx[\s\S]*?where status = 'registered'/i,
    );
    expect(schemaSql).toMatch(
      /organizer_id uuid not null references public\.profiles\s*\(id\) on delete restrict/i,
    );
    expect(schemaSql).toMatch(
      /constraint events_registered_count_in_capacity check[\s\S]*?registered_count between 0 and capacity/i,
    );
  });

  it('enables RLS and only grants narrowly scoped user operations', () => {
    for (const table of [
      'profiles',
      'events',
      'registrations',
      'saved_events',
      'notifications',
      'event_feedback',
    ]) {
      expect(securitySql).toMatch(
        new RegExp(
          `alter table public\\.${table} enable row level security`,
          'i',
        ),
      );
    }

    expect(securitySql).not.toMatch(
      /grant\s+all\s+privileges?\s+on\s+table[\s\S]*?\bto\s+(?:public|anon)\b/i,
    );
    expect(securitySql).not.toMatch(
      /grant update\s*\([^)]*\brole\b[^)]*\)\s+on table public\.profiles/i,
    );
    expect(securitySql).toMatch(
      /grant update \(read_at\) on table public\.notifications to authenticated/i,
    );
    expect(securitySql).toMatch(
      /create policy events_select_published_anon[\s\S]*?to anon\s+using \(status = 'published'\)/i,
    );
    expect(securitySql).toMatch(
      /create policy events_select_published_or_owner_or_attendee_or_admin[\s\S]*?to authenticated[\s\S]*?public\.registrations as attendee_registration/i,
    );
  });

  it('protects registration history and serializes capacity changes in SQL', () => {
    for (const functionName of [
      'register_for_event',
      'cancel_event_registration',
    ]) {
      const functionSql = securitySql.match(
        new RegExp(
          `create function public\\.${functionName}\\([\\s\\S]*?\\n\\$\\$;`,
          'i',
        ),
      )?.[0];

      expect(functionSql).toBeDefined();
      expect(functionSql).toMatch(/security definer/i);
      expect(functionSql).toMatch(/set search_path = pg_catalog, pg_temp/i);
      expect(functionSql).toMatch(/for update/i);
    }

    expect(securitySql).toMatch(
      /grant execute on function public\.register_for_event\(uuid\) to authenticated/i,
    );
    expect(securitySql).toMatch(
      /grant execute on function public\.cancel_event_registration\(uuid\) to authenticated/i,
    );
    expect(securitySql).toMatch(
      /grant execute on function public\.mark_event_attendance\([\s\S]*?\) to authenticated/i,
    );
    expect(securitySql).toMatch(/if v_actor_role <> 'attendee' then/i);
    expect(securitySql).toMatch(/'already_registered'/i);
    expect(securitySql).toMatch(/'already_cancelled'/i);
    expect(securitySql).toMatch(/'registration_confirmed'/i);
    expect(securitySql).toMatch(/'Registration cancelled'/i);
  });

  it('limits organizer attendee data and protects attendance marking', () => {
    const feedbackPolicy = securitySql.match(
      /create policy event_feedback_insert_eligible_attendee[\s\S]*?\n\);/i,
    )?.[0];

    expect(feedbackPolicy).toBeDefined();
    expect(feedbackPolicy).toMatch(/event\.id\s*=\s*event_feedback\.event_id/i);
    expect(securitySql).toMatch(
      /create view public\.organizer_event_attendees[\s\S]*?security_barrier = true/i,
    );
    expect(securitySql).not.toMatch(
      /create view public\.organizer_event_attendees[\s\S]*?auth\.users/i,
    );
    expect(securitySql).toMatch(/public\.mark_event_attendance/i);
    expect(securitySql).toMatch(/event\.end_at > pg_catalog\.now\(\)/i);
    expect(securitySql).toMatch(/'forbidden'/i);
    expect(securitySql).toMatch(/'invalid_attendance_status'/i);
  });

  it('does not drop database objects or include a seed account', () => {
    expect(
      `${schemaSql}\n${securitySql}\n${coreApiSql}\n${phase5Sql}\n${indiaLocationsSql}`,
    ).not.toMatch(/^\s*drop\s+(?:table|type|function|policy|schema)\b/im);
    expect(
      `${schemaSql}\n${securitySql}\n${coreApiSql}\n${phase5Sql}\n${indiaLocationsSql}`,
    ).not.toMatch(/insert\s+into\s+auth\.users/i);
  });

  it('adds public search with invoker permissions and SQL pagination', () => {
    expect(coreApiSql).toMatch(
      /create function public\.search_public_events[\s\S]*?security invoker/i,
    );
    expect(coreApiSql).toMatch(/event\.status = 'published'/i);
    expect(coreApiSql).toMatch(/event\.end_at > pg_catalog\.now\(\)/i);
    expect(coreApiSql).toMatch(
      /limit p_page_size\s+offset \(p_page - 1\) \* p_page_size/i,
    );
    expect(coreApiSql).toMatch(
      /grant execute on function public\.search_public_events[\s\S]*?to anon, authenticated/i,
    );
  });

  it('restricts self-upgrade and keeps event changes transactional with notifications', () => {
    expect(coreApiSql).toMatch(
      /create function public\.become_organizer\(\)[\s\S]*?security definer[\s\S]*?set search_path = pg_catalog, pg_temp/i,
    );
    expect(coreApiSql).toMatch(
      /if v_role <> 'attendee' then[\s\S]*?return 'not_allowed'/i,
    );
    expect(coreApiSql).toMatch(
      /create function public\.update_owned_event[\s\S]*?for update/i,
    );
    expect(coreApiSql).toMatch(/capacity_below_registrations/i);
    expect(coreApiSql).toMatch(
      /insert into public\.notifications[\s\S]*?'event_updated'/i,
    );
    expect(coreApiSql).toMatch(
      /create function public\.cancel_owned_event[\s\S]*?for update/i,
    );
    expect(coreApiSql).toMatch(
      /insert into public\.notifications[\s\S]*?'event_cancelled'/i,
    );
    expect(coreApiSql).toMatch(
      /revoke all on function public\.become_organizer\(\)[\s\S]*?from public, anon, authenticated/i,
    );
  });

  it('protects engagement, moderation, and aggregate functions', () => {
    expect(phase5Sql).toMatch(
      /create table public\.event_analytics[\s\S]*?event_analytics_event_viewer_day_unique/i,
    );
    expect(phase5Sql).toMatch(
      /alter table public\.event_analytics enable row level security/i,
    );
    expect(phase5Sql).toMatch(
      /create function public\.save_event\(p_event_id uuid\)[\s\S]*?security definer[\s\S]*?auth\.uid\(\)[\s\S]*?on conflict \(attendee_id, event_id\) do nothing/i,
    );
    expect(phase5Sql).toMatch(
      /create function public\.get_organizer_stats\(\)[\s\S]*?event\.organizer_id = v_actor_id/i,
    );
    expect(phase5Sql).toMatch(
      /create function public\.get_admin_stats\(\)[\s\S]*?v_actor_role is distinct from 'admin'/i,
    );
    expect(phase5Sql).toMatch(
      /revoke all on function public\.record_event_view\(uuid, uuid\)[\s\S]*?from public, anon, authenticated, service_role/i,
    );
    expect(phase5Sql).toMatch(
      /grant execute on function public\.record_event_view\(uuid, uuid\) to service_role/i,
    );
    expect(phase5Sql).toMatch(
      /create function public\.admin_remove_event[\s\S]*?insert into public\.notifications/i,
    );
    expect(phase5Sql).toMatch(
      /create function public\.admin_restore_event[\s\S]*?delete from public\.event_moderation/i,
    );
    expect(phase5Sql).toMatch(
      /revoke all on function public\.admin_remove_event\(uuid\)[\s\S]*?from public, anon, authenticated/i,
    );
  });

  it('seeds all Indian states and Union Territories as separate divisions', () => {
    const seed = indiaLocationsSql.match(
      /insert into public\.india_admin_divisions[\s\S]*?;/i,
    )?.[0];
    expect(seed).toBeDefined();
    expect(seed?.match(/'state'\)/g)).toHaveLength(28);
    expect(seed?.match(/'union_territory'\)/g)).toHaveLength(8);
    for (const division of [
      'Andhra Pradesh',
      'Chhattisgarh',
      'Odisha',
      'Telangana',
      'Uttarakhand',
      'Dadra and Nagar Haveli and Daman and Diu',
      'Jammu and Kashmir',
      'Puducherry',
    ]) {
      expect(seed).toContain(division);
    }
  });

  it('keeps same-named cities disambiguated by their state-scoped IDs', () => {
    const citySeed = indiaLocationsSql.match(
      /insert into public\.india_cities[\s\S]*?;/i,
    )?.[0];
    expect(citySeed).toContain("('IN-RJ-UDAIPUR', 'IN', 'IN-RJ', 'Udaipur')");
    expect(citySeed).toContain("('IN-TR-UDAIPUR', 'IN', 'IN-TR', 'Udaipur')");
    expect(indiaLocationsSql).toMatch(/unique \(division_code, name\)/i);
    expect(indiaLocationsSql).toMatch(
      /foreign key \(country_code, division_code\)[\s\S]*?references public\.india_admin_divisions/i,
    );
  });

  it('adds nullable location references without guessing legacy locations', () => {
    expect(indiaLocationsSql).toMatch(/add column country_code text,/i);
    expect(indiaLocationsSql).toMatch(/add column city_id text,/i);
    expect(indiaLocationsSql).toMatch(/add column locality text,/i);
    expect(indiaLocationsSql).not.toMatch(
      /update public\.events\s+set\s+country_code|update public\.events\s+set\s+city_id/i,
    );
    expect(indiaLocationsSql).toMatch(
      /create function public\.search_public_events_by_location[\s\S]*?security invoker[\s\S]*?p_state_code[\s\S]*?p_city_id[\s\S]*?limit p_page_size offset/i,
    );
    expect(indiaLocationsSql).toMatch(
      /alter table public\.india_cities enable row level security/i,
    );
  });
});
