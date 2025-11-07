import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiToken, roomId } = await request.json();

    if (!apiToken || !roomId) {
      return NextResponse.json(
        { error: 'APIトークンとルームIDが必要です' },
        { status: 400 }
      );
    }

    // Chatwork APIを呼び出してルーム情報を取得（接続テスト）
    const response = await fetch(`https://api.chatwork.com/v2/rooms/${roomId}`, {
      method: 'GET',
      headers: {
        'X-ChatWorkToken': apiToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Chatwork API接続に失敗しました', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Chatwork API接続成功',
      roomName: data.name,
      roomId: data.room_id,
    });
  } catch (error) {
    console.error('Chatwork API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
