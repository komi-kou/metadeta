'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiConfig {
  gomarbleApiKey: string;
  claudeApiKey: string;
  chatworkApiToken: string;
  chatworkRoomId: string;
  selectedAdAccount: string;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
}

interface InsightsData {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
  cpc: number;
  frequency: number;
  reach: number;
  revenue: number;
  cpa: number;
  roas: number;
  cvr: number;
  date_start: string;
  date_stop: string;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
  cpc: number;
  reach: number;
  frequency: number;
  cpa: number;
}

export default function AdReportPage() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [campaignsData, setCampaignsData] = useState<CampaignData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState('last_7d');
  const [claudeAnalysis, setClaudeAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 設定を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('adReportConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  // データを取得
  const fetchData = async () => {
    if (!config || !config.gomarbleApiKey || !config.selectedAdAccount) {
      return;
    }

    setIsFetchingData(true);
    setError(null);

    try {
      // インサイトデータを取得
      const insightsResponse = await fetch('/api/meta/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (insightsResponse.ok) {
        const insightsResult = await insightsResponse.json();
        if (insightsResult.success) {
          setInsightsData(insightsResult.data);
        } else {
          setError(insightsResult.error || 'データ取得に失敗しました');
        }
      } else {
        const errorData = await insightsResponse.json();
        setError(errorData.message || 'インサイトデータの取得に失敗しました');
      }

      // キャンペーンデータを取得
      const campaignsResponse = await fetch('/api/meta/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (campaignsResponse.ok) {
        const campaignsResult = await campaignsResponse.json();
        if (campaignsResult.success) {
          setCampaignsData(campaignsResult.data);
        }
      }
    } catch (err) {
      setError(`エラーが発生しました: ${err}`);
    } finally {
      setIsFetchingData(false);
    }
  };

  // Claude分析を実行
  const analyzeWithClaude = async () => {
    if (!config || !config.claudeApiKey || !insightsData) {
      alert('Claude APIキーとデータが必要です');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/claude/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.claudeApiKey,
          insights: insightsData,
          campaigns: campaignsData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClaudeAnalysis(result.analysis);
        } else {
          alert('Claude分析に失敗しました');
        }
      } else {
        const errorData = await response.json();
        alert(`Claude分析エラー: ${errorData.error}`);
      }
    } catch (err) {
      alert(`エラーが発生しました: ${err}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 設定変更時に自動取得
  useEffect(() => {
    if (config && config.gomarbleApiKey && config.selectedAdAccount) {
      fetchData();
    }
  }, [config, datePreset]);

  // API設定がない場合
  if (!isLoading && (!config || !config.gomarbleApiKey || !config.selectedAdAccount)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              API設定が必要です
            </h1>
            <p className="text-gray-300 mb-8">
              広告レポートを表示するには、まずAPI連携設定を完了してください。
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/settings"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-bold text-lg transition-all"
              >
                ⚙️ API設定へ
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
              >
                ← ホーム
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    );
  }

  const datePresetOptions = [
    { value: 'today', label: '今日' },
    { value: 'yesterday', label: '昨日' },
    { value: 'last_7d', label: '過去7日' },
    { value: 'last_14d', label: '過去14日' },
    { value: 'last_30d', label: '過去30日' },
    { value: 'this_month', label: '今月' },
    { value: 'last_month', label: '先月' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 広告パフォーマンスレポート</h1>
            <p className="text-gray-300">アカウント: {config?.selectedAdAccount}</p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {datePresetOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchData}
              disabled={isFetchingData}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {isFetchingData ? '取得中...' : '🔄 更新'}
            </button>
            {insightsData && config?.claudeApiKey && (
              <button
                onClick={analyzeWithClaude}
                disabled={isAnalyzing}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {isAnalyzing ? '分析中...' : '🤖 AI分析'}
              </button>
            )}
            <Link
              href="/settings"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              ⚙️ 設定
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              ← ホーム
            </Link>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">❌ {error}</p>
            <p className="text-red-200 text-sm mt-2">
              トークンが無効または期限切れの可能性があります。設定ページで新しいトークンを取得してください。
            </p>
          </div>
        )}

        {/* データ読み込み中 */}
        {isFetchingData && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center mb-6">
            <div className="text-white text-lg">📡 データを取得中...</div>
          </div>
        )}

        {/* インサイトデータ表示 */}
        {insightsData && (
          <>
            {/* 期間表示 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm">
                データ期間: {insightsData.date_start} 〜 {insightsData.date_stop}
              </p>
            </div>

            {/* メインメトリクス */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
                <div className="text-blue-300 text-sm mb-2">広告費</div>
                <div className="text-white text-3xl font-bold">¥{insightsData.spend.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-md rounded-xl p-6 border border-green-500/20">
                <div className="text-green-300 text-sm mb-2">コンバージョン</div>
                <div className="text-white text-3xl font-bold">{insightsData.conversions.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
                <div className="text-purple-300 text-sm mb-2">ROAS</div>
                <div className="text-white text-3xl font-bold">{insightsData.roas.toFixed(2)}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-md rounded-xl p-6 border border-orange-500/20">
                <div className="text-orange-300 text-sm mb-2">CPA</div>
                <div className="text-white text-3xl font-bold">¥{insightsData.cpa.toLocaleString()}</div>
              </div>
            </div>

            {/* 詳細メトリクス */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">📈 詳細指標</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">インプレッション</div>
                  <div className="text-white text-xl font-semibold">{insightsData.impressions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">クリック数</div>
                  <div className="text-white text-xl font-semibold">{insightsData.clicks.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">CTR</div>
                  <div className="text-white text-xl font-semibold">{insightsData.ctr.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">CPC</div>
                  <div className="text-white text-xl font-semibold">¥{insightsData.cpc.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">CPM</div>
                  <div className="text-white text-xl font-semibold">¥{insightsData.cpm.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">リーチ</div>
                  <div className="text-white text-xl font-semibold">{insightsData.reach.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">フリークエンシー</div>
                  <div className="text-white text-xl font-semibold">{insightsData.frequency.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">CVR</div>
                  <div className="text-white text-xl font-semibold">{insightsData.cvr.toFixed(2)}%</div>
                </div>
              </div>
            </div>

            {/* キャンペーン別パフォーマンス */}
            {campaignsData.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">🎯 キャンペーン別パフォーマンス</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-gray-300 text-sm font-semibold pb-3">キャンペーン名</th>
                        <th className="text-gray-300 text-sm font-semibold pb-3">ステータス</th>
                        <th className="text-gray-300 text-sm font-semibold pb-3 text-right">広告費</th>
                        <th className="text-gray-300 text-sm font-semibold pb-3 text-right">IMP</th>
                        <th className="text-gray-300 text-sm font-semibold pb-3 text-right">クリック</th>
                        <th className="text-gray-300 text-sm font-semibold pb-3 text-right">CV</th>
                        <th className="text-gray-300 text-sm font-semibold pb-3 text-right">CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignsData.slice(0, 10).map((campaign) => (
                        <tr key={campaign.id} className="border-b border-white/10">
                          <td className="text-white py-3">{campaign.name}</td>
                          <td className="text-gray-300 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              campaign.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="text-white py-3 text-right">¥{campaign.spend.toLocaleString()}</td>
                          <td className="text-gray-300 py-3 text-right">{campaign.impressions.toLocaleString()}</td>
                          <td className="text-gray-300 py-3 text-right">{campaign.clicks.toLocaleString()}</td>
                          <td className="text-gray-300 py-3 text-right">{campaign.conversions.toFixed(0)}</td>
                          <td className="text-gray-300 py-3 text-right">¥{campaign.cpa.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Claude AI分析結果 */}
            {claudeAnalysis && (
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-4">🤖 AI分析レポート（Claude Sonnet 4.5）</h2>
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-gray-200 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: claudeAnalysis
                        .replace(/^### /gm, '<h3 class="text-xl font-bold text-white mt-6 mb-3">')
                        .replace(/^## /gm, '<h2 class="text-2xl font-bold text-white mt-8 mb-4">')
                        .replace(/^# /gm, '<h1 class="text-3xl font-bold text-white mt-8 mb-4">')
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                        .replace(/^- /gm, '• ')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
