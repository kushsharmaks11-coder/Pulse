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
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          org_id: string
          created_by: string | null
          first_name: string | null
          last_name: string | null
          company_name: string | null
          email: string | null
          mobile_number: string | null
          address: string | null
          country: string
          state_province: string | null
          postal_code: string | null
          send_payment_reminders: boolean | null
          charge_late_fees: boolean | null
          currency_and_language: string | null
          invoice_attachments: boolean | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          created_by?: string | null
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          email?: string | null
          mobile_number?: string | null
          address?: string | null
          country: string
          state_province?: string | null
          postal_code?: string | null
          send_payment_reminders?: boolean | null
          charge_late_fees?: boolean | null
          currency_and_language?: string | null
          invoice_attachments?: boolean | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          created_by?: string | null
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          email?: string | null
          mobile_number?: string | null
          address?: string | null
          country?: string
          state_province?: string | null
          postal_code?: string | null
          send_payment_reminders?: boolean | null
          charge_late_fees?: boolean | null
          currency_and_language?: string | null
          invoice_attachments?: boolean | null
          status?: string | null
          created_at?: string
        }
        invoices: {
          Row: {
            id: string
            org_id: string
            client_id: string
            amount: number
            status: string
            due_date: string
            notes: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            org_id: string
            client_id: string
            amount?: number
            status: string
            due_date: string
            notes?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            org_id?: string
            client_id?: string
            amount?: number
            status?: string
            due_date?: string
            notes?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        orders: {
          Row: {
            id: string
            org_id: string
            client_id: string
            amount: number
            status: string
            description: string
            expected_delivery_date: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            org_id: string
            client_id: string
            amount?: number
            status: string
            description: string
            expected_delivery_date?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            org_id?: string
            client_id?: string
            amount?: number
            status?: string
            description?: string
            expected_delivery_date?: string | null
            created_at?: string
            updated_at?: string
          }
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_member: {
        Args: {
          check_org_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
