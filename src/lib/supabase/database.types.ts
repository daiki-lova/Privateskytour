export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          type: Database["public"]["Enums"]["announcement_type"]
          title: string
          content: string
          target: string | null
          status: Database["public"]["Enums"]["announcement_status"]
          scheduled_at: string | null
          sent_at: string | null
          author: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          type: Database["public"]["Enums"]["announcement_type"]
          title: string
          content: string
          target?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          scheduled_at?: string | null
          sent_at?: string | null
          author?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: Database["public"]["Enums"]["announcement_type"]
          title?: string
          content?: string
          target?: string | null
          status?: Database["public"]["Enums"]["announcement_status"]
          scheduled_at?: string | null
          sent_at?: string | null
          author?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      alphard_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          customer_id: string | null
          dropoff_location: string | null
          id: string
          notes: string | null
          passengers: number | null
          pickup_datetime: string
          pickup_location: string
          reservation_id: string | null
          status: Database["public"]["Enums"]["transfer_status"] | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          dropoff_location?: string | null
          id?: string
          notes?: string | null
          passengers?: number | null
          pickup_datetime: string
          pickup_location: string
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          customer_id?: string | null
          dropoff_location?: string | null
          id?: string
          notes?: string | null
          passengers?: number | null
          pickup_datetime?: string
          pickup_location?: string
          reservation_id?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alphard_transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alphard_transfers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alphard_transfers_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          log_type: Database["public"]["Enums"]["log_type"]
          message: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          status: Database["public"]["Enums"]["log_status"] | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          log_type: Database["public"]["Enums"]["log_type"]
          message?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          status?: Database["public"]["Enums"]["log_status"] | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          log_type?: Database["public"]["Enums"]["log_type"]
          message?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          status?: Database["public"]["Enums"]["log_status"] | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_policies: {
        Row: {
          created_at: string | null
          days_before: number
          display_order: number | null
          fee_percentage: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_before: number
          display_order?: number | null
          fee_percentage: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_before?: number
          display_order?: number | null
          fee_percentage?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: unknown
          lang: Database["public"]["Enums"]["supported_lang"] | null
          message: string
          name: string
          phone: string | null
          resolved_at: string | null
          response: string | null
          status: Database["public"]["Enums"]["inquiry_status"] | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: unknown
          lang?: Database["public"]["Enums"]["supported_lang"] | null
          message: string
          name: string
          phone?: string | null
          resolved_at?: string | null
          response?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: unknown
          lang?: Database["public"]["Enums"]["supported_lang"] | null
          message?: string
          name?: string
          phone?: string | null
          resolved_at?: string | null
          response?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_inquiries_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          area: string | null
          category: string | null
          course_type: Database["public"]["Enums"]["course_type"] | null
          created_at: string | null
          description: string | null
          description_en: string | null
          description_zh: string | null
          display_order: number | null
          duration_minutes: number
          flight_schedule: Json | null
          heliport_id: string | null
          highlights: string[] | null
          id: string
          images: string[] | null
          is_active: boolean | null
          max_pax: number | null
          min_pax: number | null
          popular: boolean | null
          price: number
          rating: number | null
          return_price: number | null
          route_map_url: string | null
          subtitle: string | null
          subtitle_en: string | null
          subtitle_zh: string | null
          tags: string[] | null
          title: string
          title_en: string | null
          title_zh: string | null
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          category?: string | null
          course_type?: Database["public"]["Enums"]["course_type"] | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_zh?: string | null
          display_order?: number | null
          duration_minutes: number
          flight_schedule?: Json | null
          heliport_id?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          max_pax?: number | null
          min_pax?: number | null
          popular?: boolean | null
          price: number
          rating?: number | null
          return_price?: number | null
          route_map_url?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          subtitle_zh?: string | null
          tags?: string[] | null
          title: string
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          category?: string | null
          course_type?: Database["public"]["Enums"]["course_type"] | null
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_zh?: string | null
          display_order?: number | null
          duration_minutes?: number
          flight_schedule?: Json | null
          heliport_id?: string | null
          highlights?: string[] | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          max_pax?: number | null
          min_pax?: number | null
          popular?: boolean | null
          price?: number
          rating?: number | null
          return_price?: number | null
          route_map_url?: string | null
          subtitle?: string | null
          subtitle_en?: string | null
          subtitle_zh?: string | null
          tags?: string[] | null
          title?: string
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_heliport_id_fkey"
            columns: ["heliport_id"]
            isOneToOne: false
            referencedRelation: "heliports"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          booking_count: number | null
          created_at: string | null
          email: string
          first_booking_date: string | null
          id: string
          last_booking_date: string | null
          mypage_token: string | null
          mypage_token_expires_at: string | null
          name: string
          name_kana: string | null
          notes: string | null
          phone: string | null
          preferred_lang: Database["public"]["Enums"]["supported_lang"] | null
          tags: string[] | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          booking_count?: number | null
          created_at?: string | null
          email: string
          first_booking_date?: string | null
          id?: string
          last_booking_date?: string | null
          mypage_token?: string | null
          mypage_token_expires_at?: string | null
          name: string
          name_kana?: string | null
          notes?: string | null
          phone?: string | null
          preferred_lang?: Database["public"]["Enums"]["supported_lang"] | null
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          booking_count?: number | null
          created_at?: string | null
          email?: string
          first_booking_date?: string | null
          id?: string
          last_booking_date?: string | null
          mypage_token?: string | null
          mypage_token_expires_at?: string | null
          name?: string
          name_kana?: string | null
          notes?: string | null
          phone?: string | null
          preferred_lang?: Database["public"]["Enums"]["supported_lang"] | null
          tags?: string[] | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      heliports: {
        Row: {
          access_car: string | null
          access_rail: string | null
          access_taxi: string | null
          address: string
          address_en: string | null
          address_zh: string | null
          created_at: string | null
          google_map_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          name_en: string | null
          name_zh: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          access_car?: string | null
          access_rail?: string | null
          access_taxi?: string | null
          address: string
          address_en?: string | null
          address_zh?: string | null
          created_at?: string | null
          google_map_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_en?: string | null
          name_zh?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          access_car?: string | null
          access_rail?: string | null
          access_taxi?: string | null
          address?: string
          address_en?: string | null
          address_zh?: string | null
          created_at?: string | null
          google_map_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_en?: string | null
          name_zh?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body_html: string | null
          body_text: string
          created_at: string | null
          customer_id: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          lang: Database["public"]["Enums"]["supported_lang"] | null
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_email: string
          recipient_name: string | null
          resend_message_id: string | null
          reservation_id: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          body_text: string
          created_at?: string | null
          customer_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          lang?: Database["public"]["Enums"]["supported_lang"] | null
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient_email: string
          recipient_name?: string | null
          resend_message_id?: string | null
          reservation_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string
          created_at?: string | null
          customer_id?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          lang?: Database["public"]["Enums"]["supported_lang"] | null
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient_email?: string
          recipient_name?: string | null
          resend_message_id?: string | null
          reservation_id?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      passengers: {
        Row: {
          created_at: string | null
          id: string
          is_child: boolean | null
          is_infant: boolean | null
          name: string
          name_kana: string | null
          name_romaji: string | null
          reservation_id: string
          seat_number: number | null
          special_requirements: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_child?: boolean | null
          is_infant?: boolean | null
          name: string
          name_kana?: string | null
          name_romaji?: string | null
          reservation_id: string
          seat_number?: number | null
          special_requirements?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_child?: boolean | null
          is_infant?: boolean | null
          name?: string
          name_kana?: string | null
          name_romaji?: string | null
          reservation_id?: string
          seat_number?: number | null
          special_requirements?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "passengers_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          card_brand: string | null
          card_last4: string | null
          created_at: string | null
          currency: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          receipt_url: string | null
          reservation_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reservation_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string | null
          currency?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          reservation_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          metadata: Json | null
          payment_id: string
          processed_at: string | null
          processed_by: string | null
          reason: Database["public"]["Enums"]["refund_reason"]
          reason_detail: string | null
          reservation_id: string
          status: string | null
          stripe_refund_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason: Database["public"]["Enums"]["refund_reason"]
          reason_detail?: string | null
          reservation_id: string
          status?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          metadata?: Json | null
          payment_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: Database["public"]["Enums"]["refund_reason"]
          reason_detail?: string | null
          reservation_id?: string
          status?: string | null
          stripe_refund_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          admin_notes: string | null
          booked_via: string | null
          booking_number: string
          cancellation_fee: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          course_id: string | null
          created_at: string | null
          customer_id: string | null
          customer_notes: string | null
          health_confirmed: boolean | null
          id: string
          ip_address: unknown
          pax: number
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          privacy_accepted: boolean | null
          reservation_date: string
          reservation_time: string
          slot_id: string | null
          status: Database["public"]["Enums"]["reservation_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax: number
          terms_accepted: boolean | null
          total_price: number
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          booked_via?: string | null
          booking_number: string
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          course_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          health_confirmed?: boolean | null
          id?: string
          ip_address?: unknown
          pax: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          privacy_accepted?: boolean | null
          reservation_date: string
          reservation_time: string
          slot_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax?: number
          terms_accepted?: boolean | null
          total_price: number
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          booked_via?: string | null
          booking_number?: string
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          course_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          health_confirmed?: boolean | null
          id?: string
          ip_address?: unknown
          pax?: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          privacy_accepted?: boolean | null
          reservation_date?: string
          reservation_time?: string
          slot_id?: string | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax?: number
          terms_accepted?: boolean | null
          total_price?: number
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "slots"
            referencedColumns: ["id"]
          },
        ]
      }
      slots: {
        Row: {
          course_id: string | null
          created_at: string | null
          current_pax: number
          id: string
          max_pax: number
          slot_date: string
          slot_time: string
          status: Database["public"]["Enums"]["slot_status"] | null
          suspended_reason: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          current_pax?: number
          id?: string
          max_pax?: number
          slot_date: string
          slot_time: string
          status?: Database["public"]["Enums"]["slot_status"] | null
          suspended_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          current_pax?: number
          id?: string
          max_pax?: number
          slot_date?: string
          slot_time?: string
          status?: Database["public"]["Enums"]["slot_status"] | null
          suspended_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_cancellation_fee: {
        Args: { p_cancellation_date?: string; p_reservation_id: string }
        Returns: number
      }
      create_audit_log: {
        Args: {
          p_action: string
          p_log_type: Database["public"]["Enums"]["log_type"]
          p_message?: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_status?: Database["public"]["Enums"]["log_status"]
          p_target_id?: string
          p_target_table?: string
        }
        Returns: string
      }
      generate_slots_for_date_range: {
        Args: {
          p_course_id: string
          p_end_date: string
          p_end_time?: string
          p_interval_minutes?: number
          p_max_pax?: number
          p_start_date: string
          p_start_time?: string
        }
        Returns: number
      }
      get_available_slots: {
        Args: { p_course_id: string; p_date: string }
        Returns: {
          available_pax: number
          current_pax: number
          max_pax: number
          slot_id: string
          slot_time: string
        }[]
      }
    }
    Enums: {
      announcement_type: "reservation" | "public"
      announcement_status: "draft" | "scheduled" | "sent" | "published"
      course_type: "standard" | "premium" | "charter"
      inquiry_status: "new" | "in_progress" | "resolved" | "closed"
      log_status: "success" | "failure" | "warning" | "info"
      log_type: "stripe" | "crm" | "system" | "operation" | "auth"
      notification_status: "pending" | "sent" | "failed" | "cancelled"
      notification_type:
        | "booking_confirmation"
        | "payment_received"
        | "reminder"
        | "cancellation"
        | "refund"
        | "custom"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "partial_refund"
      refund_reason:
        | "customer_request"
        | "weather"
        | "mechanical"
        | "operator_cancel"
        | "other"
      reservation_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
      slot_status: "open" | "closed" | "suspended"
      supported_lang: "ja" | "en" | "zh"
      transfer_status: "pending" | "approved" | "rejected" | "completed"
      user_role: "admin" | "staff" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_type: ["reservation", "public"],
      announcement_status: ["draft", "scheduled", "sent", "published"],
      course_type: ["standard", "premium", "charter"],
      inquiry_status: ["new", "in_progress", "resolved", "closed"],
      log_status: ["success", "failure", "warning", "info"],
      log_type: ["stripe", "crm", "system", "operation", "auth"],
      notification_status: ["pending", "sent", "failed", "cancelled"],
      notification_type: [
        "booking_confirmation",
        "payment_received",
        "reminder",
        "cancellation",
        "refund",
        "custom",
      ],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partial_refund",
      ],
      refund_reason: [
        "customer_request",
        "weather",
        "mechanical",
        "operator_cancel",
        "other",
      ],
      reservation_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
      slot_status: ["open", "closed", "suspended"],
      supported_lang: ["ja", "en", "zh"],
      transfer_status: ["pending", "approved", "rejected", "completed"],
      user_role: ["admin", "staff", "viewer"],
    },
  },
} as const
