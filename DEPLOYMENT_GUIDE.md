# 🚀 完全デプロイガイド：Vercel + GitHub Actions

このガイドでは、**Vercelでアプリをデプロイ**し、**GitHub Actionsで週次レポートを自動化**する手順を説明します。

---

## 📦 全体の構成

```
┌─────────────────────────────────────────────────────────┐
│                    あなたの環境                          │
│                                                         │
│  デスクトップ/metadeta/  ← プロジェクトファイル         │
│       ↓ git push                                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│                 komi-kou/metadeta                       │
│                                                         │
│  ├── アプリコード (Next.js)                             │
│  └── .github/workflows/ ← GitHub Actions                │
│       ↓ 自動デプロイ        ↓ 週次実行                  │
└─────────────────────────────────────────────────────────┘
         ↓                           ↓
┌──────────────────┐      ┌──────────────────────┐
│     Vercel       │      │  GitHub Actions      │
│  (Webアプリ)     │      │  (週次レポート)      │
│                  │      │                      │
│  - UI/UX         │      │  毎週月曜 9:00       │
│  - API Routes    │      │  ↓                   │
│  - 24/7稼働      │      │  Meta API取得        │
│                  │      │  Claude分析          │
│                  │      │  Chatwork送信        │
└──────────────────┘      └──────────────────────┘
```

---

## パート1: Vercelデプロイ（Webアプリ）

### ステップ 1: GitHubに最新コードをプッシュ

```bash
cd ~/Desktop/metadeta
git checkout main
git merge claude/local-development-011CUqkLqRjzJMJvQJgYDaUP
git push origin main
```

### ステップ 2: Vercelアカウント作成

1. https://vercel.com にアクセス
2. **「Sign Up」** をクリック
3. **「Continue with GitHub」** を選択
4. GitHubアカウントでログイン
5. Vercelに必要な権限を許可

### ステップ 3: プロジェクトをインポート

1. Vercelダッシュボードで **「Add New...」** → **「Project」** をクリック
2. GitHubリポジトリ一覧から **「komi-kou/metadeta」** を選択
3. **「Import」** をクリック

### ステップ 4: プロジェクト設定

**Configure Project** 画面で：

- **Project Name**: `metadeta` （そのままでOK）
- **Framework Preset**: `Next.js` （自動検出されます）
- **Root Directory**: `./` （そのままでOK）
- **Build Command**: `npm run build` （自動設定）
- **Output Directory**: `.next` （自動設定）
- **Install Command**: `npm install` （自動設定）

**Environment Variables（環境変数）**:
- ⚠️ **設定不要です！**
- このアプリはユーザーがUI上で直接API設定を行うため、Vercelの環境変数は不要です

### ステップ 5: デプロイ

1. **「Deploy」** ボタンをクリック
2. 2-3分待ちます
3. **「Congratulations!」** が表示されたら成功！

### ステップ 6: デプロイ完了

デプロイが完了すると、以下のようなURLが発行されます：

```
https://metadeta.vercel.app
```

または

```
https://metadeta-xxx.vercel.app
```

このURLをブックマークしてください！

---

## パート2: GitHub Actions設定（週次自動化）

詳細な手順は **`GITHUB_ACTIONS_SETUP.md`** を参照してください。

### クイックスタート

1. **GitHub Secretsを設定**
   - https://github.com/komi-kou/metadeta/settings/secrets/actions
   - 以下の5つを追加：
     - `META_API_KEY`
     - `META_AD_ACCOUNT_ID`
     - `CLAUDE_API_KEY`
     - `CHATWORK_API_TOKEN`
     - `CHATWORK_ROOM_ID`

2. **GitHub Actionsを有効化**
   - https://github.com/komi-kou/metadeta/actions
   - 「I understand my workflows, go ahead and enable them」をクリック

3. **手動テスト実行**
   - 「Weekly Ad Performance Report」をクリック
   - 「Run workflow」ボタンをクリック
   - 実行が完了したらChatworkで確認

4. **自動実行**
   - 毎週月曜日 午前9時（JST）に自動実行されます

---

## パート3: 初回設定（Vercelアプリ）

### ステップ 1: Vercelアプリにアクセス

```
https://metadeta.vercel.app
```

### ステップ 2: 設定ページで各種API連携

1. **「⚙️ 設定」** ボタンをクリック
2. 各APIの設定を入力：

#### Meta/Facebook Ads API
- Meta User Access Token を入力
- 広告アカウントを選択
- 「接続テスト」で確認
- 「保存」をクリック

#### Claude API
- Claude APIキーを入力
- 「接続テスト」で確認
- 「保存」をクリック

#### Chatwork API
- Chatwork APIトークンを入力
- 送信先ルームIDを入力
- 「接続テスト」で確認
- 「保存」をクリック

### ステップ 3: レポート確認

1. **「📊 レポート」** ボタンをクリック
2. 広告データが表示されることを確認
3. **「🤖 AI分析」** ボタンでAI分析を実行
4. **「📤 Chatwork送信」** ボタンで手動送信テスト

---

## 🎯 運用方法

### 自動運用（GitHub Actions）

**完全自動化モード：**
- 毎週月曜日 午前9時に自動実行
- Meta Adsからデータ取得
- Claude AIで分析
- Chatworkに自動送信
- **何もする必要なし！**

### 手動運用（Vercelアプリ）

**手動確認モード：**
1. Vercelアプリにアクセス
2. リアルタイムでデータを確認
3. 必要に応じてAI分析実行
4. 任意のタイミングでChatwork送信

### ハイブリッド運用（おすすめ）

**自動 + 手動モード：**
- 📅 **毎週月曜**: GitHub Actionsが自動送信
- 📊 **随時**: Vercelアプリで詳細確認
- 🔍 **必要時**: 追加の分析や手動送信

---

## 💰 料金

### Vercel
- **無料プラン**: 個人利用なら十分
- 制限: 100GB帯域/月、無制限デプロイ
- **コスト: ¥0/月**

### GitHub Actions
- **無料枠**: パブリックリポジトリは無料
- プライベート: 2,000分/月無料
- 週次実行（3分/回）: 月12分使用
- **コスト: ¥0/月**

### API使用料
- Meta Ads API: 無料
- Claude API: 従量課金（約¥5-10/レポート）
- Chatwork API: 無料

### 合計
- **月額: 約¥20-40** （Claude API使用料のみ）
- 週次レポート4回 × ¥5-10 = ¥20-40

---

## 🔧 カスタマイズ

### 実行頻度を変更

`.github/workflows/weekly-report.yml` を編集：

```yaml
# 毎日実行
schedule:
  - cron: '0 1 * * *'  # 毎日10:00 JST

# 毎週金曜日
schedule:
  - cron: '0 9 * * 5'  # 金曜18:00 JST

# 月初（1日）
schedule:
  - cron: '0 0 1 * *'  # 毎月1日 09:00 JST
```

### レポート形式を変更

`lib/api/chatwork.ts` の `formatAdReportForChatwork()` を編集

### カスタムドメイン（オプション）

Vercelで独自ドメインを設定可能：
1. Vercelダッシュボード → プロジェクト → Settings → Domains
2. 独自ドメインを追加

---

## 📞 トラブルシューティング

### Vercel デプロイエラー

**ビルドエラーが出た場合:**
```bash
# ローカルでビルドテスト
cd ~/Desktop/metadeta
npm run build
```

エラーが出なければ、Vercelで再デプロイしてください。

### GitHub Actions エラー

**詳細は `GITHUB_ACTIONS_SETUP.md` を参照**

よくあるエラー：
- API token expired → GitHub Secretsを更新
- Rate limit → 翌日再試行
- Network error → 自動リトライ

### データが表示されない

1. 設定ページで接続テストを実行
2. ブラウザのコンソール（F12）でエラー確認
3. Meta Ads トークンの有効期限を確認

---

## 🎉 完了！

これで以下が実現できました：

✅ **Vercelで24/7稼働のWebアプリ**
- いつでもアクセス可能
- リアルタイムデータ表示
- AI分析機能
- 手動Chatwork送信

✅ **GitHub Actionsで完全自動化**
- 毎週月曜日 9時に自動実行
- データ取得 → 分析 → 送信を自動化
- 完全無料（Claude API除く）

✅ **合計コスト: 月額¥20-40のみ**

---

## 📚 関連ドキュメント

- **GitHub Actions詳細**: `GITHUB_ACTIONS_SETUP.md`
- **API連携詳細**: `AD_REPORT_README.md`
- **プロジェクト概要**: `README.md`

---

## 🚀 次のステップ

1. **今すぐVercelにデプロイ**: 上記の手順に従ってください
2. **GitHub Actionsを設定**: `GITHUB_ACTIONS_SETUP.md` を参照
3. **初回テスト**: 手動実行でテストしてください
4. **運用開始**: 来週月曜日から自動送信開始！

---

質問や問題があれば、GitHubのIssuesでお知らせください！
