import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Meta Access Tokenが必要です' },
        { status: 400 }
      );
    }

    // Facebook Graph APIを呼び出して広告アカウント一覧を取得
    // Meta Access Tokenを使用してme/adaccountsエンドポイントにアクセス
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency,balance&access_token=${apiKey}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Facebook API Error:', errorData);

      return NextResponse.json(
        {
          error: 'Meta Ads API接続に失敗しました。トークンが無効または期限切れの可能性があります。',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // データを正規化してフロントエンドに返す
    const accounts = data.data?.map((account: any) => ({
      id: account.id,
      name: account.name || `Account ${account.id}`,
      status: account.account_status,
      currency: account.currency,
    })) || [];

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Meta Ads API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
