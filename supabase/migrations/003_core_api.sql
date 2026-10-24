-- Core API support: safe event search, organizer mutations, and role upgrade.

create function public.search_public_events(
  p_query text,
  p_category text,
  p_date_from timestamptz,
  p_date_to timestamptz,
  p_max_price numeric,
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km double precision,
  p_page integer,
  p_page_size integer
)
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  with filtered as (
    select event.*
    from public.events as event
    where event.status = 'published'
      and event.end_at > pg_catalog.now()
      and (
        p_query is null
        or pg_catalog.strpos(
          pg_catalog.lower(event.title || ' ' || event.description),
          pg_catalog.lower(pg_catalog.btrim(p_query))
        ) > 0
      )
      and (p_category is null or event.category = p_category)
      and (p_date_from is null or event.start_at >= p_date_from)
      and (p_date_to is null or event.start_at <= p_date_to)
      and (p_max_price is null or event.price <= p_max_price)
      and (
        p_latitude is null
        or p_longitude is null
        or p_radius_km is null
        or (
          event.latitude is not null
          and event.longitude is not null
          and 6371 * 2 * pg_catalog.asin(
            pg_catalog.sqrt(
              least(
                1.0,
                greatest(
                  0.0,
                  pg_catalog.sin(
                    pg_catalog.radians(event.latitude - p_latitude) / 2
                  ) ^ 2
                  + pg_catalog.cos(pg_catalog.radians(p_latitude))
                  * pg_catalog.cos(pg_catalog.radians(event.latitude))
                  * pg_catalog.sin(
                    pg_catalog.radians(event.longitude - p_longitude) / 2
                  ) ^ 2
                )
              )
            )
          ) <= p_radius_km
        )
      )
  ),
  page_rows as (
    select filtered.*
    from filtered
    order by filtered.start_at, filtered.id
    limit p_page_size
    offset (p_page - 1) * p_page_size
  )
  select pg_catalog.jsonb_build_object(
    'events',
    coalesce(
      (select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(page_rows)) from page_rows),
      '[]'::jsonb
    ),
    'total',
    (select pg_catalog.count(*) from filtered)
  );
$$;

revoke all on function public.search_public_events(
  text,
  text,
  timestamptz,
  timestamptz,
  numeric,
  double precision,
  double precision,
  double precision,
  integer,
  integer
) from public, anon, authenticated;
grant execute on function public.search_public_events(
  text,
  text,
  timestamptz,
  timestamptz,
  numeric,
  double precision,
  double precision,
  double precision,
  integer,
  integer
) to anon, authenticated;

create function public.become_organizer()
returns text
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role public.user_role;
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;

  select profile.role
  into v_role
  from public.profiles as profile
  where profile.id = v_actor_id
  for update;

  if not found then
    return 'profile_missing';
  end if;

  if v_role = 'organizer' then
    return 'already_organizer';
  end if;

  if v_role <> 'attendee' then
    return 'not_allowed';
  end if;

  update public.profiles
  set role = 'organizer'
  where id = v_actor_id
    and role = 'attendee';

  return 'promoted';
end;
$$;

create function public.update_owned_event(
  p_event_id uuid,
  p_changes jsonb
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
  v_updated public.events%rowtype;
  v_active_count bigint;
  v_allowed_keys constant text[] := array[
    'title',
    'description',
    'category',
    'venue_name',
    'address',
    'latitude',
    'longitude',
    'start_at',
    'end_at',
    'price',
    'currency',
    'capacity',
    'registration_deadline',
    'image_url',
    'publish'
  ];
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;

  if p_changes is null or pg_catalog.jsonb_typeof(p_changes) <> 'object' then
    return 'invalid_changes';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_object_keys(p_changes) as change_key(key_name)
    where not (change_key.key_name = any(v_allowed_keys))
  ) then
    return 'invalid_changes';
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

  if v_event.organizer_id <> v_actor_id and v_actor_role <> 'admin' then
    return 'forbidden';
  end if;

  if v_event.status = 'cancelled' then
    return 'event_cancelled';
  end if;

  select pg_catalog.count(*)
  into v_active_count
  from public.registrations as registration
  where registration.event_id = p_event_id
    and registration.status = 'registered';

  if p_changes ? 'capacity'
    and (p_changes ->> 'capacity')::integer < v_active_count then
    return 'capacity_below_registrations';
  end if;

  update public.events as event
  set
    title = case when p_changes ? 'title'
      then p_changes ->> 'title' else event.title end,
    description = case when p_changes ? 'description'
      then p_changes ->> 'description' else event.description end,
    category = case when p_changes ? 'category'
      then p_changes ->> 'category' else event.category end,
    venue_name = case when p_changes ? 'venue_name'
      then p_changes ->> 'venue_name' else event.venue_name end,
    address = case when p_changes ? 'address'
      then p_changes ->> 'address' else event.address end,
    latitude = case when p_changes ? 'latitude'
      then (p_changes ->> 'latitude')::double precision else event.latitude end,
    longitude = case when p_changes ? 'longitude'
      then (p_changes ->> 'longitude')::double precision else event.longitude end,
    start_at = case when p_changes ? 'start_at'
      then (p_changes ->> 'start_at')::timestamptz else event.start_at end,
    end_at = case when p_changes ? 'end_at'
      then (p_changes ->> 'end_at')::timestamptz else event.end_at end,
    price = case when p_changes ? 'price'
      then (p_changes ->> 'price')::numeric else event.price end,
    currency = case when p_changes ? 'currency'
      then p_changes ->> 'currency' else event.currency end,
    capacity = case when p_changes ? 'capacity'
      then (p_changes ->> 'capacity')::integer else event.capacity end,
    registration_deadline = case when p_changes ? 'registration_deadline'
      then (p_changes ->> 'registration_deadline')::timestamptz
      else event.registration_deadline end,
    image_url = case when p_changes ? 'image_url'
      then p_changes ->> 'image_url' else event.image_url end,
    status = case when p_changes -> 'publish' = 'true'::jsonb
      then 'published'::public.event_status else event.status end
  where event.id = p_event_id
  returning event.* into v_updated;

  if v_updated.title is distinct from v_event.title
    or v_updated.description is distinct from v_event.description
    or v_updated.category is distinct from v_event.category
    or v_updated.venue_name is distinct from v_event.venue_name
    or v_updated.address is distinct from v_event.address
    or v_updated.latitude is distinct from v_event.latitude
    or v_updated.longitude is distinct from v_event.longitude
    or v_updated.start_at is distinct from v_event.start_at
    or v_updated.end_at is distinct from v_event.end_at
    or v_updated.price is distinct from v_event.price
    or v_updated.currency is distinct from v_event.currency
    or v_updated.capacity is distinct from v_event.capacity
    or v_updated.registration_deadline is distinct from v_event.registration_deadline
    or v_updated.image_url is distinct from v_event.image_url
    or v_updated.status is distinct from v_event.status then
    insert into public.notifications (
      recipient_id,
      event_id,
      type,
      title,
      message
    )
    select
      registration.attendee_id,
      p_event_id,
      'event_updated',
      'Event updated',
      'An event you registered for has been updated.'
    from public.registrations as registration
    where registration.event_id = p_event_id
      and registration.status = 'registered';
  end if;

  return 'updated';
end;
$$;

create function public.cancel_owned_event(p_event_id uuid)
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

  if v_event.organizer_id <> v_actor_id and v_actor_role <> 'admin' then
    return 'forbidden';
  end if;

  if v_event.status = 'cancelled' then
    return 'already_cancelled';
  end if;

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
  select
    registration.attendee_id,
    p_event_id,
    'event_cancelled',
    'Event cancelled',
    'An event you registered for has been cancelled.'
  from public.registrations as registration
  where registration.event_id = p_event_id
    and registration.status = 'registered';

  return 'cancelled';
end;
$$;

revoke all on function public.become_organizer()
  from public, anon, authenticated;
revoke all on function public.update_owned_event(uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.cancel_owned_event(uuid)
  from public, anon, authenticated;

grant execute on function public.become_organizer() to authenticated;
grant execute on function public.update_owned_event(uuid, jsonb)
  to authenticated;
grant execute on function public.cancel_owned_event(uuid)
  to authenticated;
