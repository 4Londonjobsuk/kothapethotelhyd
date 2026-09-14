-- Migration 002: Create Indexes
-- Project: Lotus Grand Hotel
-- Description: Performance and ordered retrieval indexes

CREATE INDEX IF NOT EXISTS idx_rooms_active_order 
  ON rooms (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_amenities_category_order 
  ON amenities (category, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_attractions_active_order 
  ON attractions (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_gallery_categories_active_order 
  ON gallery_categories (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_gallery_images_cat_order 
  ON gallery_images (category_id, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_gallery_images_featured 
  ON gallery_images (is_featured, is_active);

CREATE INDEX IF NOT EXISTS idx_enquiries_status_created 
  ON enquiries (status, created_at DESC);
