import Link from 'next/link';

const demos = [
  {
    id: 'tasks',
    title: 'タスク管理',
    description: 'カンバン風のタスク管理UI。ドラッグ&ドロップでタスクを移動できます。',
    gradient: 'from-purple-500 to-pink-500',
    icon: '✓',
  },
  {
    id: 'pomodoro',
    title: 'ポモドーロタイマー',
    description: 'ミニマルデザインの集中タイマー。25分作業、5分休憩のサイクル。',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '⏱',
  },
  {
    id: 'dashboard',
    title: 'ダッシュボード',
    description: 'カード型ウィジェットを使った美しいダッシュボードUI。',
    gradient: 'from-green-500 to-teal-500',
    icon: '📊',
  },
  {
    id: 'notes',
    title: 'ノートアプリ',
    description: 'マークダウン対応のシンプルなノートエディター。',
    gradient: 'from-orange-500 to-red-500',
    icon: '📝',
  },
  {
    id: 'analytics',
    title: '統計表示',
    description: 'チャートとグラフを使ったアナリティクスUI。',
    gradient: 'from-indigo-500 to-purple-500',
    icon: '📈',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-6xl font-bold text-white mb-4">
            UI Design Showcase
          </h1>
          <p className="text-xl text-gray-300">
            5種類のモダンなUIデザインをご覧ください
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {demos.map((demo) => (
            <div key={demo.id} className="animate-fadeIn">
              <Link href={`/${demo.id}`}>
                <div className="group relative overflow-hidden rounded-2xl bg-gray-800 p-8 hover:scale-105 transition-transform duration-300 cursor-pointer h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${demo.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div className="text-6xl mb-4">{demo.icon}</div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                      {demo.title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                      {demo.description}
                    </p>

                    <div className={`mt-6 inline-flex items-center text-transparent bg-clip-text bg-gradient-to-r ${demo.gradient} font-semibold group-hover:gap-2 transition-all`}>
                      デモを見る
                      <span className="ml-2 group-hover:ml-3 transition-all">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 animate-fadeIn">
          <p className="text-gray-400">
            全てクライアントサイドで動作 • Vercel/Render対応 • Next.js 14 + TypeScript + Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}
