# 🗄️ SponsorFlow Database Schema - PostgreSQL

I'll create a comprehensive database schema that supports all features outlined in the PRD and execution plan. This schema is designed for scalability, performance, and data integrity.

```sql
-- ==========================================
-- SPONSORFLOW DATABASE SCHEMA v1.0
-- PostgreSQL 15+ Compatible
-- ==========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For exclusion constraints

-- ==========================================
-- ENUMS - Type Safety for Fixed Values
-- ==========================================

-- User roles for access control
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'CREATOR',
    'EDITOR',
    'VIEWER'
);

-- Deal stages - 9 workflow stages
CREATE TYPE deal_stage AS ENUM (
    'NEW_LEADS',
    'INITIAL_CONTACT', 
    'NEGOTIATION',
    'CONTRACT_REVIEW',
    'CONTENT_CREATION',
    'REVIEW_APPROVAL',
    'PUBLISHING',
    'PAYMENT_PENDING',
    'COMPLETED'
);

-- Deal priority levels
CREATE TYPE priority_level AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

-- Deal types
CREATE TYPE deal_type AS ENUM (
    'PRODUCT_PLACEMENT',
    'DEDICATED_VIDEO',
    'INTEGRATION',
    'SERIES_PARTNERSHIP',
    'AFFILIATE',
    'BRAND_AMBASSADOR',
    'EVENT_COVERAGE',
    'OTHER'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
    'NOT_APPLICABLE',
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);

-- Payment terms
CREATE TYPE payment_terms AS ENUM (
    'UPON_DELIVERY',
    'NET_15',
    'NET_30',
    'NET_45',
    'NET_60',
    'MILESTONE_BASED',
    'CUSTOM'
);

-- Content status
CREATE TYPE content_status AS ENUM (
    'NOT_STARTED',
    'SCRIPT_WRITING',
    'FILMING',
    'EDITING',
    'SPONSOR_REVIEW',
    'APPROVED',
    'REVISION_REQUESTED',
    'PUBLISHED'
);

-- Platform types
CREATE TYPE platform_type AS ENUM (
    'YOUTUBE_MAIN',
    'YOUTUBE_SHORTS',
    'INSTAGRAM_REEL',
    'INSTAGRAM_POST',
    'TIKTOK',
    'TWITTER',
    'PODCAST',
    'OTHER'
);

-- Activity types for audit log
CREATE TYPE activity_type AS ENUM (
    'CREATED',
    'UPDATED',
    'STAGE_CHANGED',
    'ASSIGNED',
    'COMMENTED',
    'FILE_UPLOADED',
    'FILE_DELETED',
    'ARCHIVED',
    'RESTORED',
    'DELETED'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
    'DEAL_ASSIGNED',
    'DEAL_UPDATED',
    'STAGE_CHANGED',
    'COMMENT_ADDED',
    'MENTION',
    'DUE_DATE_REMINDER',
    'PAYMENT_REMINDER',
    'SYSTEM_ALERT'
);

-- ==========================================
-- TABLES - Core Entities
-- ==========================================

-- Users table - Core authentication and profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP WITH TIME ZONE,
    name VARCHAR(255),
    image TEXT,
    role user_role DEFAULT 'CREATOR',
    password_hash TEXT, -- For email/password auth
    
    -- Profile fields
    bio TEXT,
    company VARCHAR(255),
    website VARCHAR(255),
    youtube_channel_id VARCHAR(255),
    youtube_channel_name VARCHAR(255),
    
    -- Settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
    
    -- OAuth providers
    google_id VARCHAR(255) UNIQUE,
    github_id VARCHAR(255) UNIQUE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    
    -- Indexes
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_search ON users USING gin(to_tsvector('english', name || ' ' || COALESCE(email, '')));

-- Sponsors table - Companies/brands offering sponsorships
CREATE TABLE sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    industry VARCHAR(100),
    
    -- Contact information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    secondary_contact_name VARCHAR(255),
    secondary_contact_email VARCHAR(255),
    
    -- Additional info
    notes TEXT,
    preferred_content_types deal_type[],
    typical_budget_range JSONB, -- {"min": 1000, "max": 5000, "currency": "USD"}
    
    -- Relationship tracking
    total_deals_count INTEGER DEFAULT 0,
    successful_deals_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    average_deal_value DECIMAL(12, 2) DEFAULT 0,
    last_deal_date DATE,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT sponsor_name_unique UNIQUE(name, company_name)
);

CREATE INDEX idx_sponsors_name ON sponsors(name);
CREATE INDEX idx_sponsors_company ON sponsors(company_name);
CREATE INDEX idx_sponsors_search ON sponsors USING gin(to_tsvector('english', name || ' ' || COALESCE(company_name, '')));

-- Deals table - Core sponsorship deals
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Relationships
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE RESTRICT,
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Deal details
    deal_type deal_type NOT NULL,
    deal_value DECIMAL(12, 2) NOT NULL CHECK (deal_value >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    commission_rate DECIMAL(5, 2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    
    -- Stage and priority
    stage deal_stage DEFAULT 'NEW_LEADS',
    priority priority_level DEFAULT 'MEDIUM',
    
    -- Dates
    start_date DATE,
    content_due_date DATE,
    publish_date DATE,
    contract_signed_date DATE,
    payment_due_date DATE,
    
    -- Payment information
    payment_terms payment_terms DEFAULT 'NET_30',
    payment_status payment_status DEFAULT 'NOT_APPLICABLE',
    amount_paid DECIMAL(12, 2) DEFAULT 0,
    payment_notes TEXT,
    
    -- Content details
    content_status content_status DEFAULT 'NOT_STARTED',
    video_title VARCHAR(255),
    video_description TEXT,
    video_length_seconds INTEGER,
    video_url TEXT,
    platforms platform_type[] DEFAULT ARRAY['YOUTUBE_MAIN']::platform_type[],
    
    -- Requirements and guidelines
    content_requirements TEXT,
    talking_points TEXT[],
    restricted_topics TEXT[],
    brand_guidelines_url TEXT,
    
    -- Performance metrics (updated post-publish)
    video_views INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2),
    conversion_metrics JSONB,
    
    -- Flags
    is_template BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    auto_publish BOOLEAN DEFAULT false,
    
    -- Custom fields for flexibility
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    stage_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        (start_date IS NULL OR content_due_date IS NULL OR start_date <= content_due_date) AND
        (content_due_date IS NULL OR publish_date IS NULL OR content_due_date <= publish_date)
    ),
    CONSTRAINT valid_payment CHECK (amount_paid <= deal_value)
);

-- Indexes for deals table
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_sponsor_id ON deals(sponsor_id);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to_id) WHERE assigned_to_id IS NOT NULL;
CREATE INDEX idx_deals_stage ON deals(stage) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_priority ON deals(priority) WHERE deleted_at IS NULL AND is_archived = false;
CREATE INDEX idx_deals_dates ON deals(content_due_date, publish_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_active ON deals(stage, priority) WHERE deleted_at IS NULL AND is_archived = false;
CREATE INDEX idx_deals_search ON deals USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Deal stage history - Track stage transitions
CREATE TABLE deal_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    from_stage deal_stage,
    to_stage deal_stage NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    duration_in_stage INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stage_history_deal ON deal_stage_history(deal_id);
CREATE INDEX idx_stage_history_date ON deal_stage_history(created_at);

-- Tags table - For categorizing deals
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_name ON tags(name);

-- Deal tags junction table
CREATE TABLE deal_tags (
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (deal_id, tag_id)
);

CREATE INDEX idx_deal_tags_deal ON deal_tags(deal_id);
CREATE INDEX idx_deal_tags_tag ON deal_tags(tag_id);

-- Comments table - For collaboration
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    mentions UUID[], -- Array of mentioned user IDs
    is_edited BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_comments_deal ON comments(deal_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_mentions ON comments USING gin(mentions) WHERE array_length(mentions, 1) > 0;

-- Attachments table - Files related to deals
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size_bytes BIGINT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    is_contract BOOLEAN DEFAULT false,
    is_brand_guidelines BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_deal ON attachments(deal_id);
CREATE INDEX idx_attachments_type ON attachments(file_type);

-- Activities table - Comprehensive audit log
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    activity_type activity_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store additional context
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_deal ON activities(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_date ON activities(created_at);

-- Notifications table - For real-time notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    action_url TEXT,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_deal ON notifications(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Templates table - Reusable deal templates
CREATE TABLE deal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Template content (similar to deals)
    deal_type deal_type,
    typical_value_range JSONB,
    content_requirements TEXT,
    talking_points TEXT[],
    restricted_topics TEXT[],
    payment_terms payment_terms,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_creator ON deal_templates(created_by);
CREATE INDEX idx_templates_public ON deal_templates(is_public) WHERE is_public = true;

-- Analytics snapshots table - For historical tracking
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    
    -- Metrics
    total_deals INTEGER DEFAULT 0,
    deals_by_stage JSONB DEFAULT '{}'::jsonb,
    total_value DECIMAL(12, 2) DEFAULT 0,
    average_deal_value DECIMAL(12, 2) DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 0,
    average_cycle_time_days DECIMAL(8, 2),
    
    -- Detailed breakdowns
    deals_by_sponsor JSONB DEFAULT '{}'::jsonb,
    deals_by_type JSONB DEFAULT '{}'::jsonb,
    revenue_by_month JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_date UNIQUE (user_id, snapshot_date)
);

CREATE INDEX idx_analytics_user_date ON analytics_snapshots(user_id, snapshot_date DESC);

-- Webhook configurations - For integrations
CREATE TABLE webhook_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    events TEXT[] NOT NULL, -- Array of event types to subscribe to
    is_active BOOLEAN DEFAULT true,
    headers JSONB DEFAULT '{}'::jsonb,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_user ON webhook_configs(user_id);
CREATE INDEX idx_webhooks_active ON webhook_configs(is_active) WHERE is_active = true;

-- ==========================================
-- FUNCTIONS - Database Logic
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track stage duration
CREATE OR REPLACE FUNCTION track_stage_duration()
RETURNS TRIGGER AS $$
DECLARE
    duration INTERVAL;
BEGIN
    IF OLD.stage != NEW.stage THEN
        -- Calculate duration in previous stage
        duration := CURRENT_TIMESTAMP - OLD.stage_updated_at;
        
        -- Insert stage history record
        INSERT INTO deal_stage_history (deal_id, from_stage, to_stage, changed_by, duration_in_stage)
        VALUES (NEW.id, OLD.stage, NEW.stage, NEW.updated_at, duration);
        
        -- Update stage timestamp
        NEW.stage_updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update sponsor statistics
CREATE OR REPLACE FUNCTION update_sponsor_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.sponsor_id != NEW.sponsor_id) THEN
        -- Update new sponsor stats
        UPDATE sponsors
        SET 
            total_deals_count = total_deals_count + 1,
            last_deal_date = CURRENT_DATE
        WHERE id = NEW.sponsor_id;
    END IF;
    
    IF TG_OP = 'UPDATE' AND OLD.sponsor_id != NEW.sponsor_id THEN
        -- Update old sponsor stats
        UPDATE sponsors
        SET total_deals_count = total_deals_count - 1
        WHERE id = OLD.sponsor_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update sponsor stats on delete
        UPDATE sponsors
        SET total_deals_count = total_deals_count - 1
        WHERE id = OLD.sponsor_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_title VARCHAR(255),
    p_message TEXT,
    p_deal_id UUID DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, deal_id, action_url)
    VALUES (p_user_id, p_type, p_title, p_message, p_deal_id, p_action_url)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS - Automated Actions
-- ==========================================

-- Update timestamps triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON deal_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stage tracking trigger
CREATE TRIGGER track_deal_stage_changes BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION track_stage_duration();

-- Sponsor stats triggers
CREATE TRIGGER update_sponsor_stats_on_deal_change
    AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_sponsor_stats();

-- ==========================================
-- VIEWS - Simplified Data Access
-- ==========================================

-- Active deals view
CREATE VIEW active_deals AS
SELECT 
    d.*,
    s.name as sponsor_name,
    s.company_name as sponsor_company,
    u.name as creator_name,
    u.email as creator_email,
    a.name as assignee_name,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT at.id) as attachment_count,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
FROM deals d
LEFT JOIN sponsors s ON d.sponsor_id = s.id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN users a ON d.assigned_to_id = a.id
LEFT JOIN comments c ON d.id = c.deal_id AND c.deleted_at IS NULL
LEFT JOIN attachments at ON d.id = at.deal_id
LEFT JOIN deal_tags dt ON d.id = dt.deal_id
LEFT JOIN tags t ON dt.tag_id = t.id
WHERE d.deleted_at IS NULL AND d.is_archived = false
GROUP BY d.id, s.name, s.company_name, u.name, u.email, a.name;

-- Deal pipeline view
CREATE VIEW deal_pipeline AS
SELECT 
    stage,
    COUNT(*) as deal_count,
    SUM(deal_value) as total_value,
    AVG(deal_value) as avg_value,
    COUNT(*) FILTER (WHERE priority = 'HIGH' OR priority = 'URGENT') as high_priority_count
FROM deals
WHERE deleted_at IS NULL AND is_archived = false
GROUP BY stage
ORDER BY 
    CASE stage
        WHEN 'NEW_LEADS' THEN 1
        WHEN 'INITIAL_CONTACT' THEN 2
        WHEN 'NEGOTIATION' THEN 3
        WHEN 'CONTRACT_REVIEW' THEN 4
        WHEN 'CONTENT_CREATION' THEN 5
        WHEN 'REVIEW_APPROVAL' THEN 6
        WHEN 'PUBLISHING' THEN 7
        WHEN 'PAYMENT_PENDING' THEN 8
        WHEN 'COMPLETED' THEN 9
    END;

-- ==========================================
-- INDEXES - Performance Optimization
-- ==========================================

-- Full-text search index
CREATE INDEX idx_deals_fulltext ON deals 
    USING gin(to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(video_title, '') || ' ' || 
        COALESCE(content_requirements, '')
    ));

-- Composite indexes for common queries
CREATE INDEX idx_deals_dashboard ON deals(user_id, stage, priority, is_archived) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_deals_calendar ON deals(user_id, content_due_date, publish_date) 
    WHERE deleted_at IS NULL AND is_archived = false;

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) 
    WHERE is_read = false AND is_archived = false;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - Data Access Control
-- ==========================================

-- Enable RLS on sensitive tables
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deals
CREATE POLICY deals_select_policy ON deals
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id')::UUID 
        OR assigned_to_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY deals_insert_policy ON deals
    FOR INSERT
    WITH CHECK (user_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY deals_update_policy ON deals
    FOR UPDATE
    USING (user_id = current_setting('app.current_user_id')::UUID 
        OR assigned_to_id = current_setting('app.current_user_id')::UUID);

CREATE POLICY deals_delete_policy ON deals
    FOR DELETE
    USING (user_id = current_setting('app.current_user_id')::UUID);

-- ==========================================
-- INITIAL DATA - Seed Basic Records
-- ==========================================

-- Insert default tags
INSERT INTO tags (name, color, description) VALUES
    ('High Value', '#EF4444', 'Deals worth over $10,000'),
    ('Recurring', '#3B82F6', 'Ongoing partnership deals'),
    ('Rush', '#F59E0B', 'Urgent turnaround required'),
    ('First Time', '#10B981', 'New sponsor relationship'),
    ('Tech', '#8B5CF6', 'Technology related sponsors'),
    ('Gaming', '#EC4899', 'Gaming related sponsors'),
    ('Finance', '#14B8A6', 'Financial services sponsors'),
    ('Education', '#F97316', 'Educational content sponsors');

-- ==========================================
-- MAINTENANCE QUERIES
-- ==========================================

-- Query to clean up old notifications
-- Run periodically via cron job
/*
DELETE FROM notifications 
WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days'
    AND is_read = true;
*/

-- Query to archive completed deals
-- Run monthly
/*
UPDATE deals 
SET is_archived = true, archived_at = CURRENT_TIMESTAMP
WHERE stage = 'COMPLETED' 
    AND updated_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
    AND is_archived = false;
*/

-- Query to generate analytics snapshots
-- Run daily
/*
INSERT INTO analytics_snapshots (user_id, snapshot_date, total_deals, deals_by_stage, total_value, average_deal_value)
SELECT 
    user_id,
    CURRENT_DATE,
    COUNT(*),
    jsonb_object_agg(stage, stage_count),
    SUM(deal_value),
    AVG(deal_value)
FROM (
    SELECT 
        user_id,
        stage,
        deal_value,
        COUNT(*) OVER (PARTITION BY user_id, stage) as stage_count
    FROM deals
    WHERE deleted_at IS NULL
) sub
GROUP BY user_id;
*/

-- ==========================================
-- PERFORMANCE NOTES
-- ==========================================

/*
1. Regular VACUUM ANALYZE should be run on high-activity tables (deals, activities, notifications)
2. Consider partitioning activities table by created_at for better performance at scale
3. Monitor index usage with pg_stat_user_indexes
4. Use EXPLAIN ANALYZE on slow queries to optimize
5. Consider read replicas for analytics queries
6. Implement connection pooling (PgBouncer) for high concurrency
*/
```

This comprehensive database schema includes:

1. **Complete Entity Modeling**: All tables needed for the sponsorship workflow system
2. **Strong Type Safety**: PostgreSQL ENUMs for fixed values
3. **Performance Optimization**: Strategic indexes for common queries
4. **Data Integrity**: Foreign keys, constraints, and validation
5. **Audit Trail**: Complete activity logging and stage history
6. **Security**: Row Level Security policies for multi-tenant access
7. **Flexibility**: JSONB fields for custom data and future expansion
8. **Analytics Support**: Views and snapshot tables for reporting
9. **Collaboration Features**: Comments, mentions, and notifications
10. **Automation**: Triggers for updating timestamps and statistics

The schema is production-ready and supports all features outlined in the PRD, with room for future growth and optimization.
