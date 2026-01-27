import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

type CookieToSet = {
  name: string;
  value: string;
  options?: Partial<ResponseCookie>;
};

interface UpdatePasswordRequest {
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdatePasswordRequest;
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: '新しいパスワードを入力してください' },
        { status: 400 }
      );
    }

    // Validate password requirements
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    // Create Supabase client with cookie handling
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    // Check if user is authenticated (via reset token in session)
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'セッションが無効です。もう一度パスワードリセットをお試しください。' },
        { status: 401 }
      );
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'パスワードの更新に失敗しました。もう一度お試しください。' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'パスワードが正常に更新されました。',
    });
  } catch (error) {
    console.error('Update password error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  }
}
