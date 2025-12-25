// Chatwork API連携
// レポートをChatworkに送信

/**
 * Chatwork APIを使用してメッセージを送信
 *
 * セットアップ:
 * 1. Chatwork APIトークンを取得: https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php
 * 2. 送信先のルームIDを取得（ブラウザのアドレスバーから）
 */

export interface ChatworkConfig {
  apiToken: string;
  roomId: string;
}

/**
 * Chatworkにメッセージを送信
 * @param config Chatwork設定
 * @param message 送信するメッセージ
 * @param selfUnread 未読にするかどうか (0: 既読, 1: 未読)
 */
export async function sendMessageToChatwork(
  config: ChatworkConfig,
  message: string,
  selfUnread: number = 0
): Promise<{ message_id: string }> {
  const endpoint = `https://api.chatwork.com/v2/rooms/${config.roomId}/messages`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-ChatWorkToken': config.apiToken,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      body: message,
      self_unread: selfUnread.toString(),
    }),
  });

  if (!response.ok) {
    // エラーレスポンスの詳細を取得
    const errorText = await response.text();
    let errorData: any;
    
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || 'Unknown error' };
    }
    
    // 詳細なエラー情報をログに出力
    console.error('Chatwork API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      body: errorData,
      endpoint: endpoint
    });
    
    // ユーザーフレンドリーなエラーメッセージを生成
    const errorMessage = errorData.error?.message || 
                        errorData.message || 
                        `Chatwork API Error: ${response.status} ${response.statusText}`;
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * 広告レポートをChatwork用のフォーマットに整形
 */
export function formatAdReportForChatwork(data: any): string {
  const { summary, campaignPerformance, actionPlans, insights } = data;

  return `[info][title]📊 広告パフォーマンスレポート[/title]
期間: ${summary.period}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【📈 主要指標サマリー】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 広告費: ¥${summary.spend.toLocaleString()}
📊 ROAS: ${summary.roas}
🎯 コンバージョン: ${summary.conversions}件
💵 CPA: ¥${summary.cpa.toLocaleString()}
👁 インプレッション: ${summary.impressions.toLocaleString()}
🖱 クリック数: ${summary.clicks.toLocaleString()}
📈 CTR: ${summary.ctr}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【🏆 トップキャンペーン】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${campaignPerformance.slice(0, 3).map((campaign: any, i: number) =>
`${i + 1}. ${campaign.name}
   - ROAS: ${campaign.roas} | CV: ${campaign.conversions}件
   - 広告費: ¥${campaign.spend.toLocaleString()}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【🎯 優先アクションプラン】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${actionPlans.map((plan: any, i: number) =>
`${i + 1}. [${plan.priority === 'high' ? '高優先度' : '中優先度'}] ${plan.title}
   ${plan.description}
   期待効果: ${plan.impact}`
).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【💡 総合評価】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${insights.performanceAnalysis.summary}

✓ 強み:
${insights.performanceAnalysis.strengths.map((s: string) => `  • ${s}`).join('\n')}

⚠ 懸念点:
${insights.performanceAnalysis.concerns.map((c: string) => `  • ${c}`).join('\n')}

📅 次週に向けて:
${insights.nextWeekAdvice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

詳細レポートはダッシュボードで確認できます。
[/info]`;
}

/**
 * 定期レポート送信
 * @param config Chatwork設定
 * @param reportData レポートデータ
 * @param schedule スケジュール ('daily', 'weekly', 'monthly')
 */
export async function sendScheduledReport(
  config: ChatworkConfig,
  reportData: any,
  schedule: 'daily' | 'weekly' | 'monthly'
): Promise<void> {
  const message = formatAdReportForChatwork(reportData);

  await sendMessageToChatwork(config, message);

  console.log(`${schedule} report sent to Chatwork room ${config.roomId}`);
}

/**
 * 全メンバーにメンション
 */
export function mentionAll(message: string): string {
  return `[toall]\n${message}`;
}
