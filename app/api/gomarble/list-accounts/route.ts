import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが必要です' },
        { status: 400 }
      );
    }

    // GoMarble APIを呼び出して広告アカウント一覧を取得
    const response = await fetch('https://api.gomarble.ai/v1/ad-accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'GoMarble API接続に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // データを正規化してフロントエンドに返す
    const accounts = data.data?.map((account: any) => ({
      id: account.id,
      name: account.name || account.account_name || `Account ${account.id}`,
    })) || [];

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('GoMarble API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
