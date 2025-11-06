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
- ROAS: ${insights.roas.toFixed(2)}
- CVR: ${insights.cvr.toFixed(2)}%

${comparison && comparison.previous ? `
## 前期比較データ
前期間: ${comparison.previous.date_start} 〜 ${comparison.previous.date_stop}

- 広告費: ¥${comparison.previous.spend.toLocaleString()} → ¥${insights.spend.toLocaleString()} (${comparison.comparison.spend.percentage > 0 ? '+' : ''}${comparison.comparison.spend.percentage.toFixed(1)}%)
- コンバージョン: ${comparison.previous.conversions.toFixed(0)} → ${insights.conversions.toFixed(0)} (${comparison.comparison.conversions.percentage > 0 ? '+' : ''}${comparison.comparison.conversions.percentage.toFixed(1)}%)
- CPA: ¥${comparison.previous.cpa.toLocaleString()} → ¥${insights.cpa.toLocaleString()} (${comparison.comparison.cpa.percentage > 0 ? '+' : ''}${comparison.comparison.cpa.percentage.toFixed(1)}%)
- ROAS: ${comparison.previous.roas.toFixed(2)} → ${insights.roas.toFixed(2)} (${comparison.comparison.roas.percentage > 0 ? '+' : ''}${comparison.comparison.roas.percentage.toFixed(1)}%)
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
${d.date}: 広告費 ¥${d.spend.toLocaleString()} | CV ${d.conversions.toFixed(0)} | CPA ¥${d.cpa.toLocaleString()} | ROAS ${d.roas.toFixed(2)}
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

以下の構成で詳細な分析レポートを作成してください。**必ず表形式を活用**して見やすくしてください：

## 1. 📈 アカウント全体サマリー

### 全体評価
- 総合評価: ⭐⭐⭐⭐⭐ (5段階評価)
- 評価理由: [具体的な理由を記載]

### 主要指標の評価
以下の表形式で評価を提示：

| 指標 | 数値 | 評価 | 改善ポイント |
|------|------|------|--------------|
| ROAS | X.XX | ⚫️良好/🟡要改善/🔴要注意 | ... |
| CPA | ¥XXX | ⚫️良好/🟡要改善/🔴要注意 | ... |
| CTR | X.XX% | ⚫️良好/🟡要改善/🔴要注意 | ... |
| CVR | X.XX% | ⚫️良好/🟡要改善/🔴要注意 | ... |
| フリークエンシー | X.XX | ⚫️良好/🟡要改善/🔴要注意 | ... |

## 2. 🎯 キャンペーン別パフォーマンス分析

### 優良キャンペーン（トップ3）
表形式：

| キャンペーン名 | 広告費 | CV | CPA | ROAS | 評価 |
|----------------|--------|----|----|------|------|
| ... | ... | ... | ... | ... | ... |

**分析コメント:** [なぜこのキャンペーンが優れているか]

### 改善必要キャンペーン（ワースト2）
表形式：

| キャンペーン名 | 広告費 | CV | CPA | 課題 | 改善策 |
|----------------|--------|----|----|------|--------|
| ... | ... | ... | ... | ... | ... |

## 3. 📱 広告セット別分析

### パフォーマンス一覧
表形式：

| 広告セット名 | 最適化目標 | 広告費 | CV | CPA | ステータス | 推奨アクション |
|--------------|------------|--------|----|----|-----------|---------------|
| ... | ... | ... | ... | ... | ... | ... |

**分析:** [広告セット間の違いと最適化機会]

## 4. 🎨 クリエイティブ別詳細分析

### クリエイティブパフォーマンス
表形式：

| 広告名 | Freq | CTR | CVR | CPA | 疲弊度 | アクション |
|--------|------|-----|-----|-----|--------|-----------|
| ... | X.XX | X.XX% | X.XX% | ¥XXX | 🟢低/🟡中/🔴高 | ... |

### クリエイティブ疲弊度分析
- **疲弊度判定基準:**
  - フリークエンシー < 2.0: 🟢 健全
  - フリークエンシー 2.0-3.5: 🟡 要監視
  - フリークエンシー > 3.5: 🔴 疲弊・更新推奨

## 5. 📊 日別トレンド分析

### 推移サマリー
表形式：

| 日付 | 広告費 | CV | CPA | ROAS | 前日比 | トレンド |
|------|--------|----|----|------|--------|----------|
| ... | ... | ... | ... | ... | ... | ↑/→/↓ |

**トレンド分析:** [日別の傾向と気づき]

## 6. 🏆 勝ちパターン分析

### 成功要因の特定
1. **最も効果的な要素:**
   - キャンペーン構成: [...]
   - ターゲティング: [...]
   - クリエイティブ: [...]

2. **ROAS/CPAが優れている共通点:**
   - [具体的な共通点]

## 7. ✅ 具体的なアクションプラン

表形式で3つの優先アクションを提示：

| 優先度 | アクション | 期待効果 | 実施難易度 | 期待ROI | 実施手順 |
|--------|-----------|----------|-----------|---------|----------|
| 🔴高 | ... | CPA -X%改善 | 低/中/高 | 高/中/低 | 1. ...<br>2. ... |
| 🟡中 | ... | ROAS +X%改善 | 低/中/高 | 高/中/低 | 1. ...<br>2. ... |
| 🟢低 | ... | CTR +X%改善 | 低/中/高 | 高/中/低 | 1. ...<br>2. ... |

## 8. 💡 総合評価と次週に向けたアドバイス

### 現在の運用評価
- **総合スコア:** ⭐⭐⭐⭐☆ (X/5点)
- **強み:** [...]
- **改善点:** [...]

### 次週の重点施策
1. **最優先事項:** [...]
2. **予算配分の推奨:** [...]
3. **監視すべきKPI:** [...]

### 週次チェックリスト
- [ ] 疲弊クリエイティブの更新
- [ ] 低パフォーマンスキャンペーンの停止/調整
- [ ] 勝ちパターンの横展開
- [ ] 日予算の再配分

---

**重要:**
- すべてのデータを表形式で見やすく整理してください
- 具体的な数値と実行可能なアクションを提供してください
- 絵文字を使って視覚的にわかりやすくしてください
- マークダウン表記で美しく整形してください
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
