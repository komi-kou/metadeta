'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-extrabold text-white mb-6 tracking-tight">
            📊 広告パフォーマンス<br/>レポートツール
          </h1>
          <p className="text-2xl text-blue-200 mb-3 font-medium">
            Meta/Facebook Ads × Claude AI × Chatwork
          </p>
          <p className="text-lg text-gray-400">
            自動分析・自動送信で広告運用を効率化
          </p>
        </div>

        {/* メインカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => router.push('/ad-report')}
            className="group bg-gradient-to-br from-blue-600/30 to-cyan-600/30 backdrop-blur-lg rounded-2xl p-10 border-2 border-blue-400/30 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-6xl mb-5">📊</div>
            <h2 className="text-3xl font-bold text-white mb-4">レポート表示</h2>
            <p className="text-gray-200 leading-relaxed mb-6 text-base">
              広告パフォーマンスを詳細に分析。<br/>
              キャンペーン別、クリエイティブ別のインサイトを確認。
            </p>
            <div className="text-blue-300 font-bold text-lg group-hover:gap-2 transition-all inline-flex items-center">
              レポートを見る
              <span className="ml-2 group-hover:ml-4 transition-all text-2xl">→</span>
            </div>
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="group bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-lg rounded-2xl p-10 border-2 border-purple-400/30 hover:border-purple-400/60 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-6xl mb-5">⚙️</div>
            <h2 className="text-3xl font-bold text-white mb-4">API設定</h2>
            <p className="text-gray-200 leading-relaxed mb-6 text-base">
              Meta Ads、Claude、Chatworkの<br/>
              API連携設定と自動送信の設定。
            </p>
            <div className="text-purple-300 font-bold text-lg group-hover:gap-2 transition-all inline-flex items-center">
              設定する
              <span className="ml-2 group-hover:ml-4 transition-all text-2xl">→</span>
            </div>
          </button>
        </div>

        {/* 機能説明 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🎯 主な機能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                📈 詳細分析
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                広告費、CPA、CTR、CVRなど全指標を自動取得・分析
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                🤖 AI分析
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                Claude AIが具体的なアクションプランを提案
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="font-bold text-white text-lg mb-2 flex items-center gap-2">
                💬 自動送信
              </div>
              <p className="text-gray-300 text-base leading-relaxed">
                Chatworkに定期的にレポートを自動配信
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
