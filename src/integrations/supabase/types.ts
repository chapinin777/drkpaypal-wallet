export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          contact_user_id: string | null
          created_at: string
          email: string | null
          id: string
          is_favorite: boolean
          name: string
          nickname: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean
          name: string
          nickname?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_user_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_favorite?: boolean
          name?: string
          nickname?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_contact_user_id_fkey"
            columns: ["contact_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          decimals: number
          id: string
          is_active: boolean
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_addresses: {
        Row: {
          address_type: string
          address_value: string
          created_at: string
          id: string
          is_active: boolean
          label: string | null
          updated_at: string
        }
        Insert: {
          address_type: string
          address_value: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          updated_at?: string
        }
        Update: {
          address_type?: string
          address_value?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          card_last_four: string | null
          card_type: string | null
          created_at: string
          expiry_month: number | null
          expiry_year: number | null
          holder_name: string
          id: string
          is_default: boolean
          is_verified: boolean
          metadata: Json | null
          provider: string
          routing_number: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          card_last_four?: string | null
          card_type?: string | null
          created_at?: string
          expiry_month?: number | null
          expiry_year?: number | null
          holder_name: string
          id?: string
          is_default?: boolean
          is_verified?: boolean
          metadata?: Json | null
          provider: string
          routing_number?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          card_last_four?: string | null
          card_type?: string | null
          created_at?: string
          expiry_month?: number | null
          expiry_year?: number | null
          holder_name?: string
          id?: string
          is_default?: boolean
          is_verified?: boolean
          metadata?: Json | null
          provider?: string
          routing_number?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          kyc_level: number | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          kyc_level?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          kyc_level?: number | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      service_fees: {
        Row: {
          account_balance: number
          created_at: string
          fee_amount: number
          id: string
          is_active: boolean
          roi_percentage: number
          updated_at: string
        }
        Insert: {
          account_balance: number
          created_at?: string
          fee_amount: number
          id?: string
          is_active?: boolean
          roi_percentage?: number
          updated_at?: string
        }
        Update: {
          account_balance?: number
          created_at?: string
          fee_amount?: number
          id?: string
          is_active?: boolean
          roi_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      transaction_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          metadata: Json | null
          new_status_id: string
          old_status_id: string | null
          reason: string | null
          transaction_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status_id: string
          old_status_id?: string | null
          reason?: string | null
          transaction_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status_id?: string
          old_status_id?: string | null
          reason?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_logs_new_status_id_fkey"
            columns: ["new_status_id"]
            isOneToOne: false
            referencedRelation: "transaction_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_logs_old_status_id_fkey"
            columns: ["old_status_id"]
            isOneToOne: false
            referencedRelation: "transaction_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_statuses: {
        Row: {
          code: string
          description: string | null
          id: string
          is_final: boolean
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          is_final?: boolean
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          is_final?: boolean
          name?: string
        }
        Relationships: []
      }
      transaction_types: {
        Row: {
          code: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency_id: string
          description: string | null
          external_reference: string | null
          fee: number
          from_wallet_id: string | null
          id: string
          metadata: Json | null
          net_amount: number
          reference_number: string | null
          status_id: string
          to_wallet_id: string | null
          transaction_hash: string | null
          transaction_type_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency_id: string
          description?: string | null
          external_reference?: string | null
          fee?: number
          from_wallet_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          reference_number?: string | null
          status_id: string
          to_wallet_id?: string | null
          transaction_hash?: string | null
          transaction_type_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency_id?: string
          description?: string | null
          external_reference?: string | null
          fee?: number
          from_wallet_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          reference_number?: string | null
          status_id?: string
          to_wallet_id?: string | null
          transaction_hash?: string | null
          transaction_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_wallet_id_fkey"
            columns: ["from_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "transaction_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_wallet_id_fkey"
            columns: ["to_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transaction_type_id_fkey"
            columns: ["transaction_type_id"]
            isOneToOne: false
            referencedRelation: "transaction_types"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number
          balance: number
          created_at: string
          currency_id: string
          id: string
          is_active: boolean
          pending_balance: number
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          available_balance?: number
          balance?: number
          created_at?: string
          currency_id: string
          id?: string
          is_active?: boolean
          pending_balance?: number
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          available_balance?: number
          balance?: number
          created_at?: string
          currency_id?: string
          id?: string
          is_active?: boolean
          pending_balance?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
