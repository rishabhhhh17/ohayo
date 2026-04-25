// AUTO-GENERATED FALLBACK — replace with output of `supabase gen types typescript` once project is provisioned.
// Run: supabase gen types typescript --project-id <your-project-id> > types/database.ts

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Database root type — mirrors the shape produced by the Supabase generator
// ---------------------------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: Database['public']['Enums']['user_role'];
          default_address_id: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          default_address_id?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          default_address_id?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_default_address_fk';
            columns: ['default_address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
        ];
      };

      discount_codes: {
        Row: {
          id: string;
          code: string;
          type: Database['public']['Enums']['discount_type'];
          value: number;
          min_order_amount: number;
          max_uses: number | null;
          uses_count: number;
          valid_from: string;
          valid_until: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: Database['public']['Enums']['discount_type'];
          value: number;
          min_order_amount?: number;
          max_uses?: number | null;
          uses_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: Database['public']['Enums']['discount_type'];
          value?: number;
          min_order_amount?: number;
          max_uses?: number | null;
          uses_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          base_price: number;
          compare_at_price: number | null;
          status: Database['public']['Enums']['product_status'];
          category: string | null;
          gender: Database['public']['Enums']['product_gender'];
          featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          base_price: number;
          compare_at_price?: number | null;
          status?: Database['public']['Enums']['product_status'];
          category?: string | null;
          gender?: Database['public']['Enums']['product_gender'];
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          base_price?: number;
          compare_at_price?: number | null;
          status?: Database['public']['Enums']['product_status'];
          category?: string | null;
          gender?: Database['public']['Enums']['product_gender'];
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color_name: string;
          color_hex: string;
          sku: string;
          stock_quantity: number;
          price_override: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color_name: string;
          color_hex: string;
          sku: string;
          stock_quantity?: number;
          price_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color_name?: string;
          color_hex?: string;
          sku?: string;
          stock_quantity?: number;
          price_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };

      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };

      addresses: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'addresses_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          status: Database['public']['Enums']['cart_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          status?: Database['public']['Enums']['cart_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          status?: Database['public']['Enums']['cart_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'carts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };

      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          variant_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          variant_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cart_items_cart_id_fkey';
            columns: ['cart_id'];
            isOneToOne: false;
            referencedRelation: 'carts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cart_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
        ];
      };

      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          email: string;
          phone: string;
          subtotal: number;
          discount_amount: number;
          shipping_amount: number;
          tax_amount: number;
          total_amount: number;
          currency: string;
          status: Database['public']['Enums']['order_status'];
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          shipping_address: Json;
          billing_address: Json;
          notes: string | null;
          discount_code_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email: string;
          phone: string;
          subtotal: number;
          discount_amount?: number;
          shipping_amount?: number;
          tax_amount?: number;
          total_amount: number;
          currency?: string;
          status?: Database['public']['Enums']['order_status'];
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          shipping_address: Json;
          billing_address: Json;
          notes?: string | null;
          discount_code_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          email?: string;
          phone?: string;
          subtotal?: number;
          discount_amount?: number;
          shipping_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          status?: Database['public']['Enums']['order_status'];
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_signature?: string | null;
          shipping_address?: Json;
          billing_address?: Json;
          notes?: string | null;
          discount_code_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_discount_code_id_fkey';
            columns: ['discount_code_id'];
            isOneToOne: false;
            referencedRelation: 'discount_codes';
            referencedColumns: ['id'];
          },
        ];
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string | null;
          product_name_snapshot: string;
          variant_snapshot: Json;
          unit_price: number;
          quantity: number;
          line_total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id?: string | null;
          product_name_snapshot: string;
          variant_snapshot: Json;
          unit_price: number;
          quantity: number;
          line_total: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          variant_id?: string | null;
          product_name_snapshot?: string;
          variant_snapshot?: Json;
          unit_price?: number;
          quantity?: number;
          line_total?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_variant_id_fkey';
            columns: ['variant_id'];
            isOneToOne: false;
            referencedRelation: 'product_variants';
            referencedColumns: ['id'];
          },
        ];
      };

      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          unsubscribed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
          unsubscribed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      decrement_stock_for_order: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      handle_new_user: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };

    Enums: {
      user_role: 'customer' | 'admin';
      product_status: 'draft' | 'active' | 'archived';
      product_gender: 'mens' | 'womens' | 'unisex' | 'kids';
      cart_status: 'active' | 'converted' | 'abandoned';
      order_status:
        | 'pending'
        | 'paid'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
        | 'refunded';
      discount_type: 'percentage' | 'fixed';
    };

    CompositeTypes: Record<string, never>;
  };
};

// ---------------------------------------------------------------------------
// Convenience re-exports (matches Supabase generator output)
// ---------------------------------------------------------------------------
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// ---------------------------------------------------------------------------
// Typed shorthand aliases — import these throughout the app
// ---------------------------------------------------------------------------
export type Profile              = Tables<'profiles'>;
export type Product              = Tables<'products'>;
export type ProductVariant       = Tables<'product_variants'>;
export type ProductImage         = Tables<'product_images'>;
export type Address              = Tables<'addresses'>;
export type Cart                 = Tables<'carts'>;
export type CartItem             = Tables<'cart_items'>;
export type Order                = Tables<'orders'>;
export type OrderItem            = Tables<'order_items'>;
export type DiscountCode         = Tables<'discount_codes'>;
export type NewsletterSubscriber = Tables<'newsletter_subscribers'>;

export type UserRole      = Enums<'user_role'>;
export type ProductStatus = Enums<'product_status'>;
export type ProductGender = Enums<'product_gender'>;
export type CartStatus    = Enums<'cart_status'>;
export type OrderStatus   = Enums<'order_status'>;
export type DiscountType  = Enums<'discount_type'>;

// Inline variant_snapshot shape for type-safe access at call sites
export type VariantSnapshot = {
  size: string;
  color_name: string;
  color_hex: string;
  sku: string;
};
