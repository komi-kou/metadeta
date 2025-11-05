# 広告運用自動レポートツール

Claude API、Marble.ai、Chatworkを連携して、週次で広告運用レポートを自動配信するツールです。

## 🚀 機能

- **複数プラットフォーム対応**: Meta Ads、Google Ads、Google Analyticsのデータを統合
- **AI分析**: Claude AIによる高度なデータ分析と洞察
- **自動配信**: 指定した曜日・時刻にChatworkへ自動送信
- **日本語対応**: 完全日本語でのレポート生成

## 📋 前提条件

- Python 3.8以上
- 以下のAPIキーとアカウント:
  - Anthropic (Claude) API キー
  - Chatwork API トークン
  - Marble.ai アカウント（オプション）

## 🔧 セットアップ

### 1. リポジトリのクローン

```bash
git clone <your-repo-url>
cd metadeta
```

### 2. 仮想環境の作成（推奨）

```bash
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 4. 環境変数の設定

`.env.example` ファイルをコピーして `.env` ファイルを作成します：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、必要なAPIキーを設定します：

```env
# Claude API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxx

# Chatwork API Configuration
CHATWORK_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CHATWORK_ROOM_ID=123456789

# Scheduling Configuration
REPORT_DAY=monday
REPORT_TIME=09:00
```

### 📝 APIキーの取得方法

#### Claude API キー
1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. "API Keys" セクションで新しいキーを生成

#### Chatwork API トークン
1. Chatworkにログイン
2. 右上のアイコン → [サービス連携] → [API トークン]
3. "新しいトークンを発行" をクリック

#### Chatwork ルームID
1. Chatworkで対象のルームを開く
2. URLの `rid` パラメータの値を確認
   - 例: `https://www.chatwork.com/#!rid123456789` → ルームIDは `123456789`

## 📊 使い方

### テストモード（接続確認）

まず、すべてのAPI接続が正しく設定されているか確認します：

```bash
cd src
python main.py --mode test
```

成功すると以下のような出力が表示されます：
```
✓ Chatwork connection successful
✓ Connected to room: 広告運用チーム
```

### 即座にレポートを生成（テスト実行）

スケジュール設定を待たずに、今すぐレポートを生成してChatworkに送信：

```bash
python main.py --mode run-now
```

### スケジュール実行（本番運用）

設定した曜日・時刻に自動でレポートを生成・送信：

```bash
python main.py --mode schedule
```

このコマンドを実行すると、プログラムはバックグラウンドで動作し続けます。

### バックグラウンド実行（推奨）

実運用では、`nohup` や `screen`、`systemd` などを使用してバックグラウンドで実行することを推奨します：

```bash
# nohupを使用
nohup python main.py --mode schedule > output.log 2>&1 &

# screenを使用
screen -S ad-reports
python main.py --mode schedule
# Ctrl+A, Dでデタッチ
```

## 🏗️ プロジェクト構造

```
metadeta/
├── src/
│   ├── main.py              # メインオーケストレーション
│   ├── config.py            # 設定管理
│   ├── marble_client.py     # Marble.ai データ取得
│   ├── claude_analyzer.py   # Claude AI分析
│   ├── chatwork_notifier.py # Chatwork通知
│   └── scheduler.py         # スケジューラー
├── requirements.txt         # 依存パッケージ
├── .env.example            # 環境変数テンプレート
├── .env                    # 環境変数（要作成、.gitignoreに含む）
└── README.md              # このファイル
```

## 🔄 Marble.ai MCP連携について

このツールは、Marble.ai の Model Context Protocol (MCP) サーバーとの連携を前提に設計されています。

### MCPサーバーのセットアップ

Marble.ai MCPサーバーをセットアップするには、以下のドキュメントを参照してください：

- [Meta Ads MCP Tools](https://www.gomarble.ai/docs/facebook-ads-mcp-tools)
- [Google Ads MCP Tools](https://www.gomarble.ai/docs/google-ads-mcp-tools)
- [Google Analytics MCP Server](https://github.com/gomarble-ai/google-analytics-mcp-server)

### 現在の実装

現在の `marble_client.py` は、MCPサーバーへの接続インターフェースを提供していますが、実際のデータ取得にはMCPサーバーのセットアップが必要です。

## ⚙️ カスタマイズ

### レポートのカスタマイズ

`src/claude_analyzer.py` の `_get_analysis_prompt()` メソッドを編集することで、レポートの内容をカスタマイズできます。

### スケジュールの変更

`.env` ファイルで以下の設定を変更：

```env
REPORT_DAY=friday        # monday, tuesday, wednesday, thursday, friday, saturday, sunday
REPORT_TIME=17:00        # HH:MM形式
```

### 複数のレポートタイプ

`claude_analyzer.py` には複数の分析タイプが用意されています：

- `weekly_summary`: 週次サマリー（デフォルト）
- `optimization_suggestions`: 最適化提案
- カスタムプロンプト: `generate_custom_report()` メソッドを使用

## 🛡️ セキュリティ

- **APIキーの管理**: 絶対に `.env` ファイルをGitリポジトリにコミットしないでください
- **権限**: Chatwork APIトークンは必要最小限の権限で作成してください
- **ログ**: ログファイルに機密情報が含まれないよう注意してください

## 📝 ログ

実行ログは `ad_integration.log` ファイルに保存されます。

```bash
# ログの確認
tail -f ad_integration.log
```

## 🔍 トラブルシューティング

### エラー: "Configuration error"

`.env` ファイルが正しく設定されているか確認してください。必須項目：
- `ANTHROPIC_API_KEY`
- `CHATWORK_API_TOKEN`
- `CHATWORK_ROOM_ID`

### エラー: "Chatwork connection failed"

- APIトークンが有効か確認
- ルームIDが正しいか確認
- ネットワーク接続を確認

### エラー: "Failed to send message"

- ルームに参加しているか確認
- APIトークンに必要な権限があるか確認
- Chatwork APIのレート制限（5分間に300リクエスト）を超えていないか確認

## 🤝 貢献

バグ報告や機能リクエストは、GitHubのIssuesで受け付けています。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🙏 謝辞

- [Anthropic Claude](https://www.anthropic.com/) - AI分析エンジン
- [GoMarble.ai](https://www.gomarble.ai/) - 広告プラットフォーム連携
- [Chatwork](https://www.chatwork.com/) - コミュニケーションプラットフォーム

## 📞 サポート

質問や問題がある場合は、以下の方法でお問い合わせください：

1. GitHub Issues
2. プロジェクトのDiscussionsセクション
3. 開発者への直接連絡

---

**注意**: このツールは広告データを扱います。本番環境で使用する前に、十分なテストを行ってください。