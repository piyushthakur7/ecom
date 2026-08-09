-- Seed Data for Categories
INSERT INTO public.categories (id, name, slug, count, src, alt) VALUES
('cat-1', 'Kurti', 'kurti', '48 styles', 'https://images.unsplash.com/photo-1610048869310-d889ff25c374?q=80&w=900&auto=format&fit=crop', 'Kurti — category photo'),
('cat-2', 'Tops', 'tops', '22 styles', 'https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?q=80&w=900&auto=format&fit=crop', 'Tops — category photo'),
('cat-3', 'Suits', 'suits', '32 styles', 'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?q=80&w=900&auto=format&fit=crop', 'Suits — category photo'),
('cat-4', 'Unstitched Suits', 'unstitched-suits', '19 styles', 'https://images.unsplash.com/photo-1668371679302-a8ec781e876e?q=80&w=900&auto=format&fit=crop', 'Unstitched Suits — category photo'),
('cat-5', 'Anarkali', 'anarkali', '27 styles', 'https://images.unsplash.com/photo-1745482036066-5d215ed6b910?q=80&w=900&auto=format&fit=crop', 'Anarkali — category photo'),
('cat-6', 'Dresses', 'dresses', '18 styles', 'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?q=80&w=900&auto=format&fit=crop', 'Dresses — category photo'),
('cat-7', 'Plazzo', 'plazzo', '14 styles', 'https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=900&auto=format&fit=crop', 'Plazzo — category photo')
ON CONFLICT (id) DO NOTHING;

-- Seed Data for Hero Banner Slides
INSERT INTO public.hero_slides (id, src, alt, link, order_index) VALUES
('slide-1', '/images/hero/banner-1.jpg', 'Experience The Best Quality — Festive Collection', '#featured', 1),
('slide-2', '/images/hero/banner-2.jpg', 'Discover Hand-Block Printed Cotton & Silk Blend Suits', '/category/suits', 2),
('slide-3', '/images/hero/banner-3.jpg', 'Premium Fabrics & Craftsmanship — Kurtis, Plazos & Suits', '/category/kurti', 3)
ON CONFLICT (id) DO NOTHING;

-- Seed Data for Products
INSERT INTO public.products (id, name, slug, price, original_price, rating, reviews_count, category_slug, badge, images, sizes, stock, description) VALUES
('prod-1', 'Block-print Mul Kurti — Brick', 'block-print-mul-kurti-brick', 849, 1099, 4.7, 312, 'kurti', 'Highly Purchased', '["https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1610048869310-d889ff25c374?q=80&w=900&auto=format&fit=crop"]', '["XS","S","M","L","XL","XXL"]', 45, 'Hand block-printed on soft mul cotton. Slightly oversized silhouette with side slits.'),
('prod-2', 'Chanderi Co-ord Set — Rose', 'chanderi-co-ord-set-rose', 1399, 1649, 4.5, 187, 'suits', 'Trending', '["https://images.unsplash.com/photo-1668371679302-a8ec781e876e?q=80&w=900&auto=format&fit=crop","https://images.unsplash.com/photo-1668371459824-094a960a227d?q=80&w=900&auto=format&fit=crop"]', '["XS","S","M","L","XL"]', 30, 'Luxurious chanderi fabric in a delicate rose hue. Includes straight-cut kurta and palazzo.'),
('prod-3', 'Cotton Salwar Suit — Ivory', 'cotton-salwar-suit-ivory', 1299, 1299, 4.3, 94, 'suits', null, '["https://images.unsplash.com/photo-1668371459824-094a960a227d?q=80&w=900&auto=format&fit=crop"]', '["S","M","L","XL"]', 20, 'Pure cotton salwar suit in a pristine ivory shade. Includes kurta, salwar, and dupatta.'),
('prod-4', 'Handloom Saree — Mustard', 'handloom-saree-mustard', 1499, 1899, 4.8, 142, 'dresses', 'Bestseller', '["https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?q=80&w=900&auto=format&fit=crop"]', '["Free Size"]', 15, 'Woven by master weavers in Bengal. Features Zari borders and a lightweight drape.')
ON CONFLICT (id) DO NOTHING;
