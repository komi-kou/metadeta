import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, insights, campaigns } = await request.json();

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

## データ期間
${insights.date_start} 〜 ${insights.date_stop}

## アカウント全体サマリー
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

${campaigns && campaigns.length > 0 ? `
## キャンペーン別パフォーマンス
${campaigns.slice(0, 5).map((c: any, i: number) => `
### ${i + 1}. ${c.name}
- ステータス: ${c.status}
- 広告費: ¥${c.spend.toLocaleString()}
- インプレッション: ${c.impressions.toLocaleString()}
- クリック数: ${c.clicks.toLocaleString()}
- コンバージョン: ${c.conversions.toFixed(0)}
- CPA: ¥${c.cpa.toLocaleString()}
- CTR: ${c.ctr.toFixed(2)}%
`).join('\n')}
` : ''}

## 以下の形式で詳細なレポートを作成してください:

### 1. アカウント全体サマリー
- 全体的なパフォーマンスの評価
- 前期比がわからない場合は、業界標準と比較した評価

### 2. キャンペーン別パフォーマンス分析（トップ5）
- 最もパフォーマンスが良いキャンペーン
- 改善が必要なキャンペーン
- 各キャンペーンの特徴と提案

### 3. パフォーマンス分析
- CTR、CPC、CPM、CVRの評価
- ROASとCPAの健全性
- リーチとフリークエンシーの最適性

### 4. クリエイティブ疲弊度分析
- フリークエンシーからクリエイティブの疲弊度を判断
- クリエイティブ更新の必要性

### 5. 勝ちパターン分析
- 最も効果的なキャンペーン要素
- 成功要因の特定

### 6. 具体的なアクションプラン（優先度順に3つ）
各アクションプランには以下を含めてください：
- アクション内容
- 期待される効果
- 実施の優先度（高/中/低）

### 7. 総合評価と次週に向けたアドバイス
- 現在の広告運用の総合評価（5段階）
- 次週に注力すべきポイント

---

**重要事項:**
- 具体的な数値を使用して分析してください
- 実行可能で具体的なアドバイスを提供してください
- 専門用語を使いつつ、わかりやすく説明してください
- マークダウン形式で読みやすく整形してください
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
        max_tokens: 4000,
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
