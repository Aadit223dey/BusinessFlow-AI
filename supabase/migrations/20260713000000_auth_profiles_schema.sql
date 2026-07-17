-- Create public.profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  tenant_id uuid,
  role text not null default 'STAFF' check (role in ('ADMIN', 'MANAGER', 'STAFF')),
  first_name text,
  last_name text,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for RLS
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Create a profile trigger for auto-provisioning
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, role, tenant_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'STAFF'),
    case 
      when (new.raw_user_meta_data->>'tenant_id') is not null then (new.raw_user_meta_data->>'tenant_id')::uuid
      else null
    end
  );
  return new;
end;
$$ language plpgsql;

-- Set up trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
