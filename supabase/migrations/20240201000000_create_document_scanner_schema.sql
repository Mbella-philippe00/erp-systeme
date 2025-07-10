-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE document_status AS ENUM ('pending', 'processing', 'processed', 'error');

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    document_type TEXT NOT NULL,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    ocr_text TEXT,
    status document_status DEFAULT 'pending',
    confidence_score FLOAT DEFAULT 0,
    processed_by UUID REFERENCES auth.users(id),
    processing_time INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID NOT NULL,
    CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Create document_fields table
CREATE TABLE document_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_value TEXT NOT NULL,
    confidence_score FLOAT NOT NULL,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated BOOLEAN DEFAULT false,
    validated_by UUID REFERENCES auth.users(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    original_value TEXT,
    CONSTRAINT valid_field_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Create document_types table
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    field_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    organization_id UUID NOT NULL,
    active BOOLEAN DEFAULT true,
    UNIQUE(name, organization_id)
);

-- Create document_statistics view
CREATE VIEW document_statistics AS
SELECT
    organization_id,
    document_type,
    COUNT(*) as total_documents,
    AVG(confidence_score) as average_confidence,
    (COUNT(*) FILTER (WHERE status = 'processed') * 100.0 / COUNT(*)) as processing_success_rate,
    AVG(processing_time) as average_processing_time
FROM documents
GROUP BY organization_id, document_type;

-- Create search_documents function
CREATE OR REPLACE FUNCTION search_documents(
    search_query TEXT,
    document_type TEXT DEFAULT NULL,
    min_confidence FLOAT DEFAULT 0,
    date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    organization_id UUID
) RETURNS TABLE (
    id UUID,
    filename TEXT,
    document_type TEXT,
    confidence_score FLOAT,
    extracted_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.filename,
        d.document_type,
        d.confidence_score,
        d.extracted_data,
        d.created_at
    FROM documents d
    WHERE
        d.organization_id = search_documents.organization_id
        AND (search_documents.document_type IS NULL OR d.document_type = search_documents.document_type)
        AND d.confidence_score >= search_documents.min_confidence
        AND (search_documents.date_from IS NULL OR d.created_at >= search_documents.date_from)
        AND (search_documents.date_to IS NULL OR d.created_at <= search_documents.date_to)
        AND (
            d.ocr_text ILIKE '%' || search_query || '%'
            OR d.filename ILIKE '%' || search_query || '%'
            OR d.extracted_data::TEXT ILIKE '%' || search_query || '%'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_documents_organization_type ON documents(organization_id, document_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_fields_document_id ON document_fields(document_id);
CREATE INDEX idx_documents_ocr_text_trgm ON documents USING gin (ocr_text gin_trgm_ops);

-- Create update_updated_at function and trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER document_types_updated_at
    BEFORE UPDATE ON document_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Add RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's documents"
    ON documents FOR SELECT
    USING (organization_id IN (
        SELECT org_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert documents for their organization"
    ON documents FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT org_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their organization's documents"
    ON documents FOR UPDATE
    USING (organization_id IN (
        SELECT org_id FROM user_organizations
        WHERE user_id = auth.uid()
    ));