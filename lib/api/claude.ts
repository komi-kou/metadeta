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
      model: 'claude-3-5-sonnet-20241022',
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

  const basePrompt = `あなたは経験豊富なデジタルマーケティングアナリストです。
以下のMeta（Facebook）広告データを分析し、具体的で実行可能なインサイトを提供してください。

【分析期間】
${period === 'daily' ? '日次レポート（前日比）' : period === 'weekly' ? '週次レポート（前週比）' : '月次レポート（前月比）'}

【広告データ】
${JSON.stringify(adData, null, 2)}

【分析タイプ】
${analysisType}

以下の形式で分析結果を提供してください：

## サマリー
全体的なパフォーマンスの要約（100-150文字程度）

## インサイト
重要な発見を箇条書きで3-5個

## 推奨アクション
具体的な改善案を優先度順に3-5個

## アラート
注意が必要な点や懸念事項があれば記載`;

  // 分析タイプに応じて追加の指示
  const typeSpecificPrompts: Record<string, string> = {
    performance: `
特にパフォーマンス指標（ROAS、CPA、CVR）に焦点を当ててください。
KPI達成状況と改善の余地を具体的に指摘してください。`,
    creative: `
クリエイティブの疲弊度、エンゲージメント率、クリック率を重点的に分析してください。
どのクリエイティブが優れているか、何を改善すべきかを明確にしてください。`,
    recommendations: `
具体的で実行可能なアクションプランを提示してください。
各推奨事項について、期待される効果と実施の優先度を明記してください。`,
    full: `
包括的な分析を行い、パフォーマンス、クリエイティブ、ターゲティング、予算配分など
あらゆる側面から改善機会を特定してください。`
  };

  return basePrompt + '\n' + typeSpecificPrompts[analysisType];
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
