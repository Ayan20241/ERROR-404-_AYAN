-- Least-privilege access and atomic registration operations.

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.saved_events enable row level security;
alter table public.notifications enable row level security;
alter table public.event_feedback enable row level security;

revoke all on table
  public.profiles,
  public.events,
  public.registrations,
  public.saved_events,
  public.notifications,
  public.event_feedback
from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (
  display_name,
  interests,
  preferred_categories,
  preferred_budget,
  preferred_location_label,
  preferred_latitude,
  preferred_longitude,
  preferred_radius_km
) on table public.profiles to authenticated;

grant select on table public.events to anon, authenticated;
grant insert (
  organizer_id,
  title,
  slug,
  description,
  category,
  venue_name,
  address,
  latitude,
  longitude,
  start_at,
  end_at,
  price,
  currency,
  capacity,
  registration_deadline,
  image_url,
  status
) on table public.events to authenticated;
grant update (
  title,
  slug,
  description,
  category,
  venue_name,
  address,
  latitude,
  longitude,
  start_at,
  end_at,
  price,
  currency,
  capacity,
  registration_deadline,
  image_url,
  status
) on table public.events to authenticated;

grant select on table public.registrations to authenticated;
grant select, insert, delete on table public.saved_events to authenticated;
grant select on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;
grant select, insert on table public.event_feedback to authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy events_select_published_anon
on public.events
for select
to anon
using (status = 'published');

create policy events_select_published_or_owner_or_attendee_or_admin
on public.events
for select
to authenticated
using (
  status = 'published'
  or organizer_id = (select auth.uid())
  or exists (
    select 1
    from public.registrations as attendee_registration
    where attendee_registration.event_id = events.id
      and attendee_registration.attendee_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.profiles as viewer
    where viewer.id = (select auth.uid())
      and viewer.role = 'admin'
  )
);

create policy events_insert_own_as_organizer_or_admin
on public.events
for insert
to authenticated
with check (
  organizer_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles as creator
    where creator.id = (select auth.uid())
      and creator.role in ('organizer', 'admin')
  )
);

create policy events_update_own_as_organizer_or_admin
on public.events
for update
to authenticated
using (
  organizer_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles as editor
    where editor.id = (select auth.uid())
      and editor.role in ('organizer', 'admin')
  )
)
with check (
  organizer_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles as editor
    where editor.id = (select auth.uid())
      and editor.role in ('organizer', 'admin')
  )
);

create policy registrations_select_own
on public.registrations
for select
to authenticated
using (attendee_id = (select auth.uid()));

create policy saved_events_select_own
on public.saved_events
for select
to authenticated
using (attendee_id = (select auth.uid()));

create policy saved_events_insert_own_published
on public.saved_events
for insert
to authenticated
with check (
  attendee_id = (select auth.uid())
  and exists (
    select 1
    from public.events as saved_event
    where saved_event.id = event_id
      and saved_event.status = 'published'
  )
);

create policy saved_events_delete_own
on public.saved_events
for delete
to authenticated
using (attendee_id = (select auth.uid()));

create policy notifications_select_own
on public.notifications
for select
to authenticated
using (recipient_id = (select auth.uid()));

create policy notifications_update_read_state_own
on public.notifications
for update
to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

create policy event_feedback_select_own
on public.event_feedback
for select
to authenticated
using (attendee_id = (select auth.uid()));

create policy event_feedback_insert_eligible_attendee
on public.event_feedback
for insert
to authenticated
with check (
  attendee_id = (select auth.uid())
  and exists (
    select 1
    from public.events as event
    join public.registrations as registration
      on registration.event_id = event.id
    where event.id = event_feedback.event_id
      and event.end_at <= pg_catalog.now()
      and registration.attendee_id = (select auth.uid())
      and registration.status = 'registered'
      and registration.attendance_status = 'attended'
  )
);

-- The view owner can read the joined rows, so the predicate itself enforces
-- event ownership/admin access and deliberately selects no email or auth data.
create view public.organizer_event_attendees
with (security_barrier = true)
as
select
  registration.event_id,
  registration.attendee_id,
  attendee.display_name,
  registration.status as registration_status,
  registration.attendance_status,
  registration.registered_at
from public.registrations as registration
join public.events as event
  on event.id = registration.event_id
join public.profiles as attendee
  on attendee.id = registration.attendee_id
where
  event.organizer_id = (select auth.uid())
  or exists (
    select 1
    from public.profiles as viewer
    where viewer.id = (select auth.uid())
      and viewer.role = 'admin'
  );

revoke all on table public.organizer_event_attendees
from public, anon, authenticated;
grant select on table public.organizer_event_attendees to authenticated;

create function public.register_for_event(p_event_id uuid)
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

  select profile.role
  into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is null then
    return 'profile_missing';
  end if;

  if v_actor_role <> 'attendee' then
    return 'not_allowed';
  end if;

  select event.*
  into v_event
  from public.events as event
  where event.id = p_event_id
  for update;

  if not found then
    return 'event_not_found';
  end if;

  if v_event.organizer_id = v_actor_id then
    return 'own_event';
  end if;

  if v_event.status <> 'published' then
    return 'event_unavailable';
  end if;

  if v_event.registration_deadline is not null
    and v_event.registration_deadline <= pg_catalog.now() then
    return 'deadline_passed';
  end if;

  if exists (
    select 1
    from public.registrations as registration
    where registration.event_id = p_event_id
      and registration.attendee_id = v_actor_id
      and registration.status = 'registered'
  ) then
    return 'already_registered';
  end if;

  if v_event.registered_count >= v_event.capacity then
    return 'event_full';
  end if;

  insert into public.registrations (event_id, attendee_id)
  values (p_event_id, v_actor_id);

  update public.events
  set registered_count = registered_count + 1
  where id = p_event_id;

  insert into public.notifications (
    recipient_id,
    event_id,
    type,
    title,
    message
  )
  values (
    v_actor_id,
    p_event_id,
    'registration_confirmed',
    'Registration confirmed',
    'You are registered for ' || v_event.title || '.'
  );

  return 'registered';
end;
$$;

create function public.cancel_event_registration(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_event public.events%rowtype;
  v_registration_id uuid;
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;

  select event.*
  into v_event
  from public.events as event
  where event.id = p_event_id
  for update;

  if not found then
    return 'event_not_found';
  end if;

  select registration.id
  into v_registration_id
  from public.registrations as registration
  where registration.event_id = p_event_id
    and registration.attendee_id = v_actor_id
    and registration.status = 'registered'
  for update;

  if not found then
    if exists (
      select 1
      from public.registrations as registration
      where registration.event_id = p_event_id
        and registration.attendee_id = v_actor_id
        and registration.status = 'cancelled'
    ) then
      return 'already_cancelled';
    end if;

    return 'not_registered';
  end if;

  update public.registrations
  set status = 'cancelled'
  where id = v_registration_id;

  update public.events
  set registered_count = registered_count - 1
  where id = p_event_id;

  insert into public.notifications (
    recipient_id,
    event_id,
    type,
    title,
    message
  )
  values (
    v_actor_id,
    p_event_id,
    'general',
    'Registration cancelled',
    'Your registration for ' || v_event.title || ' was cancelled.'
  );

  return 'cancelled';
end;
$$;

create function public.mark_event_attendance(
  p_event_id uuid,
  p_attendee_id uuid,
  p_attendance public.attendance_status
)
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

  select profile.role
  into v_actor_role
  from public.profiles as profile
  where profile.id = v_actor_id;

  if v_actor_role is null then
    return 'profile_missing';
  end if;

  select event.*
  into v_event
  from public.events as event
  where event.id = p_event_id
  for update;

  if not found then
    return 'event_not_found';
  end if;

  if v_actor_role <> 'admin' and v_event.organizer_id <> v_actor_id then
    return 'forbidden';
  end if;

  if v_event.end_at > pg_catalog.now() then
    return 'event_not_ended';
  end if;

  if p_attendance is null
    or p_attendance not in ('attended', 'no_show') then
    return 'invalid_attendance_status';
  end if;

  update public.registrations
  set attendance_status = p_attendance
  where event_id = p_event_id
    and attendee_id = p_attendee_id
    and status = 'registered';

  if not found then
    return 'registration_not_found';
  end if;

  return 'attendance_updated';
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user()
  from public, anon, authenticated;
revoke all on function public.register_for_event(uuid)
  from public, anon, authenticated;
revoke all on function public.cancel_event_registration(uuid)
  from public, anon, authenticated;
revoke all on function public.mark_event_attendance(
  uuid,
  uuid,
  public.attendance_status
) from public, anon, authenticated;

grant execute on function public.register_for_event(uuid) to authenticated;
grant execute on function public.cancel_event_registration(uuid) to authenticated;
grant execute on function public.mark_event_attendance(
  uuid,
  uuid,
  public.attendance_status
) to authenticated;
