export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          filename: string
          original_name: string
          file_type: string
          file_size: number
          storage_path: string
          document_type: string
          extracted_data: Json
          ocr_text: string
          status: 'pending' | 'processing' | 'processed' | 'error'
          confidence_score: number
          processed_by: string | null
          processing_time: number | null
          error_message: string | null
          metadata: Json
          tags: string[]
          user_id: string
          organization_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          filename: string
          original_name: string
          file_type: string
          file_size: number
          storage_path: string
          document_type: string
          extracted_data?: Json
          ocr_text?: string
          status?: 'pending' | 'processing' | 'processed' | 'error'
          confidence_score?: number
          processed_by?: string | null
          processing_time?: number | null
          error_message?: string | null
          metadata?: Json
          tags?: string[]
          user_id: string
          organization_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          filename?: string
          original_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          document_type?: string
          extracted_data?: Json
          ocr_text?: string
          status?: 'pending' | 'processing' | 'processed' | 'error'
          confidence_score?: number
          processed_by?: string | null
          processing_time?: number | null
          error_message?: string | null
          metadata?: Json
          tags?: string[]
          user_id?: string
          organization_id?: string
        }
      }
      document_fields: {
        Row: {
          id: string
          document_id: string
          field_name: string
          field_value: string
          confidence_score: number
          extracted_at: string
          validated: boolean
          validated_by: string | null
          validated_at: string | null
          original_value: string | null
        }
        Insert: {
          id?: string
          document_id: string
          field_name: string
          field_value: string
          confidence_score: number
          extracted_at?: string
          validated?: boolean
          validated_by?: string | null
          validated_at?: string | null
          original_value?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          field_name?: string
          field_value?: string
          confidence_score?: number
          extracted_at?: string
          validated?: boolean
          validated_by?: string | null
          validated_at?: string | null
          original_value?: string | null
        }
      }
      document_types: {
        Row: {
          id: string
          name: string
          description: string | null
          field_config: Json
          created_at: string
          updated_at: string
          organization_id: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          field_config: Json
          created_at?: string
          updated_at?: string
          organization_id: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          field_config?: Json
          created_at?: string
          updated_at?: string
          organization_id?: string
          active?: boolean
        }
      }
    }
    Views: {
      document_statistics: {
        Row: {
          organization_id: string
          document_type: string
          total_documents: number
          average_confidence: number
          processing_success_rate: number
          average_processing_time: number
        }
      }
    }
    Functions: {
      search_documents: {
        Args: {
          search_query: string
          document_type?: string
          min_confidence?: number
          date_from?: string
          date_to?: string
          organization_id: string
        }
        Returns: Array<{
          id: string
          filename: string
          document_type: string
          confidence_score: number
          extracted_data: Json
          created_at: string
        }>
      }
    }
  }
}