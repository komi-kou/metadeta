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
    const analysisPrompt = `あなたは経験豊富なデジタルマーケティングアナリストです。Meta広告の包括的なパフォーマンス分析レポートを作成してください。

**分析期間:** ${insights.date_start} 〜 ${insights.date_stop}
${insights.primaryEventType ? `**主要コンバージョンイベント:** ${insights.primaryEventType}` : ''}
${comparison && comparison.previous ? `**比較期間:** ${comparison.previous.date_start} 〜 ${comparison.previous.date_stop}` : ''}

以下のステップに従って分析を実行してください：

---

## ステップ 1: パフォーマンスデータの抽出

### アカウント全体メトリクス（現在期間）
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
### 前期比較データ
前期間: ${comparison.previous.date_start} 〜 ${comparison.previous.date_stop}

- 広告費: ¥${comparison.previous.spend.toLocaleString()} → ¥${insights.spend.toLocaleString()} (${comparison.comparison.spend.percentage > 0 ? '+' : ''}${comparison.comparison.spend.percentage.toFixed(1)}%)
- コンバージョン: ${comparison.previous.conversions.toFixed(0)} → ${insights.conversions.toFixed(0)} (${comparison.comparison.conversions.percentage > 0 ? '+' : ''}${comparison.comparison.conversions.percentage.toFixed(1)}%)
- CPA: ¥${comparison.previous.cpa.toLocaleString()} → ¥${insights.cpa.toLocaleString()} (${comparison.comparison.cpa.percentage > 0 ? '+' : ''}${comparison.comparison.cpa.percentage.toFixed(1)}%)
- CTR: ${comparison.previous.ctr.toFixed(2)}% → ${insights.ctr.toFixed(2)}% (${comparison.comparison.ctr.percentage > 0 ? '+' : ''}${comparison.comparison.ctr.percentage.toFixed(1)}%)
- CVR: ${comparison.previous.cvr.toFixed(2)}% → ${insights.cvr.toFixed(2)}% (${comparison.comparison.cvr.percentage > 0 ? '+' : ''}${comparison.comparison.cvr.percentage.toFixed(1)}%)
` : ''}

${campaigns && campaigns.length > 0 ? `
### キャンペーン別パフォーマンス（トップ10）
${campaigns.slice(0, 10).map((c: any, i: number) => `
${i + 1}. ${c.name}
   - ステータス: ${c.status} | 広告費: ¥${c.spend.toLocaleString()} | CV: ${c.conversions.toFixed(0)} | CPA: ¥${c.cpa.toLocaleString()} | CTR: ${c.ctr.toFixed(2)}%
`).join('')}
` : ''}

${dailyTrends && dailyTrends.length > 0 ? `
### 日別トレンド（直近データ）
${dailyTrends.slice(-7).map((d: any) => `
${d.date}: 広告費 ¥${d.spend.toLocaleString()} | CV ${d.conversions.toFixed(0)} | CPA ¥${d.cpa.toLocaleString()} | CVR ${d.cvr.toFixed(2)}%
`).join('')}
` : ''}

${demographics && demographics.byAge && demographics.byAge.length > 0 ? `
### 年齢別パフォーマンス（トップ5）
${demographics.byAge.slice(0, 5).map((d: any, i: number) => `
${i + 1}. 年齢: ${d.age} | 広告費: ¥${d.spend.toLocaleString()} | CV: ${d.conversions.toFixed(0)} | CPA: ¥${d.cpa.toLocaleString()} | CTR: ${d.ctr.toFixed(2)}%
`).join('')}
` : ''}

${demographics && demographics.byGender && demographics.byGender.length > 0 ? `
### 性別パフォーマンス
${demographics.byGender.map((d: any) => `
性別: ${d.gender} | 広告費: ¥${d.spend.toLocaleString()} | CV: ${d.conversions.toFixed(0)} | CPA: ¥${d.cpa.toLocaleString()} | CTR: ${d.ctr.toFixed(2)}%
`).join('')}
` : ''}

${geography && geography.byCountry && geography.byCountry.length > 0 ? `
### 国別パフォーマンス（トップ5）
${geography.byCountry.slice(0, 5).map((g: any, i: number) => `
${i + 1}. 国: ${g.country} | 広告費: ¥${g.spend.toLocaleString()} | CV: ${g.conversions.toFixed(0)} | CPA: ¥${g.cpa.toLocaleString()}
`).join('')}
` : ''}

${placements && placements.byPublisher && placements.byPublisher.length > 0 ? `
### プレースメント別パフォーマンス
${placements.byPublisher.map((p: any) => `
配信面: ${p.publisher_platform} | 広告費: ¥${p.spend.toLocaleString()} | CV: ${p.conversions.toFixed(0)} | CPA: ¥${p.cpa.toLocaleString()} | Freq: ${p.frequency.toFixed(2)}
`).join('')}
` : ''}

${devices && devices.length > 0 ? `
### デバイス別パフォーマンス
${devices.map((d: any) => `
デバイス: ${d.device_platform} | 広告費: ¥${d.spend.toLocaleString()} | CV: ${d.conversions.toFixed(0)} | CPA: ¥${d.cpa.toLocaleString()} | CTR: ${d.ctr.toFixed(2)}%
`).join('')}
` : ''}

---

## ステップ 2: 効率性指標の計算

以下の効率性指標を分析に使用してください：
- セグメント別のコンバージョン単価（CPA）
- デモグラフィック別のコンバージョン率（CVR）
- フリークエンシーとリーチの効率性
- プレースメント別の費用対効果
- デバイス別のパフォーマンス比較

---

## ステップ 3: インサイトセクションの作成

以下のセクションを作成してください：

### 1. パフォーマンス概要（現状把握）
- どのセグメントが最良の結果を出しているか
- 前期と比較してどう変化したか
- 広告費の使われ方は効率的か

### 2. 最も成果を出している要素
- **ベストパフォーマンスのセグメント:**
  - 年齢/性別の組み合わせで最も効率的なもの
  - 最も成果の高い配信面（Feed、Stories等）
  - 最も効率的なデバイス
  - 最もCPAが低いキャンペーン

### 3. 改善が必要な領域
- **パフォーマンスが低いセグメント:**
  - CPAが高すぎる年齢層や性別
  - 非効率な配信面
  - コンバージョンが少ないデバイス
  - 広告費を浪費しているキャンペーン

### 4. オーディエンス分析
- どの層に最も効果的にリーチできているか
- 未開拓で可能性のある高パフォーマンスセグメントの特定
- オーディエンス飽和の兆候（高フリークエンシー、パフォーマンス低下）

---

## ステップ 4: 具体的なインサイトのハイライト

以下を強調してください：
- 成果の高いオーディエンスセグメントで活用不足のもの
- どのクリエイティブタイプがどのオーディエンスセグメントに響くか
- オーディエンス飽和の問題がある箇所（高フリークエンシー、パフォーマンス低下）
- 前期比較で大きく改善または悪化している指標

---

## 出力形式

**重要:** すべてのデータを、専門用語を最小限に抑え、**ビジネスへの影響**に焦点を当てて提示してください。広告指標ではなく、ビジネスの成果を重視してください。

以下の形式で視覚的なダッシュボードを作成してください：

### 📊 1. パフォーマンス概要

#### 🎯 総合評価
- **スコア:** ⭐⭐⭐⭐☆ (X/5点)
- **評価根拠:** [データに基づく具体的な理由]

#### 📈 主要指標の状況
| 指標 | 現在値 | 前期比 | 状態 | 評価 |
|------|--------|--------|------|------|
| コンバージョン単価（CPA） | ¥XXX | ${comparison ? '↑/↓ X%' : '-'} | 🟢/🟡/🔴 | [良い/改善必要/要注意の理由] |
| コンバージョン率（CVR） | X.XX% | ${comparison ? '↑/↓ X%' : '-'} | 🟢/🟡/🔴 | [理由] |
| クリック率（CTR） | X.XX% | ${comparison ? '↑/↓ X%' : '-'} | 🟢/🟡/🔴 | [理由] |
| 広告疲弊度（Frequency） | X.XX | ${comparison ? '↑/↓ X%' : '-'} | 🟢/🟡/🔴 | [理由] |

**凡例:** 🟢 = 良好 | 🟡 = 要改善 | 🔴 = 緊急対応必要

---

### 🏆 2. 最も成果を出している要素

#### ベストパフォーマンスのセグメント
- **👥 オーディエンス:** [年齢層] × [性別] - CPA ¥XXX、CV XX件
  - なぜ効果的か: [理由]
  - 活用方法: [具体的な推奨]

- **📱 配信面:** [Facebook Feed/Instagram Stories等] - 広告費 ¥XXX、CV XX件
  - なぜ効果的か: [理由]
  - 活用方法: [具体的な推奨]

- **💻 デバイス:** [Mobile/Desktop] - CPA ¥XXX（最安）
  - なぜ効果的か: [理由]

#### 成功パターンの特定
1. [共通要素1]
2. [共通要素2]
3. [横展開できる戦略]

---

### ⚠️ 3. 改善が必要な領域（優先度順）

#### 🔴 最優先で対応すべき課題
**課題:** [具体的な問題]
- **ビジネスへの影響:** 広告費の XX% (¥XXX) に影響
- **現状:** [数値で示す]
- **推奨アクション:** [具体的な改善策]

#### 🟡 重要な改善ポイント
**課題:** [2番目の問題]
- **ビジネスへの影響:** [定量的に]
- **現状:** [数値で示す]
- **推奨アクション:** [具体的な改善策]

#### 🟢 長期的な最適化
**課題:** [3番目の問題]
- **ビジネスへの影響:** [定量的に]
- **推奨アクション:** [具体的な改善策]

---

### 👥 4. オーディエンス分析

#### 最も価値のあるセグメント
- 🏆 **[年齢層] × [性別]:** CPA ¥XXX、CV XX件
  - **推奨:** 予算を XX% 増やす

- 🟡 **[年齢層] × [性別]:** CPA ¥XXX、CVR低い
  - **推奨:** クリエイティブを変更してテスト

- 🔴 **[年齢層] × [性別]:** CPA ¥XXX（非効率）
  - **推奨:** 予算を削減または停止

#### 未開拓の機会
- [パフォーマンスは良いが予算配分が少ないセグメント]

#### 飽和の兆候
${placements && placements.byPublisher ? `
- [高フリークエンシーで疲弊している配信面やセグメント]
` : ''}

---

### 📋 5. 次のステップ（実行可能なアクション）

#### すぐに実行すべきアクション
1. **[具体的なアクション]**
   - 所要時間: XX分
   - 期待される成果: [CPA -XX% または CV +XX件]
   - 手順: [ステップバイステップ]

2. **[具体的なアクション]**
   - 所要時間: XX分
   - 期待される成果: [定量的な目標]
   - 手順: [ステップバイステップ]

#### 今週中に実行すべきアクション
3. **[具体的なアクション]**
   - 所要時間: X時間
   - 期待される成果: [定量的な目標]

---

### 📌 重要な注意事項

- **視覚的な表現:** 🟢🟡🔴の絵文字を使って状態を一目で判断できるようにする
- **ビジネス言語:** 技術的な専門用語ではなく、ビジネスへの影響で説明する
- **具体的な数値:** 「改善する」ではなく「CPA を ¥XXX から ¥YYY に下げる」のように具体的に
- **実行可能性:** すべての推奨事項に具体的な手順を含める
- **ROASは使用しない:** CPA、CVR、CTRなどの指標に焦点を当てる

上記の形式に従って、明確なセクション区切りを持つ視覚的なダッシュボードとして分析レポートを作成してください。
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
