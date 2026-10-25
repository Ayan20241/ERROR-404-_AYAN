-- Engagement, moderation, and aggregate API support.

create table public.event_analytics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  viewed_on date not null default (
    pg_catalog.timezone('UTC', pg_catalog.now())::date
  ),
  viewed_at timestamptz not null default pg_catalog.now(),
  constraint event_analytics_event_viewer_day_unique
    unique (event_id, viewer_id, viewed_on)
);

alter table public.event_analytics enable row level security;
revoke all on table public.event_analytics from public, anon, authenticated;

create table public.event_moderation (
  event_id uuid primary key references public.events (id) on delete cascade,
  previous_status public.event_status not null,
  moderated_by uuid not null references public.profiles (id),
  flagged_at timestamptz not null default pg_catalog.now()
);

alter table public.event_moderation enable row level security;
revoke all on table public.event_moderation from public, anon, authenticated;

create index event_analytics_event_id_idx
  on public.event_analytics (event_id);

create function public.save_event(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is distinct from 'attendee' then
    return 'not_allowed';
  end if;

  if not exists (
    select 1 from public.events as event
    where event.id = p_event_id and event.status = 'published'
  ) then
    return 'event_not_found';
  end if;

  insert into public.saved_events (attendee_id, event_id)
  values (v_actor_id, p_event_id)
  on conflict (attendee_id, event_id) do nothing;

  return 'saved';
end;
$$;

create function public.record_event_view(
  p_event_id uuid,
  p_viewer_id uuid
)
returns text
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
begin
  if p_viewer_id is null then
    return 'invalid_viewer';
  end if;

  insert into public.event_analytics (event_id, viewer_id)
  select event.id, p_viewer_id
  from public.events as event
  where event.id = p_event_id
    and event.status = 'published'
    and event.organizer_id <> p_viewer_id
  on conflict (event_id, viewer_id, viewed_on) do nothing;

  return 'recorded';
end;
$$;

create function public.get_organizer_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
  v_result jsonb;
begin
  if v_actor_id is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is distinct from 'organizer' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;

  select pg_catalog.jsonb_build_object(
    'events',
    coalesce(
      pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', event.id,
          'title', event.title,
          'status', event.status,
          'start_at', event.start_at,
          'capacity', event.capacity,
          'registrations', counts.registration_count,
          'remaining_capacity', event.capacity - counts.registration_count,
          'views', counts.view_count
        ) order by event.start_at, event.id
      ),
      '[]'::jsonb
    ),
    'totalRegistrations',
    coalesce(pg_catalog.sum(counts.registration_count), 0),
    'totalViews',
    coalesce(pg_catalog.sum(counts.view_count), 0)
  )
  into v_result
  from public.events as event
  cross join lateral (
    select
      (select pg_catalog.count(*)::integer
       from public.registrations as registration
       where registration.event_id = event.id
         and registration.status = 'registered') as registration_count,
      (select pg_catalog.count(*)::integer
       from public.event_analytics as analytics
       where analytics.event_id = event.id) as view_count
  ) as counts
  where event.organizer_id = v_actor_id;

  return v_result;
end;
$$;

create function public.get_admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
begin
  if v_actor_id is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;

  return pg_catalog.jsonb_build_object(
    'users', (select pg_catalog.count(*) from public.profiles),
    'events', (select pg_catalog.count(*) from public.events),
    'registrations', (select pg_catalog.count(*) from public.registrations)
  );
end;
$$;

create function public.list_admin_events(
  p_page integer,
  p_page_size integer
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
  v_page integer := greatest(1, coalesce(p_page, 1));
  v_page_size integer := least(100, greatest(1, coalesce(p_page_size, 20)));
begin
  if v_actor_id is null then
    raise exception using errcode = '42501', message = 'unauthorized';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'forbidden';
  end if;

  return pg_catalog.jsonb_build_object(
    'events',
    coalesce(
      (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'event', pg_catalog.to_jsonb(page_events.event_row),
            'flagged', page_events.flagged
          ) order by page_events.created_at desc, page_events.id
        )
        from (
          select event as event_row, event.created_at, event.id,
            moderation.event_id is not null as flagged
          from public.events as event
          left join public.event_moderation as moderation
            on moderation.event_id = event.id
          order by event.created_at desc, event.id
          limit v_page_size
          offset (v_page - 1) * v_page_size
        ) as page_events
      ),
      '[]'::jsonb
    ),
    'total',
    (select pg_catalog.count(*) from public.events)
  );
end;
$$;

create function public.admin_remove_event(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
  v_event public.events%rowtype;
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is distinct from 'admin' then
    return 'forbidden';
  end if;

  select event.* into v_event
  from public.events as event
  where event.id = p_event_id
  for update;

  if not found then
    return 'event_not_found';
  end if;

  if exists (
    select 1 from public.event_moderation as moderation
    where moderation.event_id = p_event_id
  ) then
    return 'already_removed';
  end if;

  insert into public.event_moderation (
    event_id,
    previous_status,
    moderated_by
  )
  values (p_event_id, v_event.status, v_actor_id);

  update public.events
  set status = 'cancelled'
  where id = p_event_id;

  insert into public.notifications (
    recipient_id,
    event_id,
    type,
    title,
    message
  )
  values (
    v_event.organizer_id,
    p_event_id,
    'general',
    'Event removed by moderation',
    'Your event "' || v_event.title || '" was removed by a platform administrator.'
  );

  return 'removed';
end;
$$;

create function public.admin_restore_event(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_actor_role public.user_role;
  v_previous_status public.event_status;
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is distinct from 'admin' then
    return 'forbidden';
  end if;

  perform 1
  from public.events as event
  where event.id = p_event_id
  for update;

  if not found then
    return 'event_not_found';
  end if;

  select moderation.previous_status into v_previous_status
  from public.event_moderation as moderation
  where moderation.event_id = p_event_id
  for update;

  if not found then
    return 'not_flagged';
  end if;

  update public.events
  set status = v_previous_status
  where id = p_event_id;

  delete from public.event_moderation
  where event_id = p_event_id;

  return 'restored';
end;
$$;

revoke all on function public.save_event(uuid)
  from public, anon, authenticated;
revoke all on function public.record_event_view(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.get_organizer_stats()
  from public, anon, authenticated;
revoke all on function public.get_admin_stats()
  from public, anon, authenticated;
revoke all on function public.list_admin_events(integer, integer)
  from public, anon, authenticated;
revoke all on function public.admin_remove_event(uuid)
  from public, anon, authenticated;
revoke all on function public.admin_restore_event(uuid)
  from public, anon, authenticated;

grant execute on function public.save_event(uuid) to authenticated;
grant execute on function public.record_event_view(uuid, uuid) to service_role;
grant execute on function public.get_organizer_stats() to authenticated;
grant execute on function public.get_admin_stats() to authenticated;
grant execute on function public.list_admin_events(integer, integer)
  to authenticated;
grant execute on function public.admin_remove_event(uuid) to authenticated;
grant execute on function public.admin_restore_event(uuid) to authenticated;
