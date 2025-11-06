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

export default function AdReportPage() {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 設定を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('adReportConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

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

            <div className="space-y-4 text-left mb-8">
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">📋 必要な設定：</h3>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className={config?.gomarbleApiKey ? '✅' : '❌'}>
                      {config?.gomarbleApiKey ? '✅' : '❌'}
                    </span>
                    <span>Meta User Access Token（Facebook Ads API用）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={config?.selectedAdAccount ? '✅' : '❌'}>
                      {config?.selectedAdAccount ? '✅' : '❌'}
                    </span>
                    <span>広告アカウントの選択</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={config?.claudeApiKey ? '✅' : '⚪'}>
                      {config?.claudeApiKey ? '✅' : '⚪'}
                    </span>
                    <span>Claude APIキー（AI分析用、オプション）</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={config?.chatworkApiToken ? '✅' : '⚪'}>
                      {config?.chatworkApiToken ? '✅' : '⚪'}
                    </span>
                    <span>Chatwork API（レポート送信用、オプション）</span>
                  </li>
                </ul>
              </div>
            </div>

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

  // API設定がある場合（将来的に実装）
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 広告パフォーマンスレポート</h1>
            <p className="text-gray-300">アカウント: {config?.selectedAdAccount}</p>
          </div>
          <div className="flex gap-4">
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

        {/* 実装予定の表示 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            レポート機能は実装中です
          </h2>
          <p className="text-gray-300 mb-6">
            Meta Ads APIからデータを取得して、ここにパフォーマンスレポートを表示する機能を実装予定です。
          </p>
          <div className="bg-white/5 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-white font-semibold mb-3">📋 実装予定の機能：</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• 広告パフォーマンスサマリー（費用、ROAS、CPA、コンバージョン等）</li>
              <li>• キャンペーン別パフォーマンス分析</li>
              <li>• 広告セット/クリエイティブ分析</li>
              <li>• 日別トレンドグラフ</li>
              <li>• Claude AIによる分析とアクションプラン</li>
              <li>• Chatworkへの自動レポート送信</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
