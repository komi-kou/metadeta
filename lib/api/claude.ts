// Claude API連携
// 広告データの分析とレポート生成

/**
 * Anthropic Claude APIを使用して広告データを分析
 *
 * セットアップ:
 * 1. https://console.anthropic.com/ でAPIキーを取得
 * 2. 環境変数 ANTHROPIC_API_KEY に設定
 */

export interface AnalysisRequest {
  adData: any;
  analysisType: 'performance' | 'creative' | 'recommendations' | 'full';
  period: 'daily' | 'weekly' | 'monthly';
}

export interface AnalysisResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  alerts: string[];
}

/**
 * Claude APIを使用して広告データを分析
 */
export async function analyzeAdDataWithClaude(
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const prompt = generateAnalysisPrompt(request);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const analysis = data.content[0].text;

  // レスポンスをパースして構造化データに変換
  return parseClaudeAnalysis(analysis);
}

/**
 * 分析プロンプトを生成
 */
function generateAnalysisPrompt(request: AnalysisRequest): string {
  const { adData, analysisType, period } = request;
  const { summary, campaigns } = adData;

  // 期間ラベルの生成
  const periodLabel = period === 'daily' ? '日次レポート（前日比）' : 
                      period === 'weekly' ? '週次レポート（前週比）' : 
                      '月次レポート（前月比）';

  // キャンペーンデータの整形
  const campaignsText = campaigns && campaigns.length > 0 ? `
### キャンペーン別パフォーマンス（トップ10）
${campaigns.slice(0, 10).map((c: any, i: number) => {
  const insights = c.insights || c;
  return `
${i + 1}. ${c.name}
   - ステータス: ${c.status} | 広告費: ¥${insights.spend?.toLocaleString() || '0'} | CV: ${insights.conversions?.toFixed(0) || '0'} | CPA: ¥${insights.cpa?.toLocaleString() || '0'} | CTR: ${insights.ctr?.toFixed(2) || '0'}% | CVR: ${insights.cvr ? insights.cvr.toFixed(2) + '%' : 'N/A'}
`;
}).join('')}
` : '';

  const analysisPrompt = `あなたは経験豊富なデジタルマーケティングアナリストです。Meta広告の包括的なパフォーマンス分析レポートを作成してください。

**分析期間:** ${periodLabel}

以下のステップに従って分析を実行してください：

---

## ステップ 1: パフォーマンスデータの抽出

### アカウント全体メトリクス（現在期間）
- 広告費: ¥${summary?.spend?.toLocaleString() || '0'}
- インプレッション: ${summary?.impressions?.toLocaleString() || '0'}
- クリック数: ${summary?.clicks?.toLocaleString() || '0'}
- CTR: ${summary?.ctr?.toFixed(2) || '0'}%
- CPC: ¥${summary?.cpc?.toFixed(0) || '0'}
- CPM: ¥${summary?.cpm?.toFixed(0) || '0'}
- リーチ: ${summary?.reach?.toLocaleString() || '0'}
- フリークエンシー: ${summary?.frequency?.toFixed(2) || '0'}
- コンバージョン数: ${summary?.conversions?.toFixed(0) || '0'}
- CPA: ¥${summary?.cpa?.toLocaleString() || '0'}
${summary?.cvr !== undefined ? `- CVR: ${summary.cvr.toFixed(2)}%` : ''}
${summary?.roas !== undefined ? `- ROAS: ${summary.roas.toFixed(2)}` : ''}

${campaignsText}

---

## ステップ 2: 効率性指標の計算

以下の効率性指標を分析に使用してください：
- セグメント別のコンバージョン単価（CPA）
- キャンペーン別のコンバージョン率（CVR）
- フリークエンシーとリーチの効率性
- キャンペーン別の費用対効果

---

## ステップ 3: インサイトセクションの作成

以下のセクションを作成してください：

### 1. パフォーマンス概要（現状把握）
- どのキャンペーンが最良の結果を出しているか
- 広告費の使われ方は効率的か
- 全体的なパフォーマンスの評価

### 2. 最も成果を出している要素
- **ベストパフォーマンスのキャンペーン:**
  - 最もCPAが低いキャンペーン
  - 最もコンバージョン数が多いキャンペーン
  - 最も効率的なキャンペーン

### 3. 改善が必要な領域
- **パフォーマンスが低いキャンペーン:**
  - CPAが高すぎるキャンペーン
  - 広告費を浪費しているキャンペーン
  - コンバージョンが少ないキャンペーン

### 4. キャンペーン分析
- どのキャンペーンに最も効果的にリーチできているか
- 未開拓で可能性のある高パフォーマンスキャンペーンの特定
- キャンペーン飽和の兆候（高フリークエンシー、パフォーマンス低下）

---

## ステップ 4: 具体的なインサイトのハイライト

以下を強調してください：
- 成果の高いキャンペーンで活用不足のもの
- 前期比較で大きく改善または悪化している指標（可能な場合）
- 広告費配分の最適化機会

---

## 出力形式

**重要:** すべてのデータを、専門用語を最小限に抑え、**ビジネスへの影響**に焦点を当てて提示してください。広告指標ではなく、ビジネスの成果を重視してください。

以下の形式で視覚的なダッシュボードを作成してください：

### 📊 1. パフォーマンス概要

#### 🎯 総合評価
- **スコア:** ⭐⭐⭐⭐☆ (X/5点)
- **評価根拠:** [データに基づく具体的な理由]

#### 📈 主要指標の状況
| 指標 | 現在値 | 状態 | 評価 |
|------|--------|------|------|
| コンバージョン単価（CPA） | ¥${summary?.cpa?.toLocaleString() || 'XXX'} | 🟢/🟡/🔴 | [良い/改善必要/要注意の理由] |
| コンバージョン率（CVR） | ${summary?.cvr ? summary.cvr.toFixed(2) + '%' : 'X.XX%'} | 🟢/🟡/🔴 | [理由] |
| クリック率（CTR） | ${summary?.ctr?.toFixed(2) || 'X.XX'}% | 🟢/🟡/🔴 | [理由] |
| 広告疲弊度（Frequency） | ${summary?.frequency?.toFixed(2) || 'X.XX'} | 🟢/🟡/🔴 | [理由] |

**凡例:** 🟢 = 良好 | 🟡 = 要改善 | 🔴 = 緊急対応必要

---

### 🏆 2. 最も成果を出している要素

#### ベストパフォーマンスのキャンペーン
${campaigns && campaigns.length > 0 ? campaigns.slice(0, 3).map((c: any, i: number) => {
  const insights = c.insights || c;
  return `- **${i + 1}. ${c.name}:** CPA ¥${insights.cpa?.toLocaleString() || 'XXX'}、CV ${insights.conversions?.toFixed(0) || 'XX'}件
  - なぜ効果的か: [理由]
  - 活用方法: [具体的な推奨]
`;
}).join('\n') : '- [データに基づく分析]'}

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

### 👥 4. キャンペーン分析

#### 最も価値のあるキャンペーン
${campaigns && campaigns.length > 0 ? campaigns.slice(0, 3).map((c: any) => {
  const insights = c.insights || c;
  return `- 🏆 **${c.name}:** CPA ¥${insights.cpa?.toLocaleString() || 'XXX'}、CV ${insights.conversions?.toFixed(0) || 'XX'}件
  - **推奨:** [具体的な推奨事項]
`;
}).join('\n') : '- [データに基づく分析]'}

#### 未開拓の機会
- [パフォーマンスは良いが予算配分が少ないキャンペーン]

#### 飽和の兆候
- [高フリークエンシーで疲弊しているキャンペーン]

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

---

**追加の分析タイプ別指示:**
${analysisType === 'performance' ? `
特にパフォーマンス指標（CPA、CVR、CTR）に焦点を当ててください。
KPI達成状況と改善の余地を具体的に指摘してください。` : ''}
${analysisType === 'creative' ? `
クリエイティブの疲弊度、エンゲージメント率、クリック率を重点的に分析してください。
どのクリエイティブが優れているか、何を改善すべきかを明確にしてください。` : ''}
${analysisType === 'recommendations' ? `
具体的で実行可能なアクションプランを提示してください。
各推奨事項について、期待される効果と実施の優先度を明記してください。` : ''}
${analysisType === 'full' ? `
包括的な分析を行い、パフォーマンス、クリエイティブ、ターゲティング、予算配分など
あらゆる側面から改善機会を特定してください。` : ''}
`;

  return analysisPrompt;
}

/**
 * Claudeの分析結果をパース
 */
function parseClaudeAnalysis(analysis: string): AnalysisResponse {
  // 簡易的なパース実装
  // 実際にはより堅牢なパースロジックが必要

  const sections = analysis.split('##');

  const getSectionContent = (title: string): string => {
    const section = sections.find(s => s.trim().startsWith(title));
    return section ? section.replace(title, '').trim() : '';
  };

  const parseList = (content: string): string[] => {
    return content
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);
  };

  return {
    summary: getSectionContent('サマリー'),
    insights: parseList(getSectionContent('インサイト')),
    recommendations: parseList(getSectionContent('推奨アクション')),
    alerts: parseList(getSectionContent('アラート')),
  };
}

/**
 * 複数の広告アカウントを比較分析
 */
export async function compareAdAccounts(
  accounts: Array<{ id: string; data: any }>
): Promise<any> {
  const prompt = `以下の複数の広告アカウントのパフォーマンスを比較分析してください：

${accounts.map((acc, i) => `
アカウント${i + 1}: ${acc.id}
${JSON.stringify(acc.data, null, 2)}
`).join('\n')}

各アカウントの強み・弱み、ベストプラクティス、改善機会を特定してください。`;

  // Claude API呼び出し実装
  // ...
}

/**
 * トレンド分析
 */
export async function analyzeTrends(
  historicalData: any[]
): Promise<any> {
  const prompt = `以下の時系列データからトレンドを分析してください：

${JSON.stringify(historicalData, null, 2)}

パフォーマンスの変動パターン、季節性、異常値を特定し、
今後の予測と推奨事項を提供してください。`;

  // Claude API呼び出し実装
  // ...
}
