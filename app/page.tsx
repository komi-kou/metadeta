'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            📊 広告パフォーマンスレポートツール
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Meta/Facebook Ads × Claude AI × Chatwork
          </p>
          <p className="text-gray-400">
            自動分析・自動送信で広告運用を効率化
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/ad-report')}
            className="group bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all"
          >
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-3">レポート表示</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              広告パフォーマンスを詳細に分析。
              キャンペーン別、クリエイティブ別のインサイトを確認。
            </p>
            <div className="text-blue-400 font-semibold group-hover:gap-2 transition-all inline-flex items-center">
              レポートを見る
              <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all"
          >
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold text-white mb-3">API設定</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              GoMarble、Claude、Chatworkの
              API連携設定と自動送信の設定。
            </p>
            <div className="text-purple-400 font-semibold group-hover:gap-2 transition-all inline-flex items-center">
              設定する
              <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </button>
        </div>

        <div className="mt-12 bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">🎯 主な機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-gray-300">
              <div className="font-semibold text-white mb-1">📈 詳細分析</div>
              広告費、ROAS、CPA、CTRなど全指標を自動取得・分析
            </div>
            <div className="text-gray-300">
              <div className="font-semibold text-white mb-1">🤖 AI分析</div>
              Claude AIが具体的なアクションプランを提案
            </div>
            <div className="text-gray-300">
              <div className="font-semibold text-white mb-1">💬 自動送信</div>
              Chatworkに定期的にレポートを自動配信
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
