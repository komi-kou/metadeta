# 📊 広告パフォーマンスレポートツール

GoMarble.ai、Claude API、Chatworkを連携させた自動広告レポート生成ツールです。

## ✨ 機能

- 📈 **Meta/Facebook Ads データ自動取得** - GoMarble MCP経由
- 🤖 **AI分析** - Claude APIによる高度なパフォーマンス分析
- 💬 **Chatwork自動送信** - 定期レポートを指定ルームに配信
- 📊 **ビジュアルダッシュボード** - Webブラウザで確認可能
- 🔄 **自動化対応** - cron等でスケジュール実行可能

## 🎯 取得できる指標

### 主要指標
- 広告費 (spend)
- インプレッション (impressions)
- クリック数 (clicks)
- CTR (Click Through Rate)
- CPC (Cost Per Click)
- CPM (Cost Per Mille)
- リーチ (reach)
- フリークエンシー (frequency)
- コンバージョン数 (conversions)
- CPA (Cost Per Acquisition)
- ROAS (Return On Ad Spend)

### レポート内容
1. アカウント全体サマリー
2. キャンペーン別パフォーマンス (Top 5)
3. 広告セット別分析
4. クリエイティブ別詳細分析
5. 日別トレンド (過去7日間)
6. 具体的なアクション提案
7. 総合評価と次週に向けたアドバイス

## 📋 必要な環境

### APIキー
1. **GoMarble APIキー**
   - https://apps.gomarble.ai でアカウント作成
   - プロフィールからAPIキーを生成
   - Meta Adsアカウントを接続

2. **Chatwork APIトークン**
   - https://www.chatwork.com/service/packages/chatwork/subpackages/api/token.php
   - APIトークンを生成
   - 送信先ルームIDを確認（ブラウザのアドレスバーから）

3. **Claude APIキー**
   - https://console.anthropic.com/
   - APIキーを生成

### 環境変数

`.env.local` ファイルを作成：

```bash
# GoMarble API
GOMARBLE_API_KEY=your_gomarble_api_key_here

# Chatwork API
CHATWORK_API_TOKEN=your_chatwork_token_here
CHATWORK_ROOM_ID=your_room_id_here

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. GoMarble MCP Serverのセットアップ

```bash
# GoMarble MCP Serverをインストール
npm install -g @gomarble/facebook-ads-mcp-server

# Meta Adsアカウントを接続
# https://www.gomarble.ai/docs/facebook-ads-mcp-tools を参照
```

### 3. 環境変数の設定

```bash
cp .env.example .env.local
# .env.localを編集してAPIキーを設定
```

## 💻 使用方法

### Webダッシュボードで確認

```bash
# 開発サーバー起動
npm run dev

# ブラウザで開く
# http://localhost:3000/ad-report
```

### コマンドラインでレポート生成

```bash
# 週次レポート生成
npm run generate-report -- --period=weekly --account-id=YOUR_AD_ACCOUNT_ID

# 日次レポート生成
npm run generate-report -- --period=daily --account-id=YOUR_AD_ACCOUNT_ID --send-chatwork

# 月次レポート生成（ファイルに保存）
npm run generate-report -- --period=monthly --account-id=YOUR_AD_ACCOUNT_ID --save-file
```

### パラメータ

- `--period` : レポート期間 (`daily`, `weekly`, `monthly`)
- `--account-id` : Meta広告アカウントID
- `--send-chatwork` : Chatworkに送信する
- `--save-file` : JSONファイルとして保存

## ⏰ 定期実行の設定

### cron（Linux/Mac）

```bash
# crontabを編集
crontab -e

# 毎週月曜日9時に実行
0 9 * * 1 cd /path/to/metadeta && npm run generate-report -- --period=weekly --account-id=123456789 --send-chatwork

# 毎日朝9時に実行
0 9 * * * cd /path/to/metadeta && npm run generate-report -- --period=daily --account-id=123456789 --send-chatwork
```

### GitHub Actions

```yaml
# .github/workflows/weekly-report.yml
name: Weekly Ad Report

on:
  schedule:
    - cron: '0 0 * * 1' # 毎週月曜日0時（UTC）

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run generate-report -- --period=weekly --account-id=${{ secrets.AD_ACCOUNT_ID }} --send-chatwork
        env:
          GOMARBLE_API_KEY: ${{ secrets.GOMARBLE_API_KEY }}
          CHATWORK_API_TOKEN: ${{ secrets.CHATWORK_API_TOKEN }}
          CHATWORK_ROOM_ID: ${{ secrets.CHATWORK_ROOM_ID }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## 📊 データフロー

```
┌─────────────┐
│  Meta Ads   │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  GoMarble   │ ← APIキーで認証
│  MCP Server │
└──────┬──────┘
       │ データ取得
       ↓
┌─────────────┐
│ レポート     │
│ 生成スクリプト│
└──────┬──────┘
       │
       ├→ Claude API ← AI分析
       │
       ↓
┌─────────────┐
│  Chatwork   │ ← 自動送信
└─────────────┘
```

## 🔒 セキュリティ

- APIキーは `.env.local` に保存（`.gitignore`に含める）
- 本番環境では環境変数を使用
- GoMarbleはトークンをローカルに保存（外部送信なし）
- Chatwork API：レート制限 300リクエスト/5分

## 📝 カスタマイズ

### 分析内容のカスタマイズ

`lib/api/claude.ts` の `generateAnalysisPrompt` 関数を編集：

```typescript
function generateAnalysisPrompt(request: AnalysisRequest): string {
  // プロンプトをカスタマイズ
  return `あなたの業界特有の分析観点を追加...`;
}
```

### Chatworkメッセージのカスタマイズ

`lib/api/chatwork.ts` の `formatAdReportForChatwork` 関数を編集

## 🐛 トラブルシューティング

### GoMarble接続エラー
```
Error: Cannot connect to GoMarble MCP Server
```
→ GoMarble MCP Serverが正しくインストールされているか確認
→ Meta Adsアカウントが接続されているか確認

### Chatwork送信エラー
```
Error: Chatwork API Error: 401
```
→ APIトークンが正しいか確認
→ ルームIDが正しいか確認

### Claude API エラー
```
Error: Claude API Error: 401
```
→ ANTHROPIC_API_KEYが設定されているか確認
→ APIキーが有効か確認

## 📚 参考リンク

- [GoMarble Documentation](https://www.gomarble.ai/docs)
- [Chatwork API Documentation](https://download.chatwork.com/ChatWork_API_Documentation.pdf)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Meta Ads API](https://developers.facebook.com/docs/marketing-apis)

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issue、Pull Requestを歓迎します！
