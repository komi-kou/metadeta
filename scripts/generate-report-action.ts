#!/usr/bin/env node

/**
 * GitHub Actions用 週次レポート自動生成・送信スクリプト
 *
 * 環境変数から設定を読み込んでレポートを生成し、Chatworkに送信します
 */

// 環境変数チェック
const requiredEnvVars = [
  'META_API_KEY',
  'META_AD_ACCOUNT_ID',
  'CLAUDE_API_KEY',
  'CHATWORK_API_TOKEN',
  'CHATWORK_ROOM_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

const config = {
  metaApiKey: process.env.META_API_KEY!,
  metaAdAccountId: process.env.META_AD_ACCOUNT_ID!,
  claudeApiKey: process.env.CLAUDE_API_KEY!,
  chatworkApiToken: process.env.CHATWORK_API_TOKEN!,
  chatworkRoomId: process.env.CHATWORK_ROOM_ID!,
};

async function generateWeeklyReport() {
  console.log('📊 Starting weekly report generation...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🎯 Ad Account: ${config.metaAdAccountId}`);

  try {
    // 1. Meta Ads APIからデータ取得
    console.log('\n1️⃣ Fetching data from Meta Ads API...');

    const metaApiUrl = `https://graph.facebook.com/v18.0/act_${config.metaAdAccountId}/insights`;
    const metaParams = new URLSearchParams({
      access_token: config.metaApiKey,
      date_preset: 'last_7d',
      fields: 'spend,impressions,clicks,conversions,ctr,cpm,cpc,reach,frequency,actions',
      time_increment: '1',
    });

    const metaResponse = await fetch(`${metaApiUrl}?${metaParams}`);

    if (!metaResponse.ok) {
      throw new Error(`Meta API Error: ${metaResponse.status} ${metaResponse.statusText}`);
    }

    const metaData = await metaResponse.json();
    console.log('✅ Meta Ads data fetched successfully');

    // データを集計
    const insights = aggregateInsights(metaData.data || []);
    console.log(`📊 Total Spend: ¥${insights.spend.toLocaleString()}`);
    console.log(`🎯 Total Conversions: ${insights.conversions}`);

    // 2. キャンペーンデータ取得
    console.log('\n2️⃣ Fetching campaign data...');

    const campaignsUrl = `https://graph.facebook.com/v18.0/act_${config.metaAdAccountId}/campaigns`;
    const campaignsParams = new URLSearchParams({
      access_token: config.metaApiKey,
      fields: 'name,status,insights{spend,impressions,clicks,conversions,ctr,cpc,cpm,reach,frequency}',
      date_preset: 'last_7d',
      limit: '10',
    });

    const campaignsResponse = await fetch(`${campaignsUrl}?${campaignsParams}`);
    const campaignsData = await campaignsResponse.json();
    const campaigns = campaignsData.data || [];

    console.log(`✅ Fetched ${campaigns.length} campaigns`);

    // 3. Claude APIで分析
    console.log('\n3️⃣ Analyzing with Claude AI...');

    const analysisPrompt = generateAnalysisPrompt(insights, campaigns);

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API Error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const analysis = claudeData.content[0].text;
    console.log('✅ AI analysis completed');

    // 4. Chatworkに送信
    console.log('\n4️⃣ Sending report to Chatwork...');

    const reportMessage = formatReportForChatwork(insights, campaigns, analysis);

    const chatworkResponse = await fetch(
      `https://api.chatwork.com/v2/rooms/${config.chatworkRoomId}/messages`,
      {
        method: 'POST',
        headers: {
          'X-ChatWorkToken': config.chatworkApiToken,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          body: reportMessage,
          self_unread: '1',
        }),
      }
    );

    if (!chatworkResponse.ok) {
      throw new Error(`Chatwork API Error: ${chatworkResponse.status}`);
    }

    const chatworkResult = await chatworkResponse.json();
    console.log(`✅ Report sent to Chatwork (Message ID: ${chatworkResult.message_id})`);

    console.log('\n🎉 Weekly report generation completed successfully!');

  } catch (error) {
    console.error('\n❌ Error occurred:', error);
    process.exit(1);
  }
}

function aggregateInsights(data: any[]): any {
  const totals = {
    spend: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    reach: 0,
    frequency: 0,
  };

  for (const day of data) {
    totals.spend += parseFloat(day.spend || '0');
    totals.impressions += parseInt(day.impressions || '0', 10);
    totals.clicks += parseInt(day.clicks || '0', 10);

    // コンバージョンを集計
    if (day.actions) {
      for (const action of day.actions) {
        if (action.action_type.includes('purchase') || action.action_type.includes('lead')) {
          totals.conversions += parseFloat(action.value || '0');
        }
      }
    }

    totals.reach += parseInt(day.reach || '0', 10);
    totals.frequency += parseFloat(day.frequency || '0');
  }

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const cvr = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  return {
    ...totals,
    ctr: ctr.toFixed(2),
    cpc: cpc.toFixed(0),
    cpm: cpm.toFixed(0),
    cpa: cpa.toFixed(0),
    cvr: cvr.toFixed(2),
    frequency: (totals.frequency / data.length).toFixed(2),
  };
}

function generateAnalysisPrompt(insights: any, campaigns: any[]): string {
  return `以下の広告パフォーマンスデータを分析し、簡潔なレポートを作成してください。

【全体サマリー】
- 広告費: ¥${insights.spend.toLocaleString()}
- コンバージョン: ${insights.conversions}件
- CPA: ¥${insights.cpa}
- CTR: ${insights.ctr}%
- CVR: ${insights.cvr}%

【トップキャンペーン】
${campaigns.slice(0, 5).map((c, i) => {
  const ins = c.insights?.data?.[0] || {};
  return `${i + 1}. ${c.name}
   - 広告費: ¥${parseFloat(ins.spend || '0').toLocaleString()}
   - CV: ${ins.conversions || 0}件`;
}).join('\n')}

以下の形式で分析してください：
1. 全体評価（1-2行）
2. 強み（2-3点）
3. 改善点（2-3点）
4. 次週のアクションプラン（3点）

簡潔に、要点のみを箇条書きで記述してください。`;
}

function formatReportForChatwork(insights: any, campaigns: any[], analysis: string): string {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  return `[info][title]📊 週次広告パフォーマンスレポート[/title]
期間: ${formatDate(weekAgo)} ~ ${formatDate(today)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【📈 主要指標サマリー】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 広告費: ¥${insights.spend.toLocaleString()}
🎯 コンバージョン: ${insights.conversions}件
💵 CPA: ¥${insights.cpa}
📊 CVR: ${insights.cvr}%
👁 インプレッション: ${insights.impressions.toLocaleString()}
🖱 クリック数: ${insights.clicks.toLocaleString()}
📈 CTR: ${insights.ctr}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【🏆 トップキャンペーン】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${campaigns.slice(0, 3).map((campaign, i) => {
  const ins = campaign.insights?.data?.[0] || {};
  const spend = parseFloat(ins.spend || '0');
  const conversions = parseFloat(ins.conversions || '0');
  const cpa = conversions > 0 ? spend / conversions : 0;

  return `${i + 1}. ${campaign.name}
   - CPA: ¥${cpa.toFixed(0)} | CV: ${conversions.toFixed(0)}件
   - 広告費: ¥${spend.toLocaleString()}`;
}).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【🤖 AI分析（Claude Sonnet 4.5）】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

このレポートは GitHub Actions により自動生成されました。
詳細はダッシュボードでご確認ください。
[/info]`;
}

// スクリプト実行
generateWeeklyReport().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
