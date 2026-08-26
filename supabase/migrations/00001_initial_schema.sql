-- Create organizations table
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create organization_members table
create table public.organization_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(org_id, user_id)
);

-- Create profiles table (1:1 with auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create clients table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  created_by uuid references auth.users(id) on delete set null,
  first_name text,
  last_name text,
  company_name text,
  email text,
  mobile_number text,
  address text,
  country text not null,
  state_province text,
  postal_code text,
  send_payment_reminders boolean default false,
  charge_late_fees boolean default false,
  currency_and_language text default 'USD, English',
  invoice_attachments boolean default false,
  status text default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure at least name or company is provided
  check (
    (first_name is not null and last_name is not null) or 
    (company_name is not null)
  )
);

-- RLS setup
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;

-- Security Definer function to check org membership without recursion
create or replace function public.is_org_member(check_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organization_members
    where org_id = check_org_id
    and user_id = auth.uid()
  );
$$;

-- RLS Policies

-- Profiles: Users can read and update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Organizations: Users can view orgs they belong to
create policy "Users can view their organizations" on public.organizations 
for select using (is_org_member(id));

-- Organization Members: Users can view members of their orgs
create policy "Users can view members of their orgs" on public.organization_members 
for select using (is_org_member(org_id));

-- Clients: Users can perform all operations on clients in their orgs
create policy "Users can view clients in their orgs" on public.clients 
for select using (is_org_member(org_id));

create policy "Users can insert clients in their orgs" on public.clients 
for insert with check (is_org_member(org_id));

create policy "Users can update clients in their orgs" on public.clients 
for update using (is_org_member(org_id));

create policy "Users can delete clients in their orgs" on public.clients 
for delete using (is_org_member(org_id));

-- Trigger to create a profile and personal organization when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_org_id uuid;
begin
  -- 1. Create Profile
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- 2. Create Personal Organization
  insert into public.organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)) || '''s Team',
    gen_random_uuid()::text -- simple unique slug
  )
  returning id into new_org_id;

  -- 3. Add user as owner of the new organization
  insert into public.organization_members (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
