'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';


export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // タイマー終了
            setIsActive(false);
            if (mode === 'work') {
              setCompletedSessions((prev) => prev + 1);
              setMode('break');
              setMinutes(5);
            } else {
              setMode('work');
              setMinutes(25);
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'work') {
      setMinutes(25);
    } else {
      setMinutes(5);
    }
    setSeconds(0);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            ⏱️ ポモドーロタイマー
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            ← ホームに戻る
          </Link>
        </div>

        <div
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 shadow-2xl"
        >
          {/* モード切替 */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => switchMode('work')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                mode === 'work'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              作業時間
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                mode === 'break'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              休憩時間
            </button>
          </div>

          {/* タイマー表示 */}
          <div className="relative flex items-center justify-center mb-12">
            <svg className="transform -rotate-90" width="300" height="300">
              {/* 背景円 */}
              <circle
                cx="150"
                cy="150"
                r="140"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="12"
                fill="none"
              />
              {/* 進捗円 */}
              <circle
                cx="150"
                cy="150"
                r="140"
                stroke={mode === 'work' ? '#3b82f6' : '#10b981'}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 140}
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-7xl font-bold text-white mb-2">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xl text-white/60">
                  {mode === 'work' ? '集中しましょう' : 'リラックス'}
                </div>
              </div>
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={toggleTimer}
              className={`px-12 py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg ${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              }`}
            >
              {isActive ? '一時停止' : 'スタート'}
            </button>
            <button
              onClick={resetTimer}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
            >
              リセット
            </button>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{completedSessions}</div>
              <div className="text-sm text-white/60">完了セッション</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {Math.floor(completedSessions * 25 / 60)}
              </div>
              <div className="text-sm text-white/60">作業時間 (時間)</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">{Math.round(progress)}%</div>
              <div className="text-sm text-white/60">進捗</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
