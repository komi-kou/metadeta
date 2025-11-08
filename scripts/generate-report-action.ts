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
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16000,
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
  return `あなたは経験豊富なデジタルマーケティングアナリストです。Meta広告の包括的なパフォーマンス分析レポートを作成してください。

**分析期間:** 直近7日間

## パフォーマンスデータ

### アカウント全体メトリクス
- 広告費: ¥${insights.spend.toLocaleString()}
- インプレッション: ${insights.impressions.toLocaleString()}
- クリック数: ${insights.clicks.toLocaleString()}
- CTR: ${insights.ctr}%
- CPC: ¥${insights.cpc}
- CPM: ¥${insights.cpm}
- リーチ: ${insights.reach.toLocaleString()}
- フリークエンシー: ${insights.frequency}
- コンバージョン数: ${insights.conversions}
- CPA: ¥${insights.cpa}
- CVR: ${insights.cvr}%

### キャンペーン別パフォーマンス（トップ10）
${campaigns.slice(0, 10).map((c: any, i: number) => {
  const ins = c.insights?.data?.[0] || {};
  const spend = parseFloat(ins.spend || '0');
  const conversions = parseFloat(ins.conversions || '0');
  const cpa = conversions > 0 ? spend / conversions : 0;
  return `${i + 1}. ${c.name}
   - ステータス: ${c.status} | 広告費: ¥${spend.toLocaleString()} | CV: ${conversions.toFixed(0)} | CPA: ¥${cpa.toFixed(0)} | CTR: ${parseFloat(ins.ctr || '0').toFixed(2)}%`;
}).join('\n')}

## 出力形式

**重要:** すべてのデータを、専門用語を最小限に抑え、**ビジネスへの影響**に焦点を当てて提示してください。広告指標ではなく、ビジネスの成果を重視してください。

**出力はChatwork用のテキスト形式で、以下の構造を使用してください：**

### Chatworkフォーマットの指定

1. **セクション区切り**: セクションの前後に「━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━」を使用
2. **セクションタイトル**: 【📊 セクション名】の形式を使用
3. **インサイトボックス**: 以下の形式を使用：
   [info][title]💡 タイトル[/title]
   内容
   [/info]
4. **リスト**: 「•」または「-」を使用
5. **強調**: [title]テキスト[/title] または **テキスト** を使用

### 📊 1. パフォーマンス概要

#### 🎯 総合評価
- **スコア:** ⭐⭐⭐⭐☆ (X/5点)
- **評価根拠:** [データに基づく具体的な理由]

#### 📈 主要指標の状況
以下の形式でテーブル風に表示してください：

指標 | 現在値 | 状態 | 評価
--- | --- | --- | ---
コンバージョン単価（CPA） | ¥${insights.cpa} | 🟢/🟡/🔴 | [良い/改善必要/要注意の理由]
コンバージョン率（CVR） | ${insights.cvr}% | 🟢/🟡/🔴 | [理由]
クリック率（CTR） | ${insights.ctr}% | 🟢/🟡/🔴 | [理由]
広告疲弊度（Frequency） | ${insights.frequency} | 🟢/🟡/🔴 | [理由]

**凡例:** 🟢 = 良好 | 🟡 = 要改善 | 🔴 = 緊急対応必要

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🏆 2. 最も成果を出している要素

#### ベストパフォーマンスのセグメント
[info][title]💡 ベストパフォーマンスのセグメント[/title]
• **👥 オーディエンス:** [年齢層] × [性別] - CPA ¥XXX、CV XX件
  - なぜ効果的か: [理由]
  - 活用方法: [具体的な推奨]

• **📱 配信面:** [Facebook Feed/Instagram Stories等] - 広告費 ¥XXX、CV XX件
  - なぜ効果的か: [理由]
  - 活用方法: [具体的な推奨]

• **💻 デバイス:** [Mobile/Desktop] - CPA ¥XXX（最安）
  - なぜ効果的か: [理由]
[/info]

#### 成功パターンの特定
[info][title]💡 成功パターン[/title]
1. [共通要素1]
2. [共通要素2]
3. [横展開できる戦略]
[/info]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### ⚠️ 3. 改善が必要な領域（優先度順）

#### 🔴 最優先で対応すべき課題
[info][title]🔴 最優先で対応すべき課題[/title]
**課題:** [具体的な問題]

• **ビジネスへの影響:** 広告費の XX% (¥XXX) に影響
• **現状:** [数値で示す]
• **推奨アクション:** [具体的な改善策]
[/info]

#### 🟡 重要な改善ポイント
[info][title]🟡 重要な改善ポイント[/title]
**課題:** [2番目の問題]

• **ビジネスへの影響:** [定量的に]
• **現状:** [数値で示す]
• **推奨アクション:** [具体的な改善策]
[/info]

#### 🟢 長期的な最適化
[info][title]🟢 長期的な最適化[/title]
**課題:** [3番目の問題]

• **ビジネスへの影響:** [定量的に]
• **推奨アクション:** [具体的な改善策]
[/info]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 👥 4. オーディエンス分析

#### 最も価値のあるセグメント
セグメント | CPA | CV | 状態 | 推奨アクション
--- | --- | --- | --- | ---
🏆 [年齢層] × [性別] | ¥XXX | XX件 | 🟢 | 予算を XX% 増やす
🟡 [年齢層] × [性別] | ¥XXX | CVR低い | 🟡 | クリエイティブを変更してテスト
🔴 [年齢層] × [性別] | ¥XXX（非効率） | - | 🔴 | 予算を削減または停止

#### 未開拓の機会
[info][title]💡 未開拓の機会[/title]
• [パフォーマンスは良いが予算配分が少ないセグメント]
[/info]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 📋 5. 次のステップ（実行可能なアクション）

**重要:** 上記の「⚠️ 3. 改善が必要な領域」で特定した各課題に対して、具体的な実行可能なアクションを必ず生成してください。課題が3つある場合は、最低3つのアクションを生成してください。

#### すぐに実行すべきアクション
[info][title]📋 すぐに実行すべきアクション[/title]
1. **[具体的なアクション1 - 最優先課題に対応]**
   • 所要時間: XX分
   • 期待される成果: CPA -XX% または CV +XX件
   • 手順: [ステップバイステップ]

2. **[具体的なアクション2 - 2番目の課題に対応]**
   • 所要時間: XX分
   • 期待される成果: [定量的な目標]
   • 手順: [ステップバイステップ]

3. **[具体的なアクション3 - 3番目の課題に対応]**
   • 所要時間: XX分
   • 期待される成果: [定量的な目標]
   • 手順: [ステップバイステップ]
[/info]

**注意:** 上記は例です。実際のデータに基づいて、特定した課題の数だけアクションを生成してください。最低でも2つ以上、理想的には3-5つのアクションを生成してください。

#### 今週中に実行すべきアクション
[info][title]📅 今週中に実行すべきアクション[/title]
1. **[具体的なアクション1]**
   • 所要時間: X時間
   • 期待される成果: [定量的な目標]

2. **[具体的なアクション2]**
   • 所要時間: X時間
   • 期待される成果: [定量的な目標]
[/info]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 📌 重要な注意事項

- **Chatwork形式で出力:** 上記のChatworkフォーマット構造を使用して、読みやすいレポートを作成してください
- **視覚的な表現:** 🟢🟡🔴の絵文字を使って状態を一目で判断できるようにする
- **ビジネス言語:** 技術的な専門用語ではなく、ビジネスへの影響で説明する
- **具体的な数値:** 「改善する」ではなく「CPA を ¥XXX から ¥YYY に下げる」のように具体的に
- **実行可能性:** すべての推奨事項に具体的な手順を含める
- **ROASは使用しない:** CPA、CVR、CTRなどの指標に焦点を当てる

**重要:** 上記のChatworkフォーマット構造に従って、明確なセクション区切りを持つ読みやすいレポートとして分析レポートを作成してください。

**特に重要な指示:**
- 「📋 5. 次のステップ（実行可能なアクション）」セクションでは、必ず複数のアクション（最低2つ以上、理想的には3-5つ）を生成してください
- 「⚠️ 3. 改善が必要な領域」で特定した各課題に対して、対応するアクションを必ず生成してください
- アクションは具体的で実行可能なものにしてください
- レスポンスは完全に生成してください。途中で止めないでください。`;
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
