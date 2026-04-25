-- ============================================================
-- TeamUp! — Migration 003 : Données de test
-- ============================================================
-- NOTE: Run this only in development. Creates an admin user and
-- sample terrains/events. Profiles are created via auth trigger,
-- so we insert directly into profiles for the seed admin user.

-- ── Sample terrains ──────────────────────────────────────────
INSERT INTO public.terrains (name, sport, address, district, lat, lng, price_hour, rating, amenities) VALUES
  ('Buttes Chaumont – Terrain A', 'basket', '1 Rue Botzaris, Paris', 'Paris 19e', 48.8793, 2.3818, 0, 4.7, ARRAY['lighting']),
  ('Buttes Chaumont – Terrain B', 'basket', '1 Rue Botzaris, Paris', 'Paris 19e', 48.8795, 2.3820, 0, 4.5, ARRAY['lighting']),
  ('Stade Léo Lagrange', 'foot', '68 Bd de la Villette, Paris', 'Paris 11e', 48.8716, 2.3684, 5.00, 4.2, ARRAY['showers','changing_rooms']),
  ('Parc de la Villette – Pelouse', 'foot', '211 Av Jean Jaurès, Paris', 'Paris 19e', 48.8938, 2.3923, 0, 4.0, ARRAY['lighting']),
  ('Tennis Club Nation', 'tennis', '120 Rue de la Fédération, Paris', 'Paris 12e', 48.8416, 2.3959, 15.00, 4.6, ARRAY['showers','pro_shop']),
  ('Padel Nation', 'padel', '45 Rue Olivier de Serres, Paris', 'Paris 15e', 48.8378, 2.3000, 20.00, 4.8, ARRAY['showers','equipment_rental']),
  ('Trocadéro – Sand Court', 'volley', 'Place du Trocadéro, Paris', 'Paris 16e', 48.8629, 2.2889, 0, 4.3, ARRAY['lighting'])
ON CONFLICT DO NOTHING;
