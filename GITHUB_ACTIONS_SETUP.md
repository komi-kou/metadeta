# 🤖 GitHub Actions 週次自動レポート設定ガイド

このガイドでは、GitHub Actionsを使って**毎週月曜日の朝9時に自動的にChatworkへレポートを送信**する方法を説明します。

## 📋 必要なもの

1. ✅ GitHubアカウント
2. ✅ Meta Ads API アクセストークン
3. ✅ 広告アカウントID
4. ✅ Claude API キー
5. ✅ Chatwork APIトークン
6. ✅ Chatwork ルームID

---

## ステップ 1: GitHubリポジトリにコードをプッシュ

すでに完了している場合はスキップしてください。

```bash
cd ~/Desktop/metadeta
git add .
git commit -m "Add GitHub Actions weekly report automation"
git push origin main
```

---

## ステップ 2: GitHub Secretsを設定

### 2-1. GitHubリポジトリを開く

ブラウザで以下を開いてください：
```
https://github.com/komi-kou/metadeta
```

### 2-2. Settings → Secrets and variables → Actions

1. リポジトリページの上部メニューで **「Settings」** をクリック
2. 左サイドバーで **「Secrets and variables」** → **「Actions」** をクリック
3. **「New repository secret」** ボタンをクリック

### 2-3. 以下の5つのSecretを追加

各Secretを以下の形式で追加してください：

#### Secret 1: `META_API_KEY`
- **Name**: `META_API_KEY`
- **Value**: あなたのMeta User Access Token（例: `EAAxxxxxxxx...`）
- 「Add secret」をクリック

#### Secret 2: `META_AD_ACCOUNT_ID`
- **Name**: `META_AD_ACCOUNT_ID`
- **Value**: 広告アカウントID（例: `123456789`）
  - ⚠️ **注意**: `act_` は含めず、数字のみを入力してください
- 「Add secret」をクリック

#### Secret 3: `CLAUDE_API_KEY`
- **Name**: `CLAUDE_API_KEY`
- **Value**: Claude APIキー（例: `sk-ant-xxxxx...`）
- 「Add secret」をクリック

#### Secret 4: `CHATWORK_API_TOKEN`
- **Name**: `CHATWORK_API_TOKEN`
- **Value**: Chatwork APIトークン
- 「Add secret」をクリック

#### Secret 5: `CHATWORK_ROOM_ID`
- **Name**: `CHATWORK_ROOM_ID`
- **Value**: 送信先のChatworkルームID（例: `123456789`）
- 「Add secret」をクリック

### 2-4. 確認

5つのSecretが追加されていることを確認してください：
- ✅ META_API_KEY
- ✅ META_AD_ACCOUNT_ID
- ✅ CLAUDE_API_KEY
- ✅ CHATWORK_API_TOKEN
- ✅ CHATWORK_ROOM_ID

---

## ステップ 3: GitHub Actionsワークフローを有効化

### 3-1. Actionsタブに移動

1. リポジトリページの上部メニューで **「Actions」** をクリック
2. 「I understand my workflows, go ahead and enable them」をクリック（初回のみ）

### 3-2. ワークフローが表示されることを確認

左サイドバーに **「Weekly Ad Performance Report」** が表示されていればOKです。

---

## ステップ 4: テスト実行（手動実行）

自動実行を待つ前に、まず手動でテストしましょう。

### 4-1. ワークフローを手動実行

1. **「Actions」** タブ → **「Weekly Ad Performance Report」** をクリック
2. 右側の **「Run workflow」** ボタンをクリック
3. ブランチ（通常は `main`）を選択
4. **「Run workflow」** をクリック

### 4-2. 実行状況を確認

1. 黄色い丸（🟡）が表示され、処理が開始されます
2. 2-3分待ちます
3. 緑色のチェックマーク（✅）が表示されれば成功！
4. 赤色のバツ（❌）が表示されたらエラー

### 4-3. ログを確認

実行中のワークフローをクリックすると、詳細なログが見られます：
- 📊 Meta Adsからのデータ取得
- 🤖 Claude AIによる分析
- 📤 Chatworkへの送信

### 4-4. Chatworkで確認

Chatworkアプリを開いて、設定したルームにレポートが届いているか確認してください！

---

## ステップ 5: 自動実行スケジュールを確認

### 実行タイミング

ワークフローは以下のタイミングで自動実行されます：

**毎週月曜日 午前9時（日本時間）**

- 日本時間（JST）: 月曜日 09:00
- 協定世界時（UTC）: 月曜日 00:00

### スケジュールを変更したい場合

`.github/workflows/weekly-report.yml` の以下の部分を編集してください：

```yaml
schedule:
  - cron: '0 0 * * 1'  # 毎週月曜日 00:00 UTC = 09:00 JST
```

#### 例：毎日午前10時に実行する場合
```yaml
schedule:
  - cron: '0 1 * * *'  # 毎日 01:00 UTC = 10:00 JST
```

#### 例：毎週金曜日の午後6時に実行する場合
```yaml
schedule:
  - cron: '0 9 * * 5'  # 毎週金曜日 09:00 UTC = 18:00 JST
```

---

## ステップ 6: 実行履歴を確認

### 過去の実行を確認する方法

1. **「Actions」** タブを開く
2. **「Weekly Ad Performance Report」** をクリック
3. 過去の実行履歴が一覧表示されます

### 成功/失敗の確認

- ✅ 緑色のチェックマーク: 成功
- ❌ 赤色のバツ: 失敗
- 🟡 黄色の丸: 実行中

### エラーが発生した場合

1. 失敗した実行をクリック
2. ログを確認してエラーメッセージを見る
3. よくあるエラー：
   - **API token expired**: トークンを更新してSecretsを再設定
   - **Rate limit exceeded**: APIの利用制限に達した（翌日再試行）
   - **Network error**: 一時的なネットワークエラー（自動で再試行されます）

---

## 📊 レポートの内容

毎週のレポートには以下が含まれます：

1. **主要指標サマリー**
   - 広告費
   - コンバージョン数
   - CPA
   - CVR
   - インプレッション
   - クリック数
   - CTR

2. **トップ3キャンペーン**
   - キャンペーン名
   - CPA
   - コンバージョン数
   - 広告費

3. **Claude AIによる分析**
   - 全体評価
   - 強み
   - 改善点
   - 次週のアクションプラン

---

## 🛠️ トラブルシューティング

### Q1: ワークフローが実行されない

**確認事項:**
1. GitHub Actionsが有効になっているか確認
2. Secretsが正しく設定されているか確認
3. `.github/workflows/weekly-report.yml` がリポジトリに存在するか確認

### Q2: Meta API エラーが発生する

**対処法:**
1. Meta User Access Tokenが期限切れになっていないか確認
2. トークンを再生成して、GitHub Secretsを更新
3. 広告アカウントIDが正しいか確認（`act_` なしの数字のみ）

### Q3: Chatworkにメッセージが届かない

**対処法:**
1. Chatwork APIトークンが正しいか確認
2. ルームIDが正しいか確認（数字のみ）
3. ChatworkのAPI制限に達していないか確認

### Q4: Claude API エラーが発生する

**対処法:**
1. Claude APIキーが正しいか確認
2. APIの利用上限に達していないか確認（有料プランの場合）

---

## 💰 コスト

### GitHub Actions（無料枠）
- パブリックリポジトリ: **完全無料**
- プライベートリポジトリ: 月2,000分まで無料
- 週次実行（約3分/回）: **月12分使用 = 完全無料！**

### API使用料
- Meta Ads API: 無料
- Claude API: 従量課金（1レポート約¥5-10）
- Chatwork API: 無料

### 合計コスト
**月額: 約¥20-40**（Claude API使用料のみ）

---

## 🎉 完了！

これで、毎週月曜日の朝9時に自動的にChatworkへレポートが送信されます！

手動で送信したい場合は、引き続きWebアプリの「📤 Chatwork送信」ボタンも使えます。

---

## 📞 サポート

問題が発生した場合は、GitHub Issuesでお気軽にお問い合わせください。
