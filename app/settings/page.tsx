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

export default function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>({
    gomarbleApiKey: '',
    claudeApiKey: '',
    chatworkApiToken: '',
    chatworkRoomId: '',
    selectedAdAccount: '',
    reportFrequency: 'weekly',
  });

  const [adAccounts, setAdAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    gomarble: boolean | null;
    claude: boolean | null;
    chatwork: boolean | null;
  }>({
    gomarble: null,
    claude: null,
    chatwork: null,
  });

  // 初期化：ローカルストレージから設定を読み込み
  useEffect(() => {
    const saved = localStorage.getItem('adReportConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  // 設定を保存
  const handleSave = () => {
    localStorage.setItem('adReportConfig', JSON.stringify(config));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // GoMarble接続テスト & 広告アカウント取得
  const testGoMarbleConnection = async () => {
    if (!config.gomarbleApiKey) {
      alert('Meta User Access Tokenを入力してください');
      return;
    }

    setTestingConnection(true);
    try {
      // 実際のMeta Ads API呼び出し
      const response = await fetch('/api/gomarble/list-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.gomarbleApiKey }),
      });

      if (response.ok) {
        const accounts = await response.json();
        setAdAccounts(accounts);
        setConnectionStatus(prev => ({ ...prev, gomarble: true }));
        alert(`✅ 接続成功！${accounts.length}件の広告アカウントが見つかりました`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setConnectionStatus(prev => ({ ...prev, gomarble: false }));
        alert(`❌ Meta Ads API接続に失敗しました。\n\nエラー: ${errorData.error || '不明なエラー'}\n\nトークンが無効または期限切れの可能性があります。Graph API Explorerで新しいトークンを取得してください。`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, gomarble: false }));
      alert(`❌ エラーが発生しました: ${error}`);
    } finally {
      setTestingConnection(false);
    }
  };

  // Claude接続テスト
  const testClaudeConnection = async () => {
    if (!config.claudeApiKey) {
      alert('Claude APIキーを入力してください');
      return;
    }

    setTestingConnection(true);
    try {
      const response = await fetch('/api/claude/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.claudeApiKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(prev => ({ ...prev, claude: true }));
        alert(`✅ Claude API接続成功！\n\nモデル: ${data.model}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setConnectionStatus(prev => ({ ...prev, claude: false }));
        alert(`❌ Claude API接続に失敗しました。\n\nエラー: ${errorData.error || '不明なエラー'}\n\nAPIキーが無効な可能性があります。https://console.anthropic.com/ で正しいAPIキーを確認してください。`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, claude: false }));
      alert(`❌ エラーが発生しました: ${error}`);
    } finally {
      setTestingConnection(false);
    }
  };

  // Chatwork接続テスト
  const testChatworkConnection = async () => {
    if (!config.chatworkApiToken || !config.chatworkRoomId) {
      alert('Chatwork APIトークンとルームIDを入力してください');
      return;
    }

    setTestingConnection(true);
    try {
      const response = await fetch('/api/chatwork/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken: config.chatworkApiToken,
          roomId: config.chatworkRoomId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus(prev => ({ ...prev, chatwork: true }));
        alert(`✅ Chatwork接続成功！\n\nルーム: ${data.roomName}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setConnectionStatus(prev => ({ ...prev, chatwork: false }));
        alert(`❌ Chatwork API接続に失敗しました。\n\nエラー: ${errorData.error || '不明なエラー'}\n\nAPIトークンまたはルームIDが無効な可能性があります。Chatwork設定画面で正しい情報を確認してください。`);
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, chatwork: false }));
      alert(`❌ エラーが発生しました: ${error}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-extrabold text-white tracking-tight">⚙️ API連携設定</h1>
          <Link
            href="/"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-lg font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/30"
          >
            ← ホーム
          </Link>
        </div>

        <div className="space-y-8">
          {/* Meta Ads設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Meta/Facebook Ads API</h2>
              {connectionStatus.gomarble !== null && (
                <div className={`px-4 py-2 rounded-lg text-base font-bold ${
                  connectionStatus.gomarble ? 'bg-green-500/30 text-green-200 border-2 border-green-400/50' : 'bg-red-500/30 text-red-200 border-2 border-red-400/50'
                }`}>
                  {connectionStatus.gomarble ? '✓ 接続済み' : '✗ 未接続'}
                </div>
              )}
            </div>
            <p className="text-gray-300 text-base mb-6 leading-relaxed">
              Meta/Facebook Ads データ取得用。<a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline font-semibold">Graph API Explorer</a>でUser Access Tokenを取得してください。必要な権限: ads_read
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-white text-base font-semibold mb-3">Meta User Access Token</label>
                <input
                  type="password"
                  value={config.gomarbleApiKey}
                  onChange={(e) => setConfig({...config, gomarbleApiKey: e.target.value})}
                  placeholder="EAAxxxxxxxxxxxxxxxx..."
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
              </div>
              <button
                onClick={testGoMarbleConnection}
                disabled={testingConnection}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {testingConnection ? '接続中...' : '接続テスト & アカウント取得'}
              </button>
            </div>

            {/* 広告アカウント選択 */}
            {adAccounts.length > 0 && (
              <div className="mt-6">
                <label className="block text-white text-base font-semibold mb-3">広告アカウント選択</label>
                <select
                  value={config.selectedAdAccount}
                  onChange={(e) => setConfig({...config, selectedAdAccount: e.target.value})}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                >
                  <option value="" className="bg-slate-800">アカウントを選択...</option>
                  {adAccounts.map((account) => (
                    <option key={account.id} value={account.id} className="bg-slate-800">
                      {account.name} (ID: {account.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Claude API設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Claude API</h2>
              {connectionStatus.claude !== null && (
                <div className={`px-4 py-2 rounded-lg text-base font-bold ${
                  connectionStatus.claude ? 'bg-green-500/30 text-green-200 border-2 border-green-400/50' : 'bg-red-500/30 text-red-200 border-2 border-red-400/50'
                }`}>
                  {connectionStatus.claude ? '✓ 接続済み' : '✗ 未接続'}
                </div>
              )}
            </div>
            <p className="text-gray-300 text-base mb-6 leading-relaxed">
              AI分析用。https://console.anthropic.com/ でAPIキーを取得
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-white text-base font-semibold mb-3">APIキー</label>
                <input
                  type="password"
                  value={config.claudeApiKey}
                  onChange={(e) => setConfig({...config, claudeApiKey: e.target.value})}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                />
              </div>
              <button
                onClick={testClaudeConnection}
                disabled={testingConnection}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-base rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {testingConnection ? '接続中...' : '接続テスト'}
              </button>
            </div>
          </div>

          {/* Chatwork API設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Chatwork API</h2>
              {connectionStatus.chatwork !== null && (
                <div className={`px-4 py-2 rounded-lg text-base font-bold ${
                  connectionStatus.chatwork ? 'bg-green-500/30 text-green-200 border-2 border-green-400/50' : 'bg-red-500/30 text-red-200 border-2 border-red-400/50'
                }`}>
                  {connectionStatus.chatwork ? '✓ 接続済み' : '✗ 未接続'}
                </div>
              )}
            </div>
            <p className="text-gray-300 text-base mb-6 leading-relaxed">
              レポート自動送信用。Chatwork APIトークンを取得
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-white text-base font-semibold mb-3">APIトークン</label>
                <input
                  type="password"
                  value={config.chatworkApiToken}
                  onChange={(e) => setConfig({...config, chatworkApiToken: e.target.value})}
                  placeholder="10e7538af625f74890e0f0bc4747c976"
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-white text-base font-semibold mb-3">送信先ルームID</label>
                <input
                  type="text"
                  value={config.chatworkRoomId}
                  onChange={(e) => setConfig({...config, chatworkRoomId: e.target.value})}
                  placeholder="406484503"
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>
              <button
                onClick={testChatworkConnection}
                disabled={testingConnection}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-base rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {testingConnection ? '接続中...' : '接続テスト'}
              </button>
            </div>
          </div>

          {/* レポート送信設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6">レポート送信設定</h2>
            <div>
              <label className="block text-white text-base font-semibold mb-3">送信頻度</label>
              <select
                value={config.reportFrequency}
                onChange={(e) => setConfig({...config, reportFrequency: e.target.value as any})}
                className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 mb-3"
              >
                <option value="daily" className="bg-slate-800">毎日</option>
                <option value="weekly" className="bg-slate-800">毎週（推奨）</option>
                <option value="monthly" className="bg-slate-800">毎月</option>
              </select>
              <p className="text-gray-300 text-base leading-relaxed">
                {config.reportFrequency === 'daily' && '毎日午前9時に前日のレポートを送信'}
                {config.reportFrequency === 'weekly' && '毎週月曜日午前9時に先週のレポートを送信'}
                {config.reportFrequency === 'monthly' && '毎月1日午前9時に前月のレポートを送信'}
              </p>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-6">
            <button
              onClick={handleSave}
              className="flex-1 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-2xl"
            >
              {isSaved ? '✓ 保存しました！' : '設定を保存'}
            </button>
            <Link
              href="/ad-report"
              className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white text-xl rounded-2xl font-bold transition-all flex items-center border-2 border-white/20 hover:border-white/40"
            >
              レポートを見る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
