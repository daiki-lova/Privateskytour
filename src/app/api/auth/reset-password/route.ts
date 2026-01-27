import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';

interface ResetPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequest;
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    // Check if email exists in admin_users table (using admin client to bypass RLS)
    const adminClient = createAdminClient();
    const { data: adminUser } = await adminClient
      .from('admin_users')
      .select('id, email, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    // Security: Always return success to prevent email enumeration attacks
    // Only actually send the reset email if the user exists and is active
    if (adminUser) {
      // Create Supabase client with service role for auth admin operations
      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // Get the base URL for the redirect
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
        (request.headers.get('origin') ?? 'http://localhost:3000');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/admin/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        // Still return success to prevent timing attacks
      }
    }

    // Always return success message (timing attack prevention)
    return NextResponse.json({
      success: true,
      message: 'パスワードリセット用のメールを送信しました。メールをご確認ください。',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
