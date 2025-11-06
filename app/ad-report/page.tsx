'use client';

import { useState } from 'react';
import Link from 'next/link';
import { mockAdData } from '@/lib/mockData';

export default function AdReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { summary, campaignPerformance, adSetAnalysis, creativeAnalysis, dailyTrend, actionPlans, insights } = mockAdData;

  const periods = [
    { id: 'day', label: '日別' },
    { id: 'week', label: '週次' },
    { id: 'month', label: '月次' },
  ];

  // 前期比計算
  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: change.toFixed(1),
      isPositive: change >= 0
    };
  };

  const spendChange = calculateChange(summary.spend, summary.previousPeriod.spend);
  const conversionsChange = calculateChange(summary.conversions, summary.previousPeriod.conversions);
  const roasChange = calculateChange(summary.roas, summary.previousPeriod.roas);

  const mainMetrics = [
    {
      label: '広告費',
      value: `¥${summary.spend.toLocaleString()}`,
      change: spendChange.value + '%',
      trend: spendChange.isPositive ? 'up' : 'down',
      color: 'blue'
    },
    {
      label: 'コンバージョン',
      value: summary.conversions.toLocaleString(),
      change: conversionsChange.value + '%',
      trend: conversionsChange.isPositive ? 'up' : 'down',
      color: 'green'
    },
    {
      label: 'ROAS',
      value: summary.roas.toFixed(1),
      change: roasChange.value + '%',
      trend: roasChange.isPositive ? 'up' : 'down',
      color: 'purple'
    },
    {
      label: 'CPA',
      value: `¥${summary.cpa.toLocaleString()}`,
      change: '-5.2%',
      trend: 'down',
      color: 'orange'
    },
  ];

  const detailMetrics = [
    { label: 'インプレッション', value: summary.impressions.toLocaleString() },
    { label: 'クリック数', value: summary.clicks.toLocaleString() },
    { label: 'CTR', value: summary.ctr.toFixed(2) + '%' },
    { label: 'CPC', value: `¥${summary.cpc.toLocaleString()}` },
    { label: 'CPM', value: `¥${summary.cpm.toLocaleString()}` },
    { label: 'リーチ', value: summary.reach.toLocaleString() },
    { label: 'フリークエンシー', value: summary.frequency.toFixed(2) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 広告パフォーマンスレポート</h1>
            <p className="text-gray-300">{summary.period}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-white text-indigo-900'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
            >
              ← ホーム
            </Link>
          </div>
        </div>

        {/* メインメトリクス */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="text-gray-400 text-sm mb-2">{metric.label}</div>
              <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
              <div
                className={`text-sm font-semibold ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
              </div>
            </div>
          ))}
        </div>

        {/* 詳細メトリクス */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">詳細指標</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {detailMetrics.map((metric) => (
              <div key={metric.label} className="bg-white/5 rounded-lg p-4">
                <div className="text-gray-400 text-xs mb-1">{metric.label}</div>
                <div className="text-xl font-bold text-white">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* キャンペーン別パフォーマンス */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">キャンペーン別パフォーマンス (Top 5)</h2>
            <div className="space-y-4">
              {campaignPerformance.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-white/40">#{index + 1}</div>
                      <div>
                        <div className="font-semibold text-white">{campaign.name}</div>
                        <div className="text-sm text-gray-400">
                          {campaign.conversions}件 • ROAS {campaign.roas}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded text-sm font-semibold ${
                      campaign.trend === 'up' ? 'bg-green-500/20 text-green-300' :
                      campaign.trend === 'down' ? 'bg-red-500/20 text-red-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {campaign.trend === 'up' ? '↑' : campaign.trend === 'down' ? '↓' : '→'}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">広告費</div>
                      <div className="text-white font-semibold">¥{campaign.spend.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">CTR</div>
                      <div className="text-white font-semibold">{campaign.ctr}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">CPA</div>
                      <div className="text-white font-semibold">¥{campaign.cpa.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">状態</div>
                      <div className={`font-semibold ${
                        campaign.status === 'active' ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {campaign.status === 'active' ? '配信中' : '停止中'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* アクションプラン */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">🎯 アクションプラン</h2>
            <div className="space-y-4">
              {actionPlans.map((plan, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${
                      plan.priority === 'high' ? 'bg-red-500 text-white' :
                      plan.priority === 'medium' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {plan.priority === 'high' ? '高' : plan.priority === 'medium' ? '中' : '低'}
                    </div>
                    <div className="font-semibold text-white text-sm">{plan.title}</div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{plan.description}</p>
                  <div className="text-xs text-green-400 font-semibold">{plan.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 日別トレンド */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">日別トレンド (過去7日間)</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {dailyTrend.map((day, index) => {
              const maxConversions = Math.max(...dailyTrend.map(d => d.conversions));
              const height = (day.conversions / maxConversions) * 100;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative group">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all group-hover:from-blue-400 group-hover:to-cyan-400"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.conversions}件
                      </div>
                    </div>
                  </div>
                  <div className="text-white/60 text-xs mt-2">{day.date}</div>
                  <div className="text-white/80 text-xs font-semibold">{day.roas}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* クリエイティブ分析 */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">クリエイティブ詳細分析</h2>
          <div className="space-y-4">
            {creativeAnalysis.map((creative) => (
              <div
                key={creative.id}
                className="bg-white/5 rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-semibold text-white mb-1">{creative.name}</div>
                    <div className="text-sm text-gray-400">
                      {creative.type === 'video' ? '動画' : creative.type === 'image' ? '画像' : 'カルーセル'} •
                      {creative.daysRunning}日稼働中
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">疲弊度</div>
                    <div className={`text-2xl font-bold ${
                      creative.fatigue < 30 ? 'text-green-400' :
                      creative.fatigue < 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {creative.fatigue}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-400">IMP</div>
                    <div className="text-sm font-semibold text-white">{(creative.impressions / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Click</div>
                    <div className="text-sm font-semibold text-white">{creative.clicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">CTR</div>
                    <div className="text-sm font-semibold text-white">{creative.ctr}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">CV</div>
                    <div className="text-sm font-semibold text-white">{creative.conversions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">CVR</div>
                    <div className="text-sm font-semibold text-white">{creative.cvr}%</div>
                  </div>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-3">
                  <div className="text-xs text-blue-300">{creative.recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* インサイト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">💡 総合評価</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-300 font-semibold mb-2">サマリー</div>
                <p className="text-white/90 text-sm leading-relaxed">{insights.performanceAnalysis.summary}</p>
              </div>
              <div>
                <div className="text-sm text-green-400 font-semibold mb-2">✓ 強み</div>
                <ul className="space-y-1">
                  {insights.performanceAnalysis.strengths.map((strength, i) => (
                    <li key={i} className="text-white/80 text-sm">• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm text-yellow-400 font-semibold mb-2">⚠ 懸念点</div>
                <ul className="space-y-1">
                  {insights.performanceAnalysis.concerns.map((concern, i) => (
                    <li key={i} className="text-white/80 text-sm">• {concern}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">🏆 勝ちパターン分析</h2>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-3">最高パフォーマンス</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">クリエイティブ</span>
                    <span className="text-white font-semibold text-sm">{insights.winningPattern.bestPerforming.creativeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">ターゲット</span>
                    <span className="text-white font-semibold text-sm">{insights.winningPattern.bestPerforming.targetAudience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">メッセージ</span>
                    <span className="text-white font-semibold text-sm">{insights.winningPattern.bestPerforming.message}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white/60 text-sm">平均ROAS</span>
                    <span className="text-green-400 font-bold text-lg">{insights.winningPattern.bestPerforming.avgROAS}</span>
                  </div>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{insights.winningPattern.insights}</p>

              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 mt-4">
                <div className="text-sm text-blue-300 font-semibold mb-2">📅 次週に向けて</div>
                <p className="text-white/90 text-sm leading-relaxed">{insights.nextWeekAdvice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
