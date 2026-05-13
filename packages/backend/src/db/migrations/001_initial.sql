-- ChaiBoost Database Schema
-- Run: psql -U postgres -d chaiboost -f 001_initial.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255),
    full_name       VARCHAR(100) NOT NULL,
    preferred_lang  VARCHAR(5) DEFAULT 'en',
    avatar_url      TEXT,
    is_premium      BOOLEAN DEFAULT FALSE,
    premium_tier    VARCHAR(20) DEFAULT 'free',
    premium_expires_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_auth_providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(20) NOT NULL,
    provider_uid    VARCHAR(255) NOT NULL,
    access_token    TEXT,
    refresh_token   TEXT,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_uid)
);

-- =============================================
-- BUSINESS PROFILES
-- =============================================
CREATE TABLE businesses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(100),
    description     TEXT,
    logo_url        TEXT,
    brand_colors    JSONB DEFAULT '{}',
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(50),
    timezone        VARCHAR(50) DEFAULT 'Asia/Kolkata',
    phone           VARCHAR(20),
    website         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE connected_platforms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
    platform        VARCHAR(30) NOT NULL,
    platform_user_id VARCHAR(255),
    platform_username VARCHAR(255),
    access_token    TEXT,
    refresh_token   TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes          TEXT[],
    status          VARCHAR(20) DEFAULT 'active',
    connected_at    TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at  TIMESTAMPTZ,
    UNIQUE(business_id, platform)
);

-- =============================================
-- BRAND KIT
-- =============================================
CREATE TABLE brand_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
    asset_type      VARCHAR(20) NOT NULL,
    file_url        TEXT NOT NULL,
    file_size_kb    INTEGER,
    width           INTEGER,
    height          INTEGER,
    is_primary      BOOLEAN DEFAULT FALSE,
    tags            TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONTENT & POSTS
-- =============================================
CREATE TABLE content_pieces (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
    content_type    VARCHAR(30) NOT NULL,
    status          VARCHAR(20) DEFAULT 'draft',
    title           VARCHAR(300),
    caption         TEXT,
    hashtags        TEXT[],
    media_urls      TEXT[],
    thumbnail_url   TEXT,
    template_id     VARCHAR(50),
    ai_prompt_used  TEXT,
    source_type     VARCHAR(20),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scheduled_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id      UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
    platform        VARCHAR(30) NOT NULL,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    published_at    TIMESTAMPTZ,
    platform_post_id VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'pending',
    retry_count     INTEGER DEFAULT 0,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_posts_pending
    ON scheduled_posts(scheduled_at)
    WHERE status = 'pending';

-- =============================================
-- REVIEWS & ENGAGEMENT
-- =============================================
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
    platform        VARCHAR(30) NOT NULL,
    platform_review_id VARCHAR(255),
    reviewer_name   VARCHAR(200),
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    review_text     TEXT,
    sentiment       VARCHAR(10),
    sentiment_score FLOAT,
    themes          TEXT[],
    response_text   TEXT,
    response_status VARCHAR(20) DEFAULT 'pending',
    responded_at    TIMESTAMPTZ,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, platform_review_id)
);

-- =============================================
-- TRENDS & HASHTAGS
-- =============================================
CREATE TABLE hashtag_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hashtag         VARCHAR(100) UNIQUE NOT NULL,
    category        VARCHAR(50),
    post_count      BIGINT,
    trend_score     FLOAT,
    trend_direction VARCHAR(10),
    relevance_score FLOAT,
    last_updated    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trending_topics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic           VARCHAR(200) NOT NULL,
    platform        VARCHAR(30),
    category        VARCHAR(50),
    source          VARCHAR(50),
    score           FLOAT,
    related_hashtags TEXT[],
    content_ideas   TEXT[],
    detected_at     TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

-- =============================================
-- ANALYTICS
-- =============================================
CREATE TABLE analytics_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id     UUID REFERENCES businesses(id) ON DELETE CASCADE,
    platform        VARCHAR(30) NOT NULL,
    snapshot_date   DATE NOT NULL,
    metrics         JSONB NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, platform, snapshot_date)
);

-- =============================================
-- AI USAGE TRACKING
-- =============================================
CREATE TABLE ai_usage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    action          VARCHAR(50) NOT NULL,
    model_used      VARCHAR(50),
    tokens_consumed INTEGER,
    cost_cents      INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at);
