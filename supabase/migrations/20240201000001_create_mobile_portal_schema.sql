-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE timesheet_type AS ENUM ('entry', 'exit');
CREATE TYPE leave_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE message_status AS ENUM ('unread', 'read', 'archived');

-- Create timesheet table
CREATE TABLE timesheet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    type timesheet_type NOT NULL,
    location GEOGRAPHY(POINT) NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT true,
    CONSTRAINT valid_location CHECK (ST_IsValid(location::geometry))
);

-- Create leave_requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type TEXT NOT NULL,
    reason TEXT,
    status leave_request_status DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attachments JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create employee_documents table
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_from DATE,
    valid_until DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_confidential BOOLEAN DEFAULT false
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    receiver_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    status message_status DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]'::jsonb,
    thread_id UUID REFERENCES messages(id),
    is_internal BOOLEAN DEFAULT true
);

-- Create calendar_events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT false,
    event_type TEXT NOT NULL,
    location TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT valid_time_range CHECK (end_time >= start_time)
);

-- Create event_participants table
CREATE TABLE event_participants (
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    response_status TEXT DEFAULT 'pending',
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (event_id, user_id)
);

-- Create offline_actions table for syncing
CREATE TABLE offline_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    action_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced BOOLEAN DEFAULT false,
    retry_count INTEGER DEFAULT 0,
    last_retry TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Create indexes
CREATE INDEX idx_timesheet_user_timestamp ON timesheet(user_id, timestamp);
CREATE INDEX idx_leave_requests_user_dates ON leave_requests(user_id, start_date, end_date);
CREATE INDEX idx_employee_documents_user ON employee_documents(user_id);
CREATE INDEX idx_messages_receiver_status ON messages(receiver_id, status);
CREATE INDEX idx_calendar_events_date_range ON calendar_events(start_time, end_time);
CREATE INDEX idx_offline_actions_sync ON offline_actions(user_id, synced);

-- Add RLS policies
ALTER TABLE timesheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_actions ENABLE ROW LEVEL SECURITY;

-- Timesheet policies
CREATE POLICY "Users can view their own timesheet"
    ON timesheet FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own timesheet"
    ON timesheet FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Leave requests policies
CREATE POLICY "Users can view their own leave requests"
    ON leave_requests FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "HR can view all leave requests"
    ON leave_requests FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'hr'
    ));

CREATE POLICY "Users can create leave requests"
    ON leave_requests FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view their own documents"
    ON employee_documents FOR SELECT
    USING (user_id = auth.uid() OR (
        is_confidential = false AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('hr', 'manager')
        )
    ));

-- Messages policies
CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Calendar policies
CREATE POLICY "Users can view calendar events"
    ON calendar_events FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM event_participants
        WHERE event_id = calendar_events.id
        AND user_id = auth.uid()
    ));

-- Offline actions policies
CREATE POLICY "Users can manage their offline actions"
    ON offline_actions FOR ALL
    USING (user_id = auth.uid());