-- Migration 011: Expand amenities categories and seed deduplicated categorized hotel facilities
-- Drop strict check constraint if exists
ALTER TABLE amenities DROP CONSTRAINT IF EXISTS amenities_category_check;
ALTER TABLE amenities ALTER COLUMN category TYPE VARCHAR(50);

-- Insert or update deduplicated hotel amenities with standard categories:
-- 'basic', 'general', 'health', 'room', 'safety', 'common'
INSERT INTO amenities (id, title, description, icon_name, category, image_url, display_order, is_active)
VALUES
  ('wifi', 'Wi-Fi', 'Complimentary high-speed wireless internet access across all rooms and public hotel areas.', 'Wifi', 'basic', NULL, 1, true),
  ('room-service', 'Room Service', 'Courteous in-room food, beverage, and hospitality service delivered promptly to your room door.', 'ConciergeBell', 'basic', NULL, 2, true),
  ('air-conditioning', 'Air Conditioning', 'Individually climate-controlled air conditioning in every room ensuring a cool, pleasant atmosphere.', 'AirVent', 'basic', NULL, 3, true),
  ('power-backup', 'Power Backup', '24/7 dedicated generator power backup ensuring continuous lighting, ventilation, and device charging.', 'Zap', 'basic', NULL, 4, true),
  ('housekeeping', 'Housekeeping', 'Professional daily room cleaning, bed linen changes, sanitized bath upkeep, and trash removal.', 'Sparkles', 'basic', NULL, 5, true),
  ('guest-parking', 'Guest Parking', 'Secure on-site vehicle parking facility providing convenient and safe parking for registered guests.', 'Car', 'basic', NULL, 6, true),
  ('multilingual-staff', 'Multilingual Staff', 'Courteous front-line team fluent in Telugu, Hindi, and English to assist all travelers smoothly.', 'Globe2', 'general', NULL, 7, true),
  ('luggage-assistance', 'Luggage Assistance', 'Attentive luggage handling and secure storage support available during arrival and departure.', 'Luggage', 'general', NULL, 8, true),
  ('caretaker', 'Caretaker', 'Dedicated on-site property caretaker available 24/7 for prompt assistance and facility coordination.', 'UserCheck', 'general', NULL, 9, true),
  ('first-aid', 'First-aid Services', 'Equipped medical first-aid kit on-site with rapid support and coordination for emergency medical care.', 'HeartPulse', 'health', NULL, 10, true),
  ('mineral-water', 'Mineral Water', 'Complimentary packaged drinking mineral water bottles replenished daily in every guest room.', 'Droplets', 'room', NULL, 11, true),
  ('toiletries', 'Toiletries', 'Complimentary personal care bath kit with fresh soap, shampoo, and sanitized essentials.', 'Bath', 'room', NULL, 12, true),
  ('work-desk', 'Work Desk', 'Ergonomic work desk and chair setup with convenient charging outlets for corporate and remote work.', 'Laptop', 'room', NULL, 13, true),
  ('cctv', 'CCTV Surveillance', 'Continuous 24/7 closed-circuit camera monitoring across corridors, entrances, and common areas.', 'ShieldCheck', 'safety', NULL, 14, true),
  ('fire-extinguishers', 'Fire Extinguishers', 'Certified fire safety extinguishers strategically installed on every floor and common hallway.', 'Flame', 'safety', NULL, 15, true),
  ('reception', '24/7 Reception', 'Welcoming round-the-clock front desk providing quick check-in, express check-out, and city guidance.', 'Clock', 'common', NULL, 16, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
