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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: { blocker_id: string; blocked_id: string; created_at: string }
        Insert: { blocker_id: string; blocked_id: string; created_at?: string }
        Update: { blocker_id?: string; blocked_id?: string; created_at?: string }
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: Database["public"]["Enums"]["follow_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: Database["public"]["Enums"]["follow_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: Database["public"]["Enums"]["follow_status"]
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string
          type: Database["public"]["Enums"]["notif_type"]
          entity_id: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id: string
          type: Database["public"]["Enums"]["notif_type"]
          entity_id?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
        Relationships: []
      }
      reels: {
        Row: { id: string; user_id: string; video_url: string; thumbnail_url: string | null; caption: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; video_url: string; thumbnail_url?: string | null; caption?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; user_id?: string; video_url?: string; thumbnail_url?: string | null; caption?: string | null; updated_at?: string }
        Relationships: []
      }
      reel_likes: {
        Row: { reel_id: string; user_id: string; created_at: string }
        Insert: { reel_id: string; user_id: string; created_at?: string }
        Update: { reel_id?: string; user_id?: string; created_at?: string }
        Relationships: []
      }
      reel_comments: {
        Row: { id: string; reel_id: string; user_id: string; content: string; created_at: string }
        Insert: { id?: string; reel_id: string; user_id: string; content: string; created_at?: string }
        Update: { id?: string; reel_id?: string; user_id?: string; content?: string }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_role"]
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["group_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_private: boolean
          last_seen: string
          status: string
          updated_at: string
          username: string
          website: string | null
          gender: string | null
          gender_custom: string | null
          account_type: string
          phone: string | null
          two_fa_enabled: boolean
          notif_prefs: Json
          content_prefs: Json
          story_privacy: string
          reel_privacy: string
          tag_permissions: string
          hidden_words: string[]
          deactivated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          is_private?: boolean
          last_seen?: string
          status?: string
          updated_at?: string
          username: string
          website?: string | null
          gender?: string | null
          gender_custom?: string | null
          account_type?: string
          phone?: string | null
          two_fa_enabled?: boolean
          notif_prefs?: Json
          content_prefs?: Json
          story_privacy?: string
          reel_privacy?: string
          tag_permissions?: string
          hidden_words?: string[]
          deactivated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_private?: boolean
          last_seen?: string
          status?: string
          updated_at?: string
          username?: string
          website?: string | null
          gender?: string | null
          gender_custom?: string | null
          account_type?: string
          phone?: string | null
          two_fa_enabled?: boolean
          notif_prefs?: Json
          content_prefs?: Json
          story_privacy?: string
          reel_privacy?: string
          tag_permissions?: string
          hidden_words?: string[]
          deactivated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_exists: { Args: { _username: string }; Returns: boolean }
      follow_user: { Args: { _target: string }; Returns: string }
      unfollow_user: { Args: { _target: string }; Returns: void }
      accept_follow_request: { Args: { _follower: string }; Returns: void }
      decline_follow_request: { Args: { _follower: string }; Returns: void }
      remove_follower: { Args: { _follower: string }; Returns: void }
      get_follow_counts: {
        Args: { _user_id: string }
        Returns: Array<{ followers: number; following: number }>
      }
      get_follow_relationship: {
        Args: { _target: string }
        Returns: Array<{
          i_follow: string
          they_follow: string
          is_mutual: boolean
          is_blocked: boolean
        }>
      }
      get_followers: {
        Args: { _user_id: string; _limit?: number; _offset?: number }
        Returns: Array<{
          id: string; username: string; display_name: string | null
          avatar_url: string | null; is_mutual: boolean
        }>
      }
      get_following: {
        Args: { _user_id: string; _limit?: number; _offset?: number }
        Returns: Array<{
          id: string; username: string; display_name: string | null
          avatar_url: string | null; is_mutual: boolean
        }>
      }
      get_follow_requests: {
        Args: Record<string, never>
        Returns: Array<{
          id: string; username: string; display_name: string | null
          avatar_url: string | null; requested_at: string
        }>
      }
      search_users: {
        Args: { _query: string; _limit?: number }
        Returns: Array<{
          id: string; username: string; display_name: string | null
          avatar_url: string | null; is_private: boolean; follow_status: string
        }>
      }
      get_suggested_users: {
        Args: { _limit?: number }
        Returns: Array<{
          id: string; username: string; display_name: string | null
          avatar_url: string | null; is_private: boolean; mutual_count: number
        }>
      }
      mark_notifications_read: { Args: Record<string, never>; Returns: void }
      are_friends: { Args: { a: string; b: string }; Returns: boolean }
      block_user: { Args: { _target: string }; Returns: void }
      unblock_user: { Args: { _target: string }; Returns: void }
      clear_dm_chat: { Args: { _other_user: string }; Returns: void }
      clear_group_chat: { Args: { _group_id: string }; Returns: void }
      get_email_by_username: { Args: { _username: string }; Returns: string | null }
      change_username: { Args: { _new_username: string }; Returns: void }
      delete_own_account: { Args: Record<string, never>; Returns: void }
      deactivate_own_account: { Args: Record<string, never>; Returns: void }
      update_notif_prefs: { Args: { _prefs: Json }; Returns: void }
      update_content_prefs: { Args: { _prefs: Json }; Returns: void }
      get_blocked_users: {
        Args: Record<string, never>
        Returns: Array<{ id: string; username: string; display_name: string | null; avatar_url: string | null; blocked_at: string }>
      }
      get_restricted_users: {
        Args: Record<string, never>
        Returns: Array<{ id: string; username: string; display_name: string | null; avatar_url: string | null; restricted_at: string }>
      }
      get_muted_users: {
        Args: Record<string, never>
        Returns: Array<{ id: string; username: string; display_name: string | null; avatar_url: string | null; muted_at: string }>
      }
      restrict_user: { Args: { _target: string }; Returns: void }
      unrestrict_user: { Args: { _target: string }; Returns: void }
      mute_user: { Args: { _target: string }; Returns: void }
      unmute_user: { Args: { _target: string }; Returns: void }
      create_group: {
        Args: { _description?: string; _name: string }
        Returns: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_group_admin: {
        Args: { _group: string; _user: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      friendship_status: "pending" | "accepted" | "rejected"
      group_role: "admin" | "member"
      follow_status: "pending" | "accepted"
      notif_type: "follow_request" | "follow_accept" | "new_follower" | "post_like" | "post_comment" | "reel_like"
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
      friendship_status: ["pending", "accepted", "rejected"],
      group_role: ["admin", "member"],
      follow_status: ["pending", "accepted"],
      notif_type: ["follow_request", "follow_accept", "new_follower", "post_like", "post_comment", "reel_like"],
    },
  },
} as const
