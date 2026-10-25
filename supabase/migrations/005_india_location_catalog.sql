-- India-first structured event locations. Existing rows stay unassigned because
-- their country, state, city, and locality cannot be inferred safely.

create table public.india_admin_divisions (
  code text primary key,
  country_code text not null check (country_code = 'IN'),
  name text not null,
  kind text not null check (kind in ('state', 'union_territory')),
  constraint india_admin_divisions_country_code_unique unique (country_code, code),
  constraint india_admin_divisions_name_unique unique (country_code, name)
);

create table public.india_cities (
  id text primary key,
  country_code text not null default 'IN' check (country_code = 'IN'),
  division_code text not null,
  name text not null,
  constraint india_cities_division_city_unique unique (division_code, name),
  constraint india_cities_country_id_unique unique (country_code, id),
  constraint india_cities_division_fk
    foreign key (country_code, division_code)
    references public.india_admin_divisions (country_code, code)
    on update cascade on delete restrict
);

create index india_cities_division_name_idx
  on public.india_cities (division_code, name);

alter table public.india_admin_divisions enable row level security;
alter table public.india_cities enable row level security;

grant select on table public.india_admin_divisions to anon, authenticated;
grant select on table public.india_cities to anon, authenticated;

create policy india_admin_divisions_select_public
  on public.india_admin_divisions for select
  to anon, authenticated
  using (true);

create policy india_cities_select_public
  on public.india_cities for select
  to anon, authenticated
  using (true);

insert into public.india_admin_divisions (code, country_code, name, kind)
values
  ('IN-AP', 'IN', 'Andhra Pradesh', 'state'),
  ('IN-AR', 'IN', 'Arunachal Pradesh', 'state'),
  ('IN-AS', 'IN', 'Assam', 'state'),
  ('IN-BR', 'IN', 'Bihar', 'state'),
  ('IN-CG', 'IN', 'Chhattisgarh', 'state'),
  ('IN-GA', 'IN', 'Goa', 'state'),
  ('IN-GJ', 'IN', 'Gujarat', 'state'),
  ('IN-HR', 'IN', 'Haryana', 'state'),
  ('IN-HP', 'IN', 'Himachal Pradesh', 'state'),
  ('IN-JH', 'IN', 'Jharkhand', 'state'),
  ('IN-KA', 'IN', 'Karnataka', 'state'),
  ('IN-KL', 'IN', 'Kerala', 'state'),
  ('IN-MP', 'IN', 'Madhya Pradesh', 'state'),
  ('IN-MH', 'IN', 'Maharashtra', 'state'),
  ('IN-MN', 'IN', 'Manipur', 'state'),
  ('IN-ML', 'IN', 'Meghalaya', 'state'),
  ('IN-MZ', 'IN', 'Mizoram', 'state'),
  ('IN-NL', 'IN', 'Nagaland', 'state'),
  ('IN-OD', 'IN', 'Odisha', 'state'),
  ('IN-PB', 'IN', 'Punjab', 'state'),
  ('IN-RJ', 'IN', 'Rajasthan', 'state'),
  ('IN-SK', 'IN', 'Sikkim', 'state'),
  ('IN-TN', 'IN', 'Tamil Nadu', 'state'),
  ('IN-TS', 'IN', 'Telangana', 'state'),
  ('IN-TR', 'IN', 'Tripura', 'state'),
  ('IN-UP', 'IN', 'Uttar Pradesh', 'state'),
  ('IN-UK', 'IN', 'Uttarakhand', 'state'),
  ('IN-WB', 'IN', 'West Bengal', 'state'),
  ('IN-AN', 'IN', 'Andaman and Nicobar Islands', 'union_territory'),
  ('IN-CH', 'IN', 'Chandigarh', 'union_territory'),
  ('IN-DH', 'IN', 'Dadra and Nagar Haveli and Daman and Diu', 'union_territory'),
  ('IN-DL', 'IN', 'Delhi', 'union_territory'),
  ('IN-JK', 'IN', 'Jammu and Kashmir', 'union_territory'),
  ('IN-LA', 'IN', 'Ladakh', 'union_territory'),
  ('IN-LD', 'IN', 'Lakshadweep', 'union_territory'),
  ('IN-PY', 'IN', 'Puducherry', 'union_territory');

insert into public.india_cities (id, country_code, division_code, name)
values
  ('IN-AP-AMARAVATI', 'IN', 'IN-AP', 'Amaravati'),
  ('IN-AP-GUNTUR', 'IN', 'IN-AP', 'Guntur'),
  ('IN-AP-KURNOOL', 'IN', 'IN-AP', 'Kurnool'),
  ('IN-AP-TIRUPATI', 'IN', 'IN-AP', 'Tirupati'),
  ('IN-AP-VIJAYAWADA', 'IN', 'IN-AP', 'Vijayawada'),
  ('IN-AP-VISAKHAPATNAM', 'IN', 'IN-AP', 'Visakhapatnam'),
  ('IN-AR-ITANAGAR', 'IN', 'IN-AR', 'Itanagar'),
  ('IN-AR-NAHARLAGUN', 'IN', 'IN-AR', 'Naharlagun'),
  ('IN-AR-PASIGHAT', 'IN', 'IN-AR', 'Pasighat'),
  ('IN-AR-TAWANG', 'IN', 'IN-AR', 'Tawang'),
  ('IN-AS-DIBRUGARH', 'IN', 'IN-AS', 'Dibrugarh'),
  ('IN-AS-GUWAHATI', 'IN', 'IN-AS', 'Guwahati'),
  ('IN-AS-JORHAT', 'IN', 'IN-AS', 'Jorhat'),
  ('IN-AS-SILCHAR', 'IN', 'IN-AS', 'Silchar'),
  ('IN-BR-BHAGALPUR', 'IN', 'IN-BR', 'Bhagalpur'),
  ('IN-BR-GAYA', 'IN', 'IN-BR', 'Gaya'),
  ('IN-BR-MUZAFFARPUR', 'IN', 'IN-BR', 'Muzaffarpur'),
  ('IN-BR-PATNA', 'IN', 'IN-BR', 'Patna'),
  ('IN-CG-BHILAI', 'IN', 'IN-CG', 'Bhilai'),
  ('IN-CG-BILASPUR', 'IN', 'IN-CG', 'Bilaspur'),
  ('IN-CG-DURG', 'IN', 'IN-CG', 'Durg'),
  ('IN-CG-RAIPUR', 'IN', 'IN-CG', 'Raipur'),
  ('IN-GA-MARGAO', 'IN', 'IN-GA', 'Margao'),
  ('IN-GA-MAPUSA', 'IN', 'IN-GA', 'Mapusa'),
  ('IN-GA-PANAJI', 'IN', 'IN-GA', 'Panaji'),
  ('IN-GA-VASCO-DA-GAMA', 'IN', 'IN-GA', 'Vasco da Gama'),
  ('IN-GJ-AHMEDABAD', 'IN', 'IN-GJ', 'Ahmedabad'),
  ('IN-GJ-BHAVNAGAR', 'IN', 'IN-GJ', 'Bhavnagar'),
  ('IN-GJ-GANDHINAGAR', 'IN', 'IN-GJ', 'Gandhinagar'),
  ('IN-GJ-RAJKOT', 'IN', 'IN-GJ', 'Rajkot'),
  ('IN-GJ-SURAT', 'IN', 'IN-GJ', 'Surat'),
  ('IN-GJ-VADODARA', 'IN', 'IN-GJ', 'Vadodara'),
  ('IN-HR-AMBALA', 'IN', 'IN-HR', 'Ambala'),
  ('IN-HR-FARIDABAD', 'IN', 'IN-HR', 'Faridabad'),
  ('IN-HR-GURUGRAM', 'IN', 'IN-HR', 'Gurugram'),
  ('IN-HR-HISAR', 'IN', 'IN-HR', 'Hisar'),
  ('IN-HR-KARNAL', 'IN', 'IN-HR', 'Karnal'),
  ('IN-HR-PANIPAT', 'IN', 'IN-HR', 'Panipat'),
  ('IN-HP-DHARAMSHALA', 'IN', 'IN-HP', 'Dharamshala'),
  ('IN-HP-MANDI', 'IN', 'IN-HP', 'Mandi'),
  ('IN-HP-MANALI', 'IN', 'IN-HP', 'Manali'),
  ('IN-HP-SHIMLA', 'IN', 'IN-HP', 'Shimla'),
  ('IN-HP-SOLAN', 'IN', 'IN-HP', 'Solan'),
  ('IN-JH-BOKARO', 'IN', 'IN-JH', 'Bokaro'),
  ('IN-JH-DHANBAD', 'IN', 'IN-JH', 'Dhanbad'),
  ('IN-JH-JAMSHEDPUR', 'IN', 'IN-JH', 'Jamshedpur'),
  ('IN-JH-RANCHI', 'IN', 'IN-JH', 'Ranchi'),
  ('IN-KA-BELAGAVI', 'IN', 'IN-KA', 'Belagavi'),
  ('IN-KA-BENGALURU', 'IN', 'IN-KA', 'Bengaluru'),
  ('IN-KA-HUBBALLI', 'IN', 'IN-KA', 'Hubballi'),
  ('IN-KA-MANGALURU', 'IN', 'IN-KA', 'Mangaluru'),
  ('IN-KA-MYSURU', 'IN', 'IN-KA', 'Mysuru'),
  ('IN-KL-KANNUR', 'IN', 'IN-KL', 'Kannur'),
  ('IN-KL-KOCHI', 'IN', 'IN-KL', 'Kochi'),
  ('IN-KL-KOZHIKODE', 'IN', 'IN-KL', 'Kozhikode'),
  ('IN-KL-THRISSUR', 'IN', 'IN-KL', 'Thrissur'),
  ('IN-KL-THIRUVANANTHAPURAM', 'IN', 'IN-KL', 'Thiruvananthapuram'),
  ('IN-MP-BHOPAL', 'IN', 'IN-MP', 'Bhopal'),
  ('IN-MP-GWALIOR', 'IN', 'IN-MP', 'Gwalior'),
  ('IN-MP-INDORE', 'IN', 'IN-MP', 'Indore'),
  ('IN-MP-JABALPUR', 'IN', 'IN-MP', 'Jabalpur'),
  ('IN-MP-UJJAIN', 'IN', 'IN-MP', 'Ujjain'),
  ('IN-MH-AURANGABAD', 'IN', 'IN-MH', 'Chhatrapati Sambhajinagar'),
  ('IN-MH-KOLHAPUR', 'IN', 'IN-MH', 'Kolhapur'),
  ('IN-MH-MUMBAI', 'IN', 'IN-MH', 'Mumbai'),
  ('IN-MH-NAGPUR', 'IN', 'IN-MH', 'Nagpur'),
  ('IN-MH-NASHIK', 'IN', 'IN-MH', 'Nashik'),
  ('IN-MH-PUNE', 'IN', 'IN-MH', 'Pune'),
  ('IN-MH-THANE', 'IN', 'IN-MH', 'Thane'),
  ('IN-MN-CHURACHANDPUR', 'IN', 'IN-MN', 'Churachandpur'),
  ('IN-MN-IMPHAL', 'IN', 'IN-MN', 'Imphal'),
  ('IN-MN-THOUBAL', 'IN', 'IN-MN', 'Thoubal'),
  ('IN-ML-SHILLONG', 'IN', 'IN-ML', 'Shillong'),
  ('IN-ML-TURA', 'IN', 'IN-ML', 'Tura'),
  ('IN-MZ-AIZAWL', 'IN', 'IN-MZ', 'Aizawl'),
  ('IN-MZ-LUNGLEI', 'IN', 'IN-MZ', 'Lunglei'),
  ('IN-NL-DIMAPUR', 'IN', 'IN-NL', 'Dimapur'),
  ('IN-NL-KOHIMA', 'IN', 'IN-NL', 'Kohima'),
  ('IN-OD-BHUBANESWAR', 'IN', 'IN-OD', 'Bhubaneswar'),
  ('IN-OD-CUTTACK', 'IN', 'IN-OD', 'Cuttack'),
  ('IN-OD-PURI', 'IN', 'IN-OD', 'Puri'),
  ('IN-OD-ROURKELA', 'IN', 'IN-OD', 'Rourkela'),
  ('IN-OD-SAMBALPUR', 'IN', 'IN-OD', 'Sambalpur'),
  ('IN-PB-AMRITSAR', 'IN', 'IN-PB', 'Amritsar'),
  ('IN-PB-BATHINDA', 'IN', 'IN-PB', 'Bathinda'),
  ('IN-PB-JALANDHAR', 'IN', 'IN-PB', 'Jalandhar'),
  ('IN-PB-LUDHIANA', 'IN', 'IN-PB', 'Ludhiana'),
  ('IN-PB-MOHALI', 'IN', 'IN-PB', 'Sahibzada Ajit Singh Nagar'),
  ('IN-PB-PATIALA', 'IN', 'IN-PB', 'Patiala'),
  ('IN-RJ-AJMER', 'IN', 'IN-RJ', 'Ajmer'),
  ('IN-RJ-BIKANER', 'IN', 'IN-RJ', 'Bikaner'),
  ('IN-RJ-JAIPUR', 'IN', 'IN-RJ', 'Jaipur'),
  ('IN-RJ-JODHPUR', 'IN', 'IN-RJ', 'Jodhpur'),
  ('IN-RJ-KOTA', 'IN', 'IN-RJ', 'Kota'),
  ('IN-RJ-UDAIPUR', 'IN', 'IN-RJ', 'Udaipur'),
  ('IN-SK-GANGTOK', 'IN', 'IN-SK', 'Gangtok'),
  ('IN-SK-NAMCHI', 'IN', 'IN-SK', 'Namchi'),
  ('IN-TN-CHENNAI', 'IN', 'IN-TN', 'Chennai'),
  ('IN-TN-COIMBATORE', 'IN', 'IN-TN', 'Coimbatore'),
  ('IN-TN-MADURAI', 'IN', 'IN-TN', 'Madurai'),
  ('IN-TN-SALEM', 'IN', 'IN-TN', 'Salem'),
  ('IN-TN-TIRUCHIRAPPALLI', 'IN', 'IN-TN', 'Tiruchirappalli'),
  ('IN-TN-TIRUNELVELI', 'IN', 'IN-TN', 'Tirunelveli'),
  ('IN-TS-HYDERABAD', 'IN', 'IN-TS', 'Hyderabad'),
  ('IN-TS-KHAMMAM', 'IN', 'IN-TS', 'Khammam'),
  ('IN-TS-KARIMNAGAR', 'IN', 'IN-TS', 'Karimnagar'),
  ('IN-TS-NIZAMABAD', 'IN', 'IN-TS', 'Nizamabad'),
  ('IN-TS-WARANGAL', 'IN', 'IN-TS', 'Warangal'),
  ('IN-TR-AGARTALA', 'IN', 'IN-TR', 'Agartala'),
  ('IN-TR-DHARMANAGAR', 'IN', 'IN-TR', 'Dharmanagar'),
  ('IN-TR-UDAIPUR', 'IN', 'IN-TR', 'Udaipur'),
  ('IN-UP-AGRA', 'IN', 'IN-UP', 'Agra'),
  ('IN-UP-GHAZIABAD', 'IN', 'IN-UP', 'Ghaziabad'),
  ('IN-UP-GORAKHPUR', 'IN', 'IN-UP', 'Gorakhpur'),
  ('IN-UP-KANPUR', 'IN', 'IN-UP', 'Kanpur'),
  ('IN-UP-LUCKNOW', 'IN', 'IN-UP', 'Lucknow'),
  ('IN-UP-NOIDA', 'IN', 'IN-UP', 'Noida'),
  ('IN-UP-PRAYAGRAJ', 'IN', 'IN-UP', 'Prayagraj'),
  ('IN-UP-VARANASI', 'IN', 'IN-UP', 'Varanasi'),
  ('IN-UK-DEHRADUN', 'IN', 'IN-UK', 'Dehradun'),
  ('IN-UK-HALDWANI', 'IN', 'IN-UK', 'Haldwani'),
  ('IN-UK-HARIDWAR', 'IN', 'IN-UK', 'Haridwar'),
  ('IN-UK-NAINITAL', 'IN', 'IN-UK', 'Nainital'),
  ('IN-UK-RISHIKESH', 'IN', 'IN-UK', 'Rishikesh'),
  ('IN-WB-ASANSOL', 'IN', 'IN-WB', 'Asansol'),
  ('IN-WB-DARJEELING', 'IN', 'IN-WB', 'Darjeeling'),
  ('IN-WB-DURGAPUR', 'IN', 'IN-WB', 'Durgapur'),
  ('IN-WB-HOWRAH', 'IN', 'IN-WB', 'Howrah'),
  ('IN-WB-KOLKATA', 'IN', 'IN-WB', 'Kolkata'),
  ('IN-WB-SILIGURI', 'IN', 'IN-WB', 'Siliguri'),
  ('IN-AN-SRI-VIJAYA-PURAM', 'IN', 'IN-AN', 'Sri Vijaya Puram'),
  ('IN-CH-CHANDIGARH', 'IN', 'IN-CH', 'Chandigarh'),
  ('IN-DH-DAMAN', 'IN', 'IN-DH', 'Daman'),
  ('IN-DH-SILVASSA', 'IN', 'IN-DH', 'Silvassa'),
  ('IN-DL-DELHI', 'IN', 'IN-DL', 'Delhi'),
  ('IN-JK-JAMMU', 'IN', 'IN-JK', 'Jammu'),
  ('IN-JK-SRINAGAR', 'IN', 'IN-JK', 'Srinagar'),
  ('IN-LA-KARGIL', 'IN', 'IN-LA', 'Kargil'),
  ('IN-LA-LEH', 'IN', 'IN-LA', 'Leh'),
  ('IN-LD-KAVARATTI', 'IN', 'IN-LD', 'Kavaratti'),
  ('IN-PY-KARAIKAL', 'IN', 'IN-PY', 'Karaikal'),
  ('IN-PY-MAHE', 'IN', 'IN-PY', 'Mahe'),
  ('IN-PY-PUDUCHERRY', 'IN', 'IN-PY', 'Puducherry'),
  ('IN-PY-YANAM', 'IN', 'IN-PY', 'Yanam');

alter table public.events
  add column country_code text,
  add column city_id text,
  add column locality text,
  add constraint events_country_code_supported
    check (country_code is null or country_code = 'IN'),
  add constraint events_city_requires_india_country
    check (city_id is null or country_code = 'IN'),
  add constraint events_city_fk
    foreign key (country_code, city_id)
    references public.india_cities (country_code, id)
    on update cascade on delete restrict,
  add constraint events_locality_length
    check (locality is null or char_length(locality) <= 120);

create index events_country_city_idx on public.events (country_code, city_id);

create or replace function public.update_owned_event(
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
    'title', 'description', 'category', 'venue_name', 'address',
    'latitude', 'longitude', 'start_at', 'end_at', 'price', 'currency',
    'capacity', 'registration_deadline', 'image_url', 'publish',
    'city_id', 'locality'
  ];
begin
  if v_actor_id is null then
    return 'unauthenticated';
  end if;
  if p_changes is null or pg_catalog.jsonb_typeof(p_changes) <> 'object'
    or p_changes = '{}'::jsonb then
    return 'invalid_changes';
  end if;
  if exists (
    select 1
    from pg_catalog.jsonb_object_keys(p_changes) as change_key(key_name)
    where not (change_key.key_name = any(v_allowed_keys))
  ) then
    return 'invalid_changes';
  end if;

  select profile.role into v_actor_role
  from public.profiles as profile where profile.id = v_actor_id;
  if v_actor_role is null then return 'profile_missing'; end if;

  select event.* into v_event
  from public.events as event where event.id = p_event_id for update;
  if not found then return 'event_not_found'; end if;
  if v_event.organizer_id <> v_actor_id and v_actor_role <> 'admin' then
    return 'forbidden';
  end if;
  if v_event.status = 'cancelled' then return 'event_cancelled'; end if;

  select pg_catalog.count(*) into v_active_count
  from public.registrations as registration
  where registration.event_id = p_event_id and registration.status = 'registered';
  if p_changes ? 'capacity'
    and (p_changes ->> 'capacity')::integer < v_active_count then
    return 'capacity_below_registrations';
  end if;

  update public.events as event
  set
    title = case when p_changes ? 'title' then p_changes ->> 'title' else event.title end,
    description = case when p_changes ? 'description' then p_changes ->> 'description' else event.description end,
    category = case when p_changes ? 'category' then p_changes ->> 'category' else event.category end,
    venue_name = case when p_changes ? 'venue_name' then p_changes ->> 'venue_name' else event.venue_name end,
    address = case when p_changes ? 'address' then p_changes ->> 'address' else event.address end,
    latitude = case when p_changes ? 'latitude' then (p_changes ->> 'latitude')::double precision else event.latitude end,
    longitude = case when p_changes ? 'longitude' then (p_changes ->> 'longitude')::double precision else event.longitude end,
    start_at = case when p_changes ? 'start_at' then (p_changes ->> 'start_at')::timestamptz else event.start_at end,
    end_at = case when p_changes ? 'end_at' then (p_changes ->> 'end_at')::timestamptz else event.end_at end,
    price = case when p_changes ? 'price' then (p_changes ->> 'price')::numeric else event.price end,
    currency = case when p_changes ? 'currency' then p_changes ->> 'currency' else event.currency end,
    capacity = case when p_changes ? 'capacity' then (p_changes ->> 'capacity')::integer else event.capacity end,
    registration_deadline = case when p_changes ? 'registration_deadline'
      then (p_changes ->> 'registration_deadline')::timestamptz else event.registration_deadline end,
    image_url = case when p_changes ? 'image_url' then p_changes ->> 'image_url' else event.image_url end,
    country_code = case when p_changes ? 'city_id' then 'IN' else event.country_code end,
    city_id = case when p_changes ? 'city_id' then p_changes ->> 'city_id' else event.city_id end,
    locality = case when p_changes ? 'locality' then p_changes ->> 'locality' else event.locality end,
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
    or v_updated.city_id is distinct from v_event.city_id
    or v_updated.locality is distinct from v_event.locality
    or v_updated.status is distinct from v_event.status then
    insert into public.notifications (recipient_id, event_id, type, title, message)
    select registration.attendee_id, p_event_id, 'event_updated',
      'Event updated', 'An event you registered for has been updated.'
    from public.registrations as registration
    where registration.event_id = p_event_id
      and registration.status = 'registered';
  end if;
  return 'updated';
end;
$$;

create function public.search_public_events_by_location(
  p_query text,
  p_category text,
  p_date_from timestamptz,
  p_date_to timestamptz,
  p_max_price numeric,
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km double precision,
  p_page integer,
  p_page_size integer,
  p_state_code text,
  p_city_id text,
  p_locality text
)
returns jsonb
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  with filtered as (
    select event.*, city.name as city_name,
      division.code as state_code, division.name as state_name,
      division.kind as state_kind
    from public.events as event
    left join public.india_cities as city
      on city.id = event.city_id and city.country_code = event.country_code
    left join public.india_admin_divisions as division
      on division.code = city.division_code and division.country_code = city.country_code
    where event.status = 'published'
      and event.end_at > pg_catalog.now()
      and (
        p_query is null
        or pg_catalog.strpos(
          pg_catalog.lower(event.title || ' ' || event.description || ' ' ||
            coalesce(event.locality, '') || ' ' || coalesce(city.name, '') || ' ' ||
            coalesce(division.name, '')),
          pg_catalog.lower(pg_catalog.btrim(p_query))
        ) > 0
      )
      and (p_category is null or event.category = p_category)
      and (p_date_from is null or event.start_at >= p_date_from)
      and (p_date_to is null or event.start_at <= p_date_to)
      and (p_max_price is null or event.price <= p_max_price)
      and (p_state_code is null or division.code = p_state_code)
      and (p_city_id is null or city.id = p_city_id)
      and (p_locality is null or pg_catalog.lower(pg_catalog.btrim(event.locality))
        = pg_catalog.lower(pg_catalog.btrim(p_locality)))
      and (
        p_latitude is null or p_longitude is null or p_radius_km is null
        or (
          event.latitude is not null and event.longitude is not null
          and 6371 * 2 * pg_catalog.asin(pg_catalog.sqrt(least(1.0, greatest(0.0,
            pg_catalog.sin(pg_catalog.radians(event.latitude - p_latitude) / 2) ^ 2
            + pg_catalog.cos(pg_catalog.radians(p_latitude))
            * pg_catalog.cos(pg_catalog.radians(event.latitude))
            * pg_catalog.sin(pg_catalog.radians(event.longitude - p_longitude) / 2) ^ 2
          )))) <= p_radius_km
        )
      )
  ),
  page_rows as (
    select filtered.* from filtered
    order by filtered.start_at, filtered.id
    limit p_page_size offset (p_page - 1) * p_page_size
  )
  select pg_catalog.jsonb_build_object(
    'events',
    coalesce((select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(page_rows)) from page_rows), '[]'::jsonb),
    'total', (select pg_catalog.count(*) from filtered)
  );
$$;

revoke all on function public.search_public_events_by_location(
  text, text, timestamptz, timestamptz, numeric, double precision,
  double precision, double precision, integer, integer, text, text, text
) from public, anon, authenticated;
grant execute on function public.search_public_events_by_location(
  text, text, timestamptz, timestamptz, numeric, double precision,
  double precision, double precision, integer, integer, text, text, text
) to anon, authenticated;

revoke all on function public.update_owned_event(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.update_owned_event(uuid, jsonb) to authenticated;
