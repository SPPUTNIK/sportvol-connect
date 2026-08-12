-- Seed initial reference data for SportVol Morocco

insert into sports (name)
values
  ('Football'),
  ('Basketball'),
  ('Tennis'),
  ('Athletics'),
  ('Marathon'),
  ('Cycling'),
  ('Swimming'),
  ('Motorsport'),
  ('Other')
on conflict (name) do nothing;

insert into skills (name)
values
  ('Communication'),
  ('Photography'),
  ('First Aid'),
  ('Event Management'),
  ('Logistics'),
  ('IT'),
  ('Social Media')
on conflict (name) do nothing;

insert into languages (name)
values
  ('Arabic'),
  ('English'),
  ('French'),
  ('Spanish'),
  ('Portuguese'),
  ('German'),
  ('Other')
on conflict (name) do nothing;
