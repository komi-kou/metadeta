#!/usr/bin/env tsx

/**
 * 広告レポート自動生成・送信スクリプト
 *
 * 使用方法:
 * npm run generate-report -- --period weekly --account-id 123456789
 *
 * 環境変数:
 * - GOMARBLE_API_KEY: GoMarble APIキー
 * - CHATWORK_API_TOKEN: Chatwork APIトークン
 * - CHATWORK_ROOM_ID: 送信先ChatworkルームID
 * - ANTHROPIC_API_KEY: Claude APIキー
 */

import { getAdAccountInsights, getCampaignInsights } from '../lib/api/gomarble';
import { sendScheduledReport, ChatworkConfig } from '../lib/api/chatwork';
import { analyzeAdDataWithClaude } from '../lib/api/claude';

interface ReportConfig {
  period: 'daily' | 'weekly' | 'monthly';
  adAccountId: string;
  sendToChatwork?: boolean;
  saveToFile?: boolean;
}

async function generateReport(config: ReportConfig) {
  console.log(`📊 広告レポート生成開始...`);
  console.log(`期間: ${config.period}`);
  console.log(`アカウントID: ${config.adAccountId}`);

  try {
    // 1. GoMarbleからデータ取得
    console.log('\n1️⃣ GoMarble APIからデータ取得中...');
    const datePreset = config.period === 'daily' ? 'yesterday' :
                      config.period === 'weekly' ? 'last_7d' : 'last_30d';

    const accountInsights = await getAdAccountInsights(config.adAccountId, datePreset);
    const campaigns = await getCampaignInsights(config.adAccountId, datePreset, 50);

    console.log(`✓ アカウントデータ取得完了`);
    console.log(`✓ キャンペーン ${campaigns.length}件 取得完了`);

    // 2. Claude APIでデータ分析
    console.log('\n2️⃣ Claude APIで分析中...');
    const analysis = await analyzeAdDataWithClaude({
      adData: {
        summary: accountInsights,
        campaigns,
      },
      analysisType: 'full',
      period: config.period,
    });

    console.log(`✓ 分析完了`);
    console.log(`  - インサイト: ${analysis.insights.length}件`);
    console.log(`  - 推奨アクション: ${analysis.recommendations.length}件`);

    // 3. レポートデータを整形
    const reportData = {
      summary: {
        period: getPeriodLabel(config.period),
        ...accountInsights,
        previousPeriod: {}, // 前期データは別途取得が必要
      },
      campaignPerformance: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        ...c.insights,
      })),
      actionPlans: analysis.recommendations.map((rec, i) => ({
        priority: i === 0 ? 'high' : 'medium',
        title: rec.split(':')[0] || rec,
        description: rec,
        impact: '要検証',
      })),
      insights: {
        performanceAnalysis: {
          overall: 'good',
          summary: analysis.summary,
          strengths: analysis.insights.filter(i => !i.includes('懸念') && !i.includes('注意')),
          concerns: analysis.alerts,
        },
        nextWeekAdvice: analysis.recommendations[0] || '継続的な最適化を推奨します',
      },
    };

    // 4. Chatworkに送信
    if (config.sendToChatwork) {
      console.log('\n3️⃣ Chatworkに送信中...');

      const chatworkConfig: ChatworkConfig = {
        apiToken: process.env.CHATWORK_API_TOKEN || '',
        roomId: process.env.CHATWORK_ROOM_ID || '',
      };

      if (!chatworkConfig.apiToken || !chatworkConfig.roomId) {
        console.warn('⚠️  Chatwork設定が不完全です。送信をスキップします。');
      } else {
        await sendScheduledReport(chatworkConfig, reportData, config.period);
        console.log(`✓ Chatworkに送信完了`);
      }
    }

    // 5. ファイルに保存
    if (config.saveToFile) {
      const fs = await import('fs/promises');
      const filename = `report-${config.period}-${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeFile(filename, JSON.stringify(reportData, null, 2));
      console.log(`\n✓ レポートをファイルに保存: ${filename}`);
    }

    console.log('\n✅ レポート生成完了！');
    return reportData;

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    throw error;
  }
}

function getPeriodLabel(period: string): string {
  const now = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  switch (period) {
    case 'daily':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return formatDate(yesterday);
    case 'weekly':
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return `${formatDate(weekAgo)} ~ ${formatDate(now)}`;
    case 'monthly':
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return `${formatDate(monthAgo)} ~ ${formatDate(now)}`;
    default:
      return formatDate(now);
  }
}

// CLIとして実行
if (require.main === module) {
  const args = process.argv.slice(2);
  const period = args.find(arg => arg.startsWith('--period='))?.split('=')[1] as any || 'weekly';
  const accountId = args.find(arg => arg.startsWith('--account-id='))?.split('=')[1] || '';
  const sendToChatwork = args.includes('--send-chatwork');
  const saveToFile = args.includes('--save-file');

  if (!accountId) {
    console.error('エラー: --account-id が必要です');
    process.exit(1);
  }

  generateReport({
    period,
    adAccountId: accountId,
    sendToChatwork,
    saveToFile,
  }).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export { generateReport };
