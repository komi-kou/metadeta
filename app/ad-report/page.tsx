'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  cvr: number;
  date_start: string;
  date_stop: string;
}

interface ComparisonData {
  value: number;
  percentage: number;
}

interface InsightsComparison {
  current: InsightsData;
  previous: InsightsData | null;
  comparison: {
    spend: ComparisonData;
    impressions: ComparisonData;
    clicks: ComparisonData;
    conversions: ComparisonData;
    ctr: ComparisonData;
    cpm: ComparisonData;
    cpc: ComparisonData;
    frequency: ComparisonData;
    reach: ComparisonData;
    revenue: ComparisonData;
    cpa: ComparisonData;
    cvr: ComparisonData;
  } | null;
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
  cvr: number;
}

export default function AdReportPage() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [comparisonData, setComparisonData] = useState<InsightsComparison | null>(null);
  const [campaignsData, setCampaignsData] = useState<CampaignData[]>([]);
  const [adsetsData, setAdsetsData] = useState<any[]>([]);
  const [adsData, setAdsData] = useState<any[]>([]);
  const [dailyTrendsData, setDailyTrendsData] = useState<any[]>([]);
  const [demographicsData, setDemographicsData] = useState<any>(null);
  const [geographyData, setGeographyData] = useState<any>(null);
  const [placementsData, setPlacementsData] = useState<any>(null);
  const [devicesData, setDevicesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState('last_7d');
  const [claudeAnalysis, setClaudeAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSendingToChatwork, setIsSendingToChatwork] = useState(false);

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
      // 比較データを取得（現在期間 vs 前期間）
      const insightsResponse = await fetch('/api/meta/insights-comparison', {
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
          setComparisonData(insightsResult);
          setInsightsData(insightsResult.current);
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

      // 広告セットデータを取得
      const adsetsResponse = await fetch('/api/meta/adsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (adsetsResponse.ok) {
        const adsetsResult = await adsetsResponse.json();
        if (adsetsResult.success) {
          setAdsetsData(adsetsResult.data);
        }
      }

      // 広告データを取得
      const adsResponse = await fetch('/api/meta/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (adsResponse.ok) {
        const adsResult = await adsResponse.json();
        if (adsResult.success) {
          setAdsData(adsResult.data);
        }
      }

      // 日別トレンドデータを取得（過去7日間）
      const dailyTrendsResponse = await fetch('/api/meta/daily-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          days: 7
        }),
      });

      if (dailyTrendsResponse.ok) {
        const dailyTrendsResult = await dailyTrendsResponse.json();
        if (dailyTrendsResult.success) {
          setDailyTrendsData(dailyTrendsResult.data);
        }
      }

      // デモグラフィックデータを取得（年齢・性別）
      const demographicsResponse = await fetch('/api/meta/demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (demographicsResponse.ok) {
        const demographicsResult = await demographicsResponse.json();
        if (demographicsResult.success) {
          setDemographicsData(demographicsResult.data);
        }
      }

      // 地域データを取得（国・地域）
      const geographyResponse = await fetch('/api/meta/geography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (geographyResponse.ok) {
        const geographyResult = await geographyResponse.json();
        if (geographyResult.success) {
          setGeographyData(geographyResult.data);
        }
      }

      // プレースメントデータを取得（配信面）
      const placementsResponse = await fetch('/api/meta/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (placementsResponse.ok) {
        const placementsResult = await placementsResponse.json();
        if (placementsResult.success) {
          setPlacementsData(placementsResult.data);
        }
      }

      // デバイスデータを取得
      const devicesResponse = await fetch('/api/meta/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.gomarbleApiKey,
          accountId: config.selectedAdAccount,
          datePreset
        }),
      });

      if (devicesResponse.ok) {
        const devicesResult = await devicesResponse.json();
        if (devicesResult.success) {
          setDevicesData(devicesResult.data);
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
          comparison: comparisonData,
          campaigns: campaignsData,
          adsets: adsetsData,
          ads: adsData,
          dailyTrends: dailyTrendsData,
          demographics: demographicsData,
          geography: geographyData,
          placements: placementsData,
          devices: devicesData
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

  // Chatworkにレポートを送信
  const sendToChatwork = async () => {
    if (!config || !config.chatworkApiToken || !config.chatworkRoomId || !insightsData) {
      alert('Chatwork設定とデータが必要です。設定ページで設定を完了してください。');
      return;
    }

    const confirmed = window.confirm(
      `Chatworkルーム ${config.chatworkRoomId} にレポートを送信しますか？`
    );

    if (!confirmed) return;

    setIsSendingToChatwork(true);
    try {
      const response = await fetch('/api/chatwork/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken: config.chatworkApiToken,
          roomId: config.chatworkRoomId,
          insights: insightsData,
          campaigns: campaignsData,
          analysis: claudeAnalysis
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ レポートをChatworkに送信しました！');
        } else {
          alert('❌ レポート送信に失敗しました');
        }
      } else {
        const errorData = await response.json();
        alert(`❌ Chatwork送信エラー: ${errorData.error || '不明なエラー'}\n\n設定ページでAPIトークンとルームIDを確認してください。`);
      }
    } catch (err) {
      alert(`❌ エラーが発生しました: ${err}`);
    } finally {
      setIsSendingToChatwork(false);
    }
  };

  // 設定変更時に自動取得
  useEffect(() => {
    if (config && config.gomarbleApiKey && config.selectedAdAccount) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, datePreset]);

  // 比較インジケーターを表示するヘルパー関数
  const renderComparison = (comparison: ComparisonData | undefined) => {
    if (!comparison || !comparisonData?.previous) return null;

    const isPositive = comparison.percentage > 0;
    const isNegative = comparison.percentage < 0;

    if (comparison.percentage === 0) return null;

    return (
      <div className={`text-base font-bold ml-3 ${
        isPositive ? 'text-green-400' : 'text-red-400'
      }`}>
        {isPositive ? '↑' : '↓'} {Math.abs(comparison.percentage).toFixed(1)}%
      </div>
    );
  };

  // API設定がない場合
  if (!isLoading && (!config || !config.gomarbleApiKey || !config.selectedAdAccount)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border-2 border-white/20 shadow-xl">
            <div className="text-8xl mb-8">⚠️</div>
            <h1 className="text-5xl font-extrabold text-white mb-6">
              API設定が必要です
            </h1>
            <p className="text-xl text-gray-200 mb-10 leading-relaxed">
              広告レポートを表示するには、まずAPI連携設定を完了してください。
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href="/settings"
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                ⚙️ API設定へ
              </Link>
              <Link
                href="/"
                className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xl transition-all border-2 border-white/20"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">読み込み中...</div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-6xl font-extrabold text-white mb-3">📊 広告パフォーマンスレポート</h1>
            <p className="text-xl text-blue-200 font-medium">アカウント: {config?.selectedAdAccount}</p>
          </div>
          <div className="flex gap-4 items-center">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
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
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50"
            >
              {isFetchingData ? '取得中...' : '🔄 更新'}
            </button>
            {insightsData && config?.claudeApiKey && (
              <button
                onClick={analyzeWithClaude}
                disabled={isAnalyzing}
                className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50"
              >
                {isAnalyzing ? '分析中...' : '🤖 AI分析'}
              </button>
            )}
            {insightsData && config?.chatworkApiToken && config?.chatworkRoomId && (
              <button
                onClick={sendToChatwork}
                disabled={isSendingToChatwork}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50"
              >
                {isSendingToChatwork ? '送信中...' : '📤 Chatwork送信'}
              </button>
            )}
            <Link
              href="/settings"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-base transition-colors backdrop-blur-sm border-2 border-white/20"
            >
              ⚙️ 設定
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-base transition-colors backdrop-blur-sm border-2 border-white/20"
            >
              ← ホーム
            </Link>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-6 mb-8 shadow-lg">
            <p className="text-red-200 text-lg font-bold">❌ {error}</p>
            <p className="text-red-200 text-base mt-3">
              トークンが無効または期限切れの可能性があります。設定ページで新しいトークンを取得してください。
            </p>
          </div>
        )}

        {/* データ読み込み中 */}
        {isFetchingData && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border-2 border-white/20 text-center mb-8 shadow-xl">
            <div className="text-white text-2xl font-bold">📡 データを取得中...</div>
          </div>
        )}

        {/* インサイトデータ表示 */}
        {insightsData && (
          <>
            {/* 期間表示 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border-2 border-white/10">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-blue-300 text-sm font-semibold mb-2">現在期間</p>
                  <p className="text-white text-lg font-bold">
                    {insightsData.date_start} 〜 {insightsData.date_stop}
                  </p>
                </div>
                {comparisonData?.previous && (
                  <>
                    <div className="text-gray-400 text-xl font-bold">vs</div>
                    <div>
                      <p className="text-gray-400 text-sm font-semibold mb-2">前期間</p>
                      <p className="text-gray-300 text-lg font-semibold">
                        {comparisonData.previous.date_start} 〜 {comparisonData.previous.date_stop}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* メインメトリクス */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-md rounded-2xl p-8 border-2 border-blue-500/30 shadow-xl">
                <div className="text-blue-200 text-lg font-semibold mb-3">広告費</div>
                <div className="flex items-center">
                  <div className="text-white text-4xl font-extrabold">¥{insightsData.spend.toLocaleString()}</div>
                  {renderComparison(comparisonData?.comparison?.spend)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-md rounded-2xl p-8 border-2 border-green-500/30 shadow-xl">
                <div className="text-green-200 text-lg font-semibold mb-3">コンバージョン</div>
                <div className="flex items-center">
                  <div className="text-white text-4xl font-extrabold">{insightsData.conversions.toLocaleString()}</div>
                  {renderComparison(comparisonData?.comparison?.conversions)}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-md rounded-2xl p-8 border-2 border-orange-500/30 shadow-xl">
                <div className="text-orange-200 text-lg font-semibold mb-3">CPA</div>
                <div className="flex items-center">
                  <div className="text-white text-4xl font-extrabold">¥{insightsData.cpa.toLocaleString()}</div>
                  {renderComparison(comparisonData?.comparison?.cpa)}
                </div>
              </div>
            </div>

            {/* 詳細メトリクス */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 mb-10 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-6">📈 詳細指標</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">インプレッション</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">{insightsData.impressions.toLocaleString()}</div>
                    {renderComparison(comparisonData?.comparison?.impressions)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">クリック数</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">{insightsData.clicks.toLocaleString()}</div>
                    {renderComparison(comparisonData?.comparison?.clicks)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">CTR</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">{insightsData.ctr.toFixed(2)}%</div>
                    {renderComparison(comparisonData?.comparison?.ctr)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">CPC</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">¥{insightsData.cpc.toFixed(0)}</div>
                    {renderComparison(comparisonData?.comparison?.cpc)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">CPM</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">¥{insightsData.cpm.toFixed(0)}</div>
                    {renderComparison(comparisonData?.comparison?.cpm)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">リーチ</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">{insightsData.reach.toLocaleString()}</div>
                    {renderComparison(comparisonData?.comparison?.reach)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">フリークエンシー</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">{insightsData.frequency.toFixed(2)}</div>
                    {renderComparison(comparisonData?.comparison?.frequency)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300 text-base font-semibold mb-2">CVR</div>
                  <div className="flex items-center">
                    <div className="text-white text-2xl font-bold">{insightsData.cvr.toFixed(2)}%</div>
                    {renderComparison(comparisonData?.comparison?.cvr)}
                  </div>
                </div>
              </div>
            </div>

            {/* キャンペーン別パフォーマンス */}
            {campaignsData.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 mb-10 shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-6">🎯 キャンペーン別パフォーマンス</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-white/30">
                        <th className="text-gray-200 text-base font-bold pb-4">キャンペーン名</th>
                        <th className="text-gray-200 text-base font-bold pb-4">ステータス</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">広告費</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">IMP</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">クリック</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">CTR</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">CPC</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">CPM</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">リーチ</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">Freq</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">CV</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">CVR</th>
                        <th className="text-gray-200 text-base font-bold pb-4 text-right">CPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignsData.slice(0, 10).map((campaign) => (
                        <tr key={campaign.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="text-white py-4 text-base font-medium">{campaign.name}</td>
                          <td className="text-gray-300 py-4">
                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                              campaign.status === 'ACTIVE' ? 'bg-green-500/30 text-green-200 border border-green-400/50' : 'bg-gray-500/30 text-gray-300 border border-gray-400/50'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="text-white py-4 text-right text-base font-semibold">¥{campaign.spend.toLocaleString()}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.impressions.toLocaleString()}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.clicks.toLocaleString()}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.ctr.toFixed(2)}%</td>
                          <td className="text-gray-200 py-4 text-right text-base">¥{campaign.cpc.toFixed(0)}</td>
                          <td className="text-gray-200 py-4 text-right text-base">¥{campaign.cpm.toFixed(0)}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.reach.toLocaleString()}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.frequency.toFixed(2)}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.conversions.toFixed(0)}</td>
                          <td className="text-gray-200 py-4 text-right text-base">{campaign.cvr.toFixed(2)}%</td>
                          <td className="text-gray-200 py-4 text-right text-base">¥{campaign.cpa.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 日別トレンド */}
            {dailyTrendsData.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20 mb-10 shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-8">📊 日別トレンド（過去7日間）</h2>

                {/* 広告費とコンバージョンのグラフ */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-white mb-5">広告費・コンバージョン推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#3B82F6"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#10B981"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="spend"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="広告費 (¥)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="conversions"
                        stroke="#10B981"
                        strokeWidth={2}
                        name="コンバージョン"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* CPAのグラフ */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-white mb-5">CPA推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis
                        stroke="#F59E0B"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cpa"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        name="CPA (¥)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* CTRとCVRのグラフ */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-5">CTR・CVR推移</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="ctr"
                        fill="#06B6D4"
                        name="CTR (%)"
                      />
                      <Bar
                        dataKey="cvr"
                        fill="#EC4899"
                        name="CVR (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Claude AI分析結果 */}
            {claudeAnalysis && (
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-md rounded-2xl p-10 border-2 border-purple-500/30 shadow-xl">
                <h2 className="text-4xl font-extrabold text-white mb-8">🤖 AI分析レポート（Claude Sonnet 4.5）</h2>
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-gray-100 markdown-content text-base leading-relaxed"
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{
                      __html: claudeAnalysis
                        // テーブルのレンダリング（より大きく読みやすく）
                        .replace(/\|(.+)\|/g, (match) => {
                          const cells = match.split('|').filter(c => c.trim());
                          const isHeaderSeparator = cells.every(c => /^[-:]+$/.test(c.trim()));
                          if (isHeaderSeparator) return '';

                          const cellsHtml = cells.map(c =>
                            `<td class="border-2 border-purple-500/30 px-4 py-3 text-base bg-purple-900/20">${c.trim()}</td>`
                          ).join('');
                          return `<tr>${cellsHtml}</tr>`;
                        })
                        .replace(/(<tr>.+<\/tr>[\s\S]*?<tr>.+<\/tr>)/g, '<table class="w-full border-collapse border-2 border-purple-500/30 my-6 rounded-lg overflow-hidden shadow-lg">$1</table>')
                        // 見出し（大きく目立つように）
                        .replace(/^### (.+)$/gm, '<h3 class="text-2xl font-bold text-white mt-8 mb-4 border-l-4 border-purple-400 pl-4 py-2 bg-purple-900/20 rounded-r-lg">$1</h3>')
                        .replace(/^## (.+)$/gm, '<h2 class="text-3xl font-extrabold text-white mt-10 mb-5 border-l-4 border-purple-500 pl-4 py-2 bg-purple-900/30 rounded-r-lg">$1</h2>')
                        .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-extrabold text-white mt-10 mb-6">$1</h1>')
                        // 太字（より強調）
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold bg-purple-900/30 px-1 rounded">$1</strong>')
                        // チェックボックス（より大きく）
                        .replace(/- \[ \] /g, '<span class="text-gray-400 text-lg mr-2">☐</span> ')
                        .replace(/- \[x\] /g, '<span class="text-green-400 text-lg mr-2">☑</span> ')
                        // リスト（スペースと余白を増やす）
                        .replace(/^- (.+)$/gm, '<div class="ml-6 my-2 text-base">• $1</div>')
                        .replace(/^(\d+)\. (.+)$/gm, '<div class="ml-6 my-2 text-base font-medium">$1. $2</div>')
                        // 改行
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
