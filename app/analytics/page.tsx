'use client';

import { useState } from 'react';
import Link from 'next/link';


export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periods = [
    { id: 'day', label: '今日' },
    { id: 'week', label: '今週' },
    { id: 'month', label: '今月' },
    { id: 'year', label: '今年' },
  ];

  const stats = [
    { label: '総訪問者数', value: '45,231', change: '+12.5%', trend: 'up', color: 'blue' },
    { label: 'ページビュー', value: '128,492', change: '+8.2%', trend: 'up', color: 'green' },
    { label: '直帰率', value: '32.4%', change: '-3.1%', trend: 'down', color: 'purple' },
    { label: '平均滞在時間', value: '3m 24s', change: '+15.7%', trend: 'up', color: 'orange' },
  ];

  const chartData = [
    { day: '月', value: 4200 },
    { day: '火', value: 5100 },
    { day: '水', value: 4800 },
    { day: '木', value: 6300 },
    { day: '金', value: 7200 },
    { day: '土', value: 5900 },
    { day: '日', value: 4500 },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value));

  const topPages = [
    { path: '/products', views: 12450, change: '+8.5%' },
    { path: '/about', views: 8920, change: '+12.3%' },
    { path: '/contact', views: 6340, change: '-2.1%' },
    { path: '/blog', views: 5780, change: '+5.7%' },
    { path: '/pricing', views: 4230, change: '+18.2%' },
  ];

  const trafficSources = [
    { source: 'オーガニック検索', percentage: 42, color: 'from-blue-500 to-cyan-500' },
    { source: 'ダイレクト', percentage: 28, color: 'from-green-500 to-teal-500' },
    { source: 'ソーシャルメディア', percentage: 18, color: 'from-purple-500 to-pink-500' },
    { source: 'リファラル', percentage: 12, color: 'from-orange-500 to-red-500' },
  ];

  const devices = [
    { name: 'デスクトップ', percentage: 58, icon: '💻' },
    { name: 'モバイル', percentage: 35, icon: '📱' },
    { name: 'タブレット', percentage: 7, icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-4xl font-bold text-white"
          >
            📈 アナリティクス
          </h1>
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
              ← ホームに戻る
            </Link>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-white/60 text-sm">{stat.label}</div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    stat.trend === 'up'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 訪問者数グラフ */}
          <div
            className="lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">週間訪問者数</h2>
            <div className="h-64 flex items-end justify-between gap-4">
              {chartData.map((data, index) => (
                <div
                  key={data.day}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg relative group">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-white/60 text-sm mt-2">{data.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* デバイス分布 */}
          <div
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">デバイス別</h2>
            <div className="space-y-6">
              {devices.map((device, index) => (
                <div
                  key={device.name}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-2xl">{device.icon}</span>
                      <span className="font-semibold">{device.name}</span>
                    </div>
                    <span className="text-white font-bold">{device.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* トップページ */}
          <div
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">トップページ</h2>
            <div className="space-y-3">
              {topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="flex-1">
                    <div className="text-white font-semibold">{page.path}</div>
                    <div className="text-white/60 text-sm">
                      {page.views.toLocaleString()} ビュー
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      page.change.startsWith('+')
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {page.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* トラフィックソース */}
          <div
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">トラフィックソース</h2>
            <div className="space-y-6">
              {trafficSources.map((source, index) => (
                <div
                  key={source.source}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{source.source}</span>
                    <span className="text-white font-bold">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${source.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
