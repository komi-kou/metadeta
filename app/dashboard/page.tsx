'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: 'アクティブユーザー', value: '12,458', change: '+12.5%', trend: 'up' },
    { label: '今月の売上', value: '¥2,345,000', change: '+8.3%', trend: 'up' },
    { label: 'コンバージョン率', value: '3.24%', change: '-2.1%', trend: 'down' },
    { label: '平均セッション時間', value: '4m 32s', change: '+5.7%', trend: 'up' },
  ];

  const recentActivities = [
    { id: 1, user: '田中太郎', action: '新規登録', time: '2分前', color: 'blue' },
    { id: 2, user: '佐藤花子', action: '商品購入', time: '15分前', color: 'green' },
    { id: 3, user: '鈴木一郎', action: 'ログイン', time: '23分前', color: 'purple' },
    { id: 4, user: '高橋美咲', action: 'プロフィール更新', time: '1時間前', color: 'orange' },
  ];

  const tasks = [
    { id: 1, title: 'デザインレビュー', completed: false },
    { id: 2, title: 'バグ修正 #234', completed: true },
    { id: 3, title: '週次ミーティング', completed: false },
    { id: 4, title: 'ドキュメント更新', completed: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">📊 ダッシュボード</h1>
            <p className="text-gray-400">
              {currentTime.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </motion.div>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* メトリクスカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 時計ウィジェット */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6">🕐 現在時刻</h2>
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2">
                {currentTime.toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
              <div className="text-gray-400">
                {currentTime.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
              </div>
            </div>
          </motion.div>

          {/* クイックアクションウィジェット */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6">⚡ クイックアクション</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-left">
                📝 新規レポート作成
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-left">
                📧 メール送信
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-left">
                👥 チーム招待
              </button>
            </div>
          </motion.div>

          {/* タスクリストウィジェット */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <h2 className="text-xl font-bold text-white mb-6">✅ 今日のタスク</h2>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    task.completed ? 'bg-white/5' : 'bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="w-5 h-5 rounded"
                    readOnly
                  />
                  <span
                    className={`flex-1 ${
                      task.completed ? 'line-through text-gray-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 最近のアクティビティ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">🔔 最近のアクティビティ</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              >
                <div className={`w-12 h-12 rounded-full bg-${activity.color}-500/20 flex items-center justify-center text-2xl`}>
                  👤
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{activity.user}</div>
                  <div className="text-gray-400 text-sm">{activity.action}</div>
                </div>
                <div className="text-gray-500 text-sm">{activity.time}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
