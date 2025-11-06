'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: Date;
};

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'プロジェクトのアイデア',
    content: '# プロジェクトのアイデア\n\n次のプロジェクトでは以下の技術スタックを使用する予定：\n\n- Next.js 14\n- TypeScript\n- Tailwind CSS\n- Framer Motion',
    category: 'work',
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: '買い物リスト',
    content: '# 買い物リスト\n\n- 牛乳\n- パン\n- 卵\n- トマト\n- レタス',
    category: 'personal',
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    title: '読書メモ',
    content: '# 読書メモ\n\n## Clean Code\n\n良いコードを書くための原則：\n\n1. 読みやすさを重視\n2. 単一責任の原則\n3. DRY原則',
    category: 'learning',
    updatedAt: new Date('2024-01-13'),
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(notes[0]?.content || '');
  const [editedTitle, setEditedTitle] = useState(notes[0]?.title || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '全て', icon: '📚' },
    { id: 'work', label: '仕事', icon: '💼' },
    { id: 'personal', label: '個人', icon: '👤' },
    { id: 'learning', label: '学習', icon: '📖' },
  ];

  const filteredNotes =
    selectedCategory === 'all'
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditedContent(note.content);
    setEditedTitle(note.title);
    setEditMode(false);
  };

  const handleSave = () => {
    if (selectedNote) {
      setNotes(
        notes.map((note) =>
          note.id === selectedNote.id
            ? { ...note, title: editedTitle, content: editedContent, updatedAt: new Date() }
            : note
        )
      );
      setSelectedNote({ ...selectedNote, title: editedTitle, content: editedContent });
      setEditMode(false);
    }
  };

  const handleNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '新しいノート',
      content: '# 新しいノート\n\nここに内容を書いてください...',
      category: selectedCategory === 'all' ? 'work' : selectedCategory,
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditedTitle(newNote.title);
    setEditedContent(newNote.content);
    setEditMode(true);
  };

  const handleDelete = () => {
    if (selectedNote) {
      const newNotes = notes.filter((note) => note.id !== selectedNote.id);
      setNotes(newNotes);
      setSelectedNote(newNotes[0] || null);
      setEditedContent(newNotes[0]?.content || '');
      setEditedTitle(newNotes[0]?.title || '');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 flex">
      {/* サイドバー - カテゴリとノート一覧 */}
      <div className="w-80 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">📝 ノート</h1>
            <Link
              href="/"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
            >
              ← ホーム
            </Link>
          </div>
          <button
            onClick={handleNewNote}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
          >
            + 新規ノート
          </button>
        </div>

        {/* カテゴリフィルター */}
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* ノート一覧 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleSelectNote(note)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedNote?.id === note.id
                  ? 'bg-white/20 border border-white/30'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <h3 className="text-white font-semibold mb-1 truncate">{note.title}</h3>
              <p className="text-white/60 text-sm truncate">
                {note.content.split('\n')[0].replace(/^#\s*/, '')}
              </p>
              <p className="text-white/40 text-xs mt-2">
                {note.updatedAt.toLocaleDateString('ja-JP')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* メインエディタエリア */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* ツールバー */}
            <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-md flex justify-between items-center">
              <div className="flex-1">
                {editMode ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold bg-transparent text-white border-b border-white/30 focus:border-white/60 outline-none w-full"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{selectedNote.title}</h2>
                )}
                <p className="text-white/60 text-sm mt-1">
                  最終更新: {selectedNote.updatedAt.toLocaleString('ja-JP')}
                </p>
              </div>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setEditedContent(selectedNote.content);
                        setEditedTitle(selectedNote.title);
                      }}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
                    >
                      編集
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
                    >
                      削除
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="flex-1 overflow-y-auto p-8">
              {editMode ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full bg-white/5 backdrop-blur-sm text-white p-6 rounded-xl border border-white/10 focus:border-white/30 outline-none resize-none font-mono"
                  placeholder="ここに内容を書いてください..."
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert max-w-none"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                    <pre className="whitespace-pre-wrap text-white font-mono">
                      {selectedNote.content}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/40">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl">ノートを選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
