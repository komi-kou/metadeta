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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">⚙️ API連携設定</h1>
          <Link
            href="/"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            ← ホーム
          </Link>
        </div>

        <div className="space-y-6">
          {/* Meta Ads設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Meta/Facebook Ads API</h2>
              {connectionStatus.gomarble !== null && (
                <div className={`px-3 py-1 rounded text-sm font-semibold ${
                  connectionStatus.gomarble ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {connectionStatus.gomarble ? '✓ 接続済み' : '✗ 未接続'}
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Meta/Facebook Ads データ取得用。<a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Graph API Explorer</a>でUser Access Tokenを取得してください。必要な権限: ads_read
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">Meta User Access Token</label>
                <input
                  type="password"
                  value={config.gomarbleApiKey}
                  onChange={(e) => setConfig({...config, gomarbleApiKey: e.target.value})}
                  placeholder="EAAxxxxxxxxxxxxxxxx..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={testGoMarbleConnection}
                disabled={testingConnection}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {testingConnection ? '接続中...' : '接続テスト & アカウント取得'}
              </button>
            </div>

            {/* 広告アカウント選択 */}
            {adAccounts.length > 0 && (
              <div className="mt-4">
                <label className="block text-white text-sm mb-2">広告アカウント選択</label>
                <select
                  value={config.selectedAdAccount}
                  onChange={(e) => setConfig({...config, selectedAdAccount: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">アカウントを選択...</option>
                  {adAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (ID: {account.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Claude API設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Claude API</h2>
              {connectionStatus.claude !== null && (
                <div className={`px-3 py-1 rounded text-sm font-semibold ${
                  connectionStatus.claude ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {connectionStatus.claude ? '✓ 接続済み' : '✗ 未接続'}
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              AI分析用。https://console.anthropic.com/ でAPIキーを取得
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">APIキー</label>
                <input
                  type="password"
                  value={config.claudeApiKey}
                  onChange={(e) => setConfig({...config, claudeApiKey: e.target.value})}
                  placeholder="sk-ant-api03-..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={testClaudeConnection}
                disabled={testingConnection}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {testingConnection ? '接続中...' : '接続テスト'}
              </button>
            </div>
          </div>

          {/* Chatwork API設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Chatwork API</h2>
              {connectionStatus.chatwork !== null && (
                <div className={`px-3 py-1 rounded text-sm font-semibold ${
                  connectionStatus.chatwork ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {connectionStatus.chatwork ? '✓ 接続済み' : '✗ 未接続'}
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-4">
              レポート自動送信用。Chatwork APIトークンを取得
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2">APIトークン</label>
                <input
                  type="password"
                  value={config.chatworkApiToken}
                  onChange={(e) => setConfig({...config, chatworkApiToken: e.target.value})}
                  placeholder="10e7538af625f74890e0f0bc4747c976"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">送信先ルームID</label>
                <input
                  type="text"
                  value={config.chatworkRoomId}
                  onChange={(e) => setConfig({...config, chatworkRoomId: e.target.value})}
                  placeholder="406484503"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={testChatworkConnection}
                disabled={testingConnection}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {testingConnection ? '接続中...' : '接続テスト'}
              </button>
            </div>
          </div>

          {/* レポート送信設定 */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">レポート送信設定</h2>
            <div>
              <label className="block text-white text-sm mb-2">送信頻度</label>
              <select
                value={config.reportFrequency}
                onChange={(e) => setConfig({...config, reportFrequency: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">毎日</option>
                <option value="weekly">毎週（推奨）</option>
                <option value="monthly">毎月</option>
              </select>
              <p className="text-gray-400 text-sm mt-2">
                {config.reportFrequency === 'daily' && '毎日午前9時に前日のレポートを送信'}
                {config.reportFrequency === 'weekly' && '毎週月曜日午前9時に先週のレポートを送信'}
                {config.reportFrequency === 'monthly' && '毎月1日午前9時に前月のレポートを送信'}
              </p>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-bold text-lg transition-all"
            >
              {isSaved ? '✓ 保存しました！' : '設定を保存'}
            </button>
            <Link
              href="/ad-report"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all flex items-center"
            >
              レポートを見る →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
