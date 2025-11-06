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

    // Facebook Graph APIを呼び出して広告アカウント一覧を取得（ページネーション対応）
    // limit=500で一度に多くのアカウントを取得
    let allAccounts: any[] = [];
    let nextUrl: string | null = `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency,balance&limit=500&access_token=${apiKey}`;

    // すべてのページを取得
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: 'GET',
      });

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

      // 現在のページのアカウントを追加
      if (data.data && data.data.length > 0) {
        allAccounts = allAccounts.concat(data.data);
      }

      // 次のページのURLを取得
      nextUrl = data.paging?.next || null;
    }

    // データを正規化してフロントエンドに返す
    const accounts = allAccounts.map((account: any) => ({
      id: account.id,
      name: account.name || `Account ${account.id}`,
      status: account.account_status,
      currency: account.currency,
    }));

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Meta Ads API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
