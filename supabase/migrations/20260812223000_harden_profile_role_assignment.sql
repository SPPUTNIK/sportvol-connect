drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id and role = 'volunteer');
drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles for insert with check (auth.uid() = id and role = 'volunteer');
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (auth.uid() = id or is_admin()) with check ((auth.uid() = id and role = 'volunteer') or is_admin());
