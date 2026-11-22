INSERT INTO services (name, description, price, category, image_url, active)
SELECT v.name, v.description, v.price, v.category, v.image_url, true
FROM (VALUES
  ('Home Deep Cleaning',
   'Top-to-bottom cleaning of your home: floors, kitchen, bathrooms, windows and furniture, done by trained professionals with safe supplies.',
   1499, 'Cleaning',
   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'),
  ('Bathroom Cleaning',
   'Descaling, disinfecting and polishing of tiles, fittings, sinks and toilets for a spotless, hygienic bathroom.',
   599, 'Cleaning',
   'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'),
  ('Plumbing and Leak Repair',
   'Tap, pipe and drain repairs, leak fixing and fitting installation by an experienced plumber. Parts charged separately.',
   399, 'Plumbing',
   'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80'),
  ('Electrical Repair and Wiring',
   'Switchboard, fan, light and wiring repairs and installations by a certified electrician. Safety check included.',
   449, 'Electrical',
   'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'),
  ('AC Service and Repair',
   'Complete AC servicing with filter cleaning, gas check and performance testing. Split and window units covered.',
   699, 'Appliance Repair',
   'https://images.unsplash.com/photo-1631545806609-0a1d6b0f2a0a?auto=format&fit=crop&w=800&q=80'),
  ('Interior Wall Painting',
   'Neat interior painting with surface preparation, quality paint and a clean finish. Priced per room.',
   2999, 'Painting',
   'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80')
) AS v(name, description, price, category, image_url)
WHERE NOT EXISTS (SELECT 1 FROM services s WHERE s.name = v.name);
