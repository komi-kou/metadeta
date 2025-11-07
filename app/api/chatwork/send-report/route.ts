import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToChatwork, formatAdReportForChatwork } from '@/lib/api/chatwork';

export async function POST(request: NextRequest) {
  try {
    const { apiToken, roomId, insights, campaigns, analysis } = await request.json();

    if (!apiToken || !roomId) {
      return NextResponse.json(
        { error: 'APIトークンとルームIDが必要です' },
        { status: 400 }
      );
    }

    if (!insights) {
      return NextResponse.json(
        { error: 'レポートデータが必要です' },
        { status: 400 }
      );
    }

    // レポートデータを整形
    const reportData = {
      summary: {
        period: `${insights.date_start} ~ ${insights.date_stop}`,
        spend: insights.spend,
        conversions: insights.conversions,
        cpa: insights.cpa,
        cvr: insights.cvr,
        impressions: insights.impressions,
        clicks: insights.clicks,
        ctr: insights.ctr,
      },
      campaignPerformance: campaigns || [],
      actionPlans: [],
      insights: {
        performanceAnalysis: {
          overall: 'good',
          summary: analysis ? '詳細な分析が生成されました' : 'AI分析を実行してください',
          strengths: ['パフォーマンスデータを取得しました'],
          concerns: [],
        },
        nextWeekAdvice: '継続的な最適化を推奨します',
      },
    };

    // Chatworkメッセージをフォーマット
    const message = formatAdReportForChatwork(reportData);

    // Chatwork APIを呼び出してメッセージを送信
    const result = await sendMessageToChatwork(
      { apiToken, roomId },
      message,
      1 // 未読にする
    );

    return NextResponse.json({
      success: true,
      message: 'レポートをChatworkに送信しました',
      messageId: result.message_id,
    });
  } catch (error: any) {
    console.error('Chatwork Send Report Error:', error);
    return NextResponse.json(
      { error: 'レポート送信に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
