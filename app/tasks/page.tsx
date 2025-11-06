'use client';

import { useState } from 'react';
import Link from 'next/link';

type Task = {
  id: string;
  title: string;
  description: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const initialData: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: '1', title: 'デザインレビュー', description: 'UIコンポーネントの確認' },
      { id: '2', title: 'API設計', description: 'RESTful API仕様書作成' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: '3', title: 'フロントエンド実装', description: 'React コンポーネント開発' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: '4', title: '要件定義', description: 'プロジェクト要件のドキュメント化' },
      { id: '5', title: 'データベース設計', description: 'テーブル設計とER図作成' },
    ],
  },
];

export default function TasksPage() {
  const [columns, setColumns] = useState<Column[]>(initialData);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('todo');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '新しいタスク',
    };

    setColumns(
      columns.map((col) =>
        col.id === selectedColumn
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );
    setNewTaskTitle('');
  };

  const moveTask = (taskId: string, fromColumn: string, toColumn: string) => {
    const fromCol = columns.find((col) => col.id === fromColumn);
    const task = fromCol?.tasks.find((t) => t.id === taskId);

    if (!task) return;

    setColumns(
      columns.map((col) => {
        if (col.id === fromColumn) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        if (col.id === toColumn) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      })
    );
  };

  const deleteTask = (taskId: string, columnId: string) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      )
    );
  };

  const columnColors: { [key: string]: string } = {
    todo: 'from-blue-500 to-blue-600',
    'in-progress': 'from-yellow-500 to-orange-500',
    done: 'from-green-500 to-green-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white animate-fadeIn">
            📋 タスク管理ボード
          </h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* タスク追加フォーム */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 animate-fadeIn">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={addTask}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              追加
            </button>
          </div>
        </div>

        {/* カンバンボード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-white/5 backdrop-blur-md rounded-xl p-6 animate-fadeIn"
            >
              <div
                className={`bg-gradient-to-r ${columnColors[column.id]} rounded-lg p-4 mb-4`}
              >
                <h2 className="text-xl font-bold text-white flex items-center justify-between">
                  {column.title}
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {column.tasks.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer group animate-fadeIn"
                  >
                    <h3 className="font-semibold text-white mb-2">{task.title}</h3>
                    <p className="text-sm text-gray-300 mb-3">{task.description}</p>

                    <div className="flex gap-2">
                      {columns
                        .filter((col) => col.id !== column.id)
                        .map((targetCol) => (
                          <button
                            key={targetCol.id}
                            onClick={() => moveTask(task.id, column.id, targetCol.id)}
                            className="text-xs px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded transition-colors"
                          >
                            → {targetCol.title}
                          </button>
                        ))}
                      <button
                        onClick={() => deleteTask(task.id, column.id)}
                        className="text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded transition-colors ml-auto"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
