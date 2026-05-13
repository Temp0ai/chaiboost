-- ChaiBoost Seed Data
-- Run: psql -U postgres -d chaiboost -f seed.sql

-- Sample user (password: "test123" hashed with bcrypt)
INSERT INTO users (id, email, phone, password_hash, full_name, preferred_lang, is_premium, premium_tier)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'arjun@chaiboost.demo',
    '+919876543210',
    '$2b$10$rQZ8K8PBGqcmFPC5JvQzMOeXKwNJSxGMxKJGqVP3Z7GkJKzLqzLqC',
    'Arjun Sharma',
    'en',
    true,
    'pro'
);

-- Sample business
INSERT INTO businesses (id, user_id, name, category, description, city, country, timezone, brand_colors)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Arjun''s Chai Corner',
    'tea_shop',
    'Authentic masala chai and snacks in the heart of Mumbai. Family recipe since 1985.',
    'Mumbai',
    'India',
    'Asia/Kolkata',
    '{"primary": "#8B4513", "accent": "#FFD700", "bg": "#FFF8F0"}'
);

-- Sample content
INSERT INTO content_pieces (id, business_id, content_type, status, title, caption, hashtags, source_type)
VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'image',
    'published',
    'Morning Masala Chai',
    'Start your day with the warmth of authentic masala chai ☕✨',
    ARRAY['#chai', '#masalachai', '#tealovers', '#mumbaifood', '#chailover', '#morningchai'],
    'ai_generated'
);

-- Sample hashtags
INSERT INTO hashtag_cache (hashtag, category, post_count, trend_score, trend_direction, relevance_score)
VALUES
    ('#chai', 'tea', 12500000, 85.5, 'stable', 1.0),
    ('#masalachai', 'chai', 3200000, 78.2, 'rising', 1.0),
    ('#tealovers', 'tea', 8900000, 72.1, 'stable', 1.0),
    ('#chailover', 'chai', 2100000, 68.4, 'rising', 1.0),
    ('#teatime', 'tea', 6700000, 65.0, 'stable', 0.9),
    ('#chaiaddict', 'chai', 890000, 62.3, 'rising', 1.0),
    ('#indianchai', 'chai', 540000, 58.7, 'rising', 1.0),
    ('#streetchai', 'chai', 420000, 55.2, 'stable', 1.0),
    ('#kulhadchai', 'chai', 310000, 52.8, 'rising', 1.0),
    ('#greentea', 'tea', 4500000, 70.1, 'stable', 0.8),
    ('#foodie', 'food', 45000000, 90.0, 'stable', 0.5),
    ('#instafood', 'food', 38000000, 88.5, 'stable', 0.5);
