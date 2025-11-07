import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, insights, comparison, campaigns, adsets, ads, dailyTrends, demographics, geography, placements, devices } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude APIキーが必要です' },
        { status: 400 }
      );
    }

    if (!insights) {
      return NextResponse.json(
        { error: '分析するデータが必要です' },
        { status: 400 }
      );
    }

    // 分析プロンプトを構築
    const analysisPrompt = `
あなたは経験豊富なデジタルマーケティングアナリストです。以下のMeta広告データを分析して、詳細なレポートを作成してください。

# 📊 Meta広告パフォーマンス詳細分析レポート

## データ期間
${insights.date_start} 〜 ${insights.date_stop}
${insights.primaryEventType ? `\n主要コンバージョンイベント: ${insights.primaryEventType}` : ''}

---

# 入力データ

## アカウント全体データ（現在期間）
- 広告費: ¥${insights.spend.toLocaleString()}
- インプレッション: ${insights.impressions.toLocaleString()}
- クリック数: ${insights.clicks.toLocaleString()}
- CTR: ${insights.ctr.toFixed(2)}%
- CPC: ¥${insights.cpc.toFixed(0)}
- CPM: ¥${insights.cpm.toFixed(0)}
- リーチ: ${insights.reach.toLocaleString()}
- フリークエンシー: ${insights.frequency.toFixed(2)}
- コンバージョン数: ${insights.conversions.toFixed(0)}
- CPA: ¥${insights.cpa.toLocaleString()}
- CVR: ${insights.cvr.toFixed(2)}%

${comparison && comparison.previous ? `
## 前期比較データ
前期間: ${comparison.previous.date_start} 〜 ${comparison.previous.date_stop}

- 広告費: ¥${comparison.previous.spend.toLocaleString()} → ¥${insights.spend.toLocaleString()} (${comparison.comparison.spend.percentage > 0 ? '+' : ''}${comparison.comparison.spend.percentage.toFixed(1)}%)
- コンバージョン: ${comparison.previous.conversions.toFixed(0)} → ${insights.conversions.toFixed(0)} (${comparison.comparison.conversions.percentage > 0 ? '+' : ''}${comparison.comparison.conversions.percentage.toFixed(1)}%)
- CPA: ¥${comparison.previous.cpa.toLocaleString()} → ¥${insights.cpa.toLocaleString()} (${comparison.comparison.cpa.percentage > 0 ? '+' : ''}${comparison.comparison.cpa.percentage.toFixed(1)}%)
- CTR: ${comparison.previous.ctr.toFixed(2)}% → ${insights.ctr.toFixed(2)}% (${comparison.comparison.ctr.percentage > 0 ? '+' : ''}${comparison.comparison.ctr.percentage.toFixed(1)}%)
- CVR: ${comparison.previous.cvr.toFixed(2)}% → ${insights.cvr.toFixed(2)}% (${comparison.comparison.cvr.percentage > 0 ? '+' : ''}${comparison.comparison.cvr.percentage.toFixed(1)}%)
` : ''}

${campaigns && campaigns.length > 0 ? `
## キャンペーンデータ（トップ10）
${campaigns.slice(0, 10).map((c: any, i: number) => `
${i + 1}. ${c.name}
   - ステータス: ${c.status} | 広告費: ¥${c.spend.toLocaleString()} | CV: ${c.conversions.toFixed(0)} | CPA: ¥${c.cpa.toLocaleString()} | CTR: ${c.ctr.toFixed(2)}%
`).join('')}
` : ''}

${adsets && adsets.length > 0 ? `
## 広告セットデータ（トップ5）
${adsets.slice(0, 5).map((a: any, i: number) => `
${i + 1}. ${a.name}
   - キャンペーン: ${a.campaign_name}
   - 最適化目標: ${a.optimization_goal}
   - 広告費: ¥${a.spend.toLocaleString()} | CV: ${a.conversions.toFixed(0)} | CPA: ¥${a.cpa.toLocaleString()}
`).join('')}
` : ''}

${ads && ads.length > 0 ? `
## 広告クリエイティブデータ（トップ5）
${ads.slice(0, 5).map((ad: any, i: number) => `
${i + 1}. ${ad.name}
   - 広告セット: ${ad.adset_name}
   - 広告費: ¥${ad.spend.toLocaleString()} | CV: ${ad.conversions.toFixed(0)} | CTR: ${ad.ctr.toFixed(2)}% | Freq: ${ad.frequency.toFixed(2)}
`).join('')}
` : ''}

${dailyTrends && dailyTrends.length > 0 ? `
## 日別トレンドデータ（過去7日間）
${dailyTrends.map((d: any) => `
${d.date}: 広告費 ¥${d.spend.toLocaleString()} | CV ${d.conversions.toFixed(0)} | CPA ¥${d.cpa.toLocaleString()} | CVR ${d.cvr.toFixed(2)}%
`).join('')}
` : ''}

${demographics && demographics.byAge && demographics.byAge.length > 0 ? `
## 年齢別パフォーマンス（トップ5）
${demographics.byAge.slice(0, 5).map((d: any, i: number) => `
${i + 1}. 年齢: ${d.age} | 広告費: ¥${d.spend.toLocaleString()} | CV: ${d.conversions.toFixed(0)} | CPA: ¥${d.cpa.toLocaleString()} | CTR: ${d.ctr.toFixed(2)}%
`).join('')}
` : ''}

${demographics && demographics.byGender && demographics.byGender.length > 0 ? `
## 性別パフォーマンス
${demographics.byGender.map((d: any) => `
性別: ${d.gender} | 広告費: ¥${d.spend.toLocaleString()} | CV: ${d.conversions.toFixed(0)} | CPA: ¥${d.cpa.toLocaleString()} | CTR: ${d.ctr.toFixed(2)}%
`).join('')}
` : ''}

${geography && geography.byCountry && geography.byCountry.length > 0 ? `
## 国別パフォーマンス（トップ5）
${geography.byCountry.slice(0, 5).map((g: any, i: number) => `
${i + 1}. 国: ${g.country} | 広告費: ¥${g.spend.toLocaleString()} | CV: ${g.conversions.toFixed(0)} | CPA: ¥${g.cpa.toLocaleString()}
`).join('')}
` : ''}

${placements && placements.byPublisher && placements.byPublisher.length > 0 ? `
## プレースメント別パフォーマンス
${placements.byPublisher.map((p: any) => `
配信面: ${p.publisher_platform} | 広告費: ¥${p.spend.toLocaleString()} | CV: ${p.conversions.toFixed(0)} | CPA: ¥${p.cpa.toLocaleString()} | Freq: ${p.frequency.toFixed(2)}
`).join('')}
` : ''}

${devices && devices.length > 0 ? `
## デバイス別パフォーマンス
${devices.map((d: any) => `
デバイス: ${d.device_platform} | 広告費: ¥${d.spend.toLocaleString()} | CV: ${d.conversions.toFixed(0)} | CPA: ¥${d.cpa.toLocaleString()} | CTR: ${d.ctr.toFixed(2)}%
`).join('')}
` : ''}

---

# 出力形式

以下の構成で**視覚的でわかりやすい**分析レポートを作成してください：

## 📊 1. 現状スコアカード

まず、一目でわかるスコアカードを作成：

### 🎯 総合評価: [⭐⭐⭐⭐☆ 4/5点]

**現在のステータス:**
- 🟢 良好な指標: [具体的に]
- 🟡 要改善の指標: [具体的に]
- 🔴 緊急対応が必要: [具体的に]

### 📈 主要KPI スコアボード

| 指標 | 現在値 | 前期比 | 状態 | 判定理由 |
|------|--------|--------|------|----------|
| CPA | ¥XXX | ↑/↓ X% | 🟢🟡🔴 | [業界平均と比較して...] |
| CVR | X.XX% | ↑/↓ X% | 🟢🟡🔴 | [目標値と比較して...] |
| CTR | X.XX% | ↑/↓ X% | 🟢🟡🔴 | [健全性の評価...] |
| Frequency | X.XX | ↑/↓ X% | 🟢🟡🔴 | [疲弊度の評価...] |

**凡例:** 🟢=良好 | 🟡=要改善 | 🔴=要注意

---

## 🚨 2. 最優先で対応すべき課題 TOP3

### 🔴 緊急度：高
**課題1:** [最も重要な問題]
- **影響度:** 広告費の XX% に影響
- **現状:** [具体的な数値]
- **原因:** [なぜこうなっているか]
- **対策:** [すぐできること]

### 🟡 緊急度：中
**課題2:** [2番目に重要]
- **影響度:** [定量的に]
- **現状:** [具体的に]
- **原因:** [分析]
- **対策:** [アクション]

### 🟢 緊急度：低
**課題3:** [3番目に重要]
- **影響度:** [定量的に]
- **現状:** [具体的に]
- **原因:** [分析]
- **対策:** [アクション]

---

## 💡 3. 勝ちパターン分析（何が効いているか）

### ✅ 最も効果的な要素

**🏆 ベストパフォーマー:**
- **キャンペーン:** [名前] - CPA ¥XXX (平均より XX% 優秀)
- **年齢層:** [XX-XX歳] - CVR XX% (最高)
- **配信面:** [Facebook/Instagram] - 広告費 ¥XXX で CV XXX
- **デバイス:** [Mobile/Desktop] - CPA ¥XXX (最安)

**🎯 成功要因:**
1. [なぜこれが効いているのか]
2. [どの要素が共通しているか]
3. [横展開できるポイント]

---

## 📱 4. セグメント別パフォーマンス

### 👥 デモグラフィック（誰に届いているか）

**効率的なオーディエンス:**
- 🏆 [年齢層] × [性別]: CPA ¥XXX、CV XXX件 → **ここに予算を集中すべき**
- 🟡 [年齢層] × [性別]: CPA ¥XXX、CVRが低い → **クリエイティブを変更**
- 🔴 [年齢層] × [性別]: CPA ¥XXX、非効率 → **停止を検討**

### 🌍 地域別（どこで結果が出ているか）

**地域パフォーマンス:**
- 🏆 効率的: [国/地域] - CPA ¥XXX
- 🔴 非効率: [国/地域] - CPA ¥XXX (平均の XX倍)

### 📺 配信面別（どこで見られているか）

**プレースメント効率:**
- 🏆 [Facebook Feed]: CPA ¥XXX、Freq X.XX
- 🟡 [Instagram Stories]: CPA ¥XXX、Freq X.XX → **疲弊気味**
- 🔴 [停止推奨]: [配信面] - 非効率

---

## 🎨 5. クリエイティブ健康診断

### 疲弊度チェック

| 広告 | Frequency | 状態 | アクション |
|------|-----------|------|-----------|
| [名前] | X.XX | 🔴 疲弊 | **即座に新クリエイティブ投入** |
| [名前] | X.XX | 🟡 要監視 | 1週間以内に準備 |
| [名前] | X.XX | 🟢 健全 | 現状維持 |

**判定基準:** Freq < 2.0 🟢 | 2.0-3.5 🟡 | > 3.5 🔴

---

## ✅ 6. 今週のアクションプラン（優先順位順）

### 🔴 今日すぐやる（緊急）
1. **[具体的なアクション]**
   - 所要時間: XX分
   - 期待効果: CPA -XX%改善
   - 手順: ①... ②... ③...

### 🟡 今週中にやる（重要）
2. **[具体的なアクション]**
   - 所要時間: XX時間
   - 期待効果: CV +XX%増加
   - 手順: ①... ②... ③...

### 🟢 来週以降（改善）
3. **[具体的なアクション]**
   - 所要時間: XX時間
   - 期待効果: CTR +XX%向上
   - 手順: ①... ②... ③...

---

## 📋 7. 次回チェックリスト

**1週間後に確認すべき項目:**
- [ ] [課題1]の改善状況（目標: CPA ¥XXX以下）
- [ ] [課題2]の改善状況（目標: CV XX件以上）
- [ ] 新クリエイティブのパフォーマンス
- [ ] 予算配分の最適化結果

---

**📝 レポート作成時の重要な注意事項:**

1. **視覚的でわかりやすい表現を徹底する:**
   - 絵文字（🟢🟡🔴）を使って状態を一目で判断できるようにする
   - 表は必要最小限にし、スコアカードやステータス表示を優先する
   - 数値だけでなく、その数値が「何を意味するか」を明確に説明する

2. **現状と課題を明確に:**
   - 今何が起きているのか（現状）
   - 何が問題なのか（課題）
   - どうすればいいのか（対策）
   を必ずセットで説明する

3. **優先順位をつける:**
   - すべてを羅列するのではなく、TOP3の課題に絞る
   - 緊急度と影響度を明確にする
   - すぐにできることから提示する

4. **具体的で実行可能なアクションを:**
   - 「改善する」ではなく「XX を YY に変更する」と具体的に
   - 所要時間や期待効果を明示する
   - 手順をステップバイステップで示す

5. **ROASは分析に含めない:**
   - ROASに関する言及は一切しないこと
   - CPA、CVR、CTRなどの指標に焦点を当てる

上記の形式に従って、データから洞察を導き、実行可能なアドバイスを提供してください
`;

    // Claude APIを呼び出し
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Claude API分析に失敗しました', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Claude APIのレスポンスから分析結果を抽出
    const analysis = data.content?.[0]?.text || '';

    return NextResponse.json({
      success: true,
      analysis: analysis,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('Claude Analysis Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
