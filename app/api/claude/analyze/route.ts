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

**出力はHTML形式で、以下の構造を使用してください：**

### HTML構造の指定

1. **セクション**: [div class="analysis-section"]...[/div] で各セクションを囲む
2. **セクションタイトル**: [h2 class="section-title"]📊 セクション名[/h2] を使用
3. **サマリーカード**: [div class="summary-card"][div class="card-label"]ラベル[/div][div class="card-value"]値[/div][/div] を使用
4. **インサイトボックス**: [div class="insights-box"][h3]💡 タイトル[/h3][ul][li]インサイト内容[/li][/ul][/div] を使用
5. **テーブル**: [table class="comparison-table"][thead][tr][th]ヘッダー[/th][/tr][/thead][tbody][tr][td]データ[/td][/tr][/tbody][/table] を使用
6. **グラフプレースホルダー**: グラフが必要な場合は [div class="chart-placeholder" data-chart-type="bar" data-chart-id="campaign-chart"][/div] を使用

注: 上記の [ ] は実際には < > として出力してください。

### 📊 1. パフォーマンス概要

#### 🎯 総合評価
- **スコア:** ⭐⭐⭐⭐☆ (X/5点)
- **評価根拠:** [データに基づく具体的な理由]

#### 📈 主要指標の状況
以下の形式でテーブルを作成してください（[ ] は実際には < > として出力）：
[table class="comparison-table"]
[thead]
[tr]
[th]指標[/th]
[th]現在値[/th]
[th]前期比[/th]
[th]状態[/th]
[th]評価[/th]
[/tr]
[/thead]
[tbody]
[tr]
[td]コンバージョン単価（CPA）[/td]
[td]¥XXX[/td]
[td]${comparison ? '↑/↓ X%' : '-'}[/td]
[td]🟢/🟡/🔴[/td]
[td][良い/改善必要/要注意の理由][/td]
[/tr]
[tr]
[td]コンバージョン率（CVR）[/td]
[td]X.XX%[/td]
[td]${comparison ? '↑/↓ X%' : '-'}[/td]
[td]🟢/🟡/🔴[/td]
[td][理由][/td]
[/tr]
[tr]
[td]クリック率（CTR）[/td]
[td]X.XX%[/td]
[td]${comparison ? '↑/↓ X%' : '-'}[/td]
[td]🟢/🟡/🔴[/td]
[td][理由][/td]
[/tr]
[tr]
[td]広告疲弊度（Frequency）[/td]
[td]X.XX[/td]
[td]${comparison ? '↑/↓ X%' : '-'}[/td]
[td]🟢/🟡/🔴[/td]
[td][理由][/td]
[/tr]
[/tbody]
[/table]

**凡例:** 🟢 = 良好 | 🟡 = 要改善 | 🔴 = 緊急対応必要

---

### 🏆 2. 最も成果を出している要素

#### ベストパフォーマンスのセグメント
以下の形式でインサイトボックスを作成してください（[ ] は実際には < > として出力）：
[div class="insights-box"]
[h3]💡 ベストパフォーマンスのセグメント[/h3]
[ul]
[li][strong]👥 オーディエンス:[/strong] [年齢層] × [性別] - CPA ¥XXX、CV XX件
  [ul]
  [li]なぜ効果的か: [理由][/li]
  [li]活用方法: [具体的な推奨][/li]
  [/ul]
[/li]
[li][strong]📱 配信面:[/strong] [Facebook Feed/Instagram Stories等] - 広告費 ¥XXX、CV XX件
  [ul]
  [li]なぜ効果的か: [理由][/li]
  [li]活用方法: [具体的な推奨][/li]
  [/ul]
[/li]
[li][strong]💻 デバイス:[/strong] [Mobile/Desktop] - CPA ¥XXX（最安）
  [ul]
  [li]なぜ効果的か: [理由][/li]
  [/ul]
[/li]
[/ul]
[/div]

#### 成功パターンの特定
[div class="insights-box"]
[h3]💡 成功パターン[/h3]
[ol]
[li][共通要素1][/li]
[li][共通要素2][/li]
[li][横展開できる戦略][/li]
[/ol]
[/div]

---

### ⚠️ 3. 改善が必要な領域（優先度順）

#### 🔴 最優先で対応すべき課題
[div class="insights-box" style="border-left-color: #d63031;"]
[h3 style="color: #d63031;"]🔴 最優先で対応すべき課題[/h3]
[p][strong]課題:[/strong] [具体的な問題]][/p]
[ul]
[li][strong]ビジネスへの影響:[/strong] 広告費の XX% (¥XXX) に影響[/li]
[li][strong]現状:[/strong] [数値で示す]][/li]
[li][strong]推奨アクション:[/strong] [具体的な改善策]][/li]
[/ul]
[/div]

#### 🟡 重要な改善ポイント
[div class="insights-box" style="border-left-color: #f39c12;"]
[h3 style="color: #f39c12;"]🟡 重要な改善ポイント[/h3]
[p][strong]課題:[/strong] [2番目の問題]][/p]
[ul]
[li][strong]ビジネスへの影響:[/strong] [定量的に]][/li]
[li][strong]現状:[/strong] [数値で示す]][/li]
[li][strong]推奨アクション:[/strong] [具体的な改善策]][/li]
[/ul]
[/div]

#### 🟢 長期的な最適化
[div class="insights-box" style="border-left-color: #00b894;"]
[h3 style="color: #00b894;"]🟢 長期的な最適化[/h3]
[p][strong]課題:[/strong] [3番目の問題]][/p]
[ul]
[li][strong]ビジネスへの影響:[/strong] [定量的に]][/li]
[li][strong]推奨アクション:[/strong] [具体的な改善策]][/li]
[/ul]
[/div]

---

### 👥 4. オーディエンス分析

#### 最も価値のあるセグメント
以下の形式でテーブルを作成してください（[ ] は実際には < > として出力）：
[table class="comparison-table"]
[thead]
[tr]
[th]セグメント[/th]
[th]CPA[/th]
[th]CV[/th]
[th]状態[/th]
[th]推奨アクション[/th]
[/tr]
[/thead]
[tbody]
[tr]
[td]🏆 [年齢層] × [性別][/td]
[td]¥XXX[/td]
[td]XX件[/td]
[td]🟢[/td]
[td]予算を XX% 増やす[/td]
[/tr]
[tr]
[td]🟡 [年齢層] × [性別][/td]
[td]¥XXX[/td]
[td]CVR低い[/td]
[td]🟡[/td]
[td]クリエイティブを変更してテスト[/td]
[/tr]
[tr]
[td]🔴 [年齢層] × [性別][/td]
[td]¥XXX（非効率）[/td]
[td]-[/td]
[td]🔴[/td]
[td]予算を削減または停止[/td]
[/tr]
[/tbody]
[/table]

#### 未開拓の機会
[div class="insights-box"]
[h3]💡 未開拓の機会[/h3]
[ul]
[li][パフォーマンスは良いが予算配分が少ないセグメント]][/li]
[/ul]
[/div]

#### 飽和の兆候
${placements && placements.byPublisher ? `
[div class="insights-box"]
[h3]⚠️ 飽和の兆候[/h3]
[ul]
[li][高フリークエンシーで疲弊している配信面やセグメント]][/li]
[/ul]
[/div]
` : ''}

---

### 📋 5. 次のステップ（実行可能なアクション）

**重要:** 上記の「⚠️ 3. 改善が必要な領域」で特定した各課題に対して、具体的な実行可能なアクションを必ず生成してください。課題が3つある場合は、最低3つのアクションを生成してください。

#### すぐに実行すべきアクション
[div class="insights-box"]
[h3]📋 すぐに実行すべきアクション[/h3]
[ol]
[li][strong][具体的なアクション1 - 最優先課題に対応]][/strong]
  [ul]
  [li]所要時間: XX分[/li]
  [li]期待される成果: [CPA -XX% または CV +XX件]][/li]
  [li]手順: [ステップバイステップ]][/li]
  [/ul]
[/li]
[li][strong][具体的なアクション2 - 2番目の課題に対応]][/strong]
  [ul]
  [li]所要時間: XX分[/li]
  [li]期待される成果: [定量的な目標]][/li]
  [li]手順: [ステップバイステップ]][/li]
  [/ul]
[/li]
[li][strong][具体的なアクション3 - 3番目の課題に対応]][/strong]
  [ul]
  [li]所要時間: XX分[/li]
  [li]期待される成果: [定量的な目標]][/li]
  [li]手順: [ステップバイステップ]][/li]
  [/ul]
[/li]
[/ol]
[/div]

**注意:** 上記は例です。実際のデータに基づいて、特定した課題の数だけアクションを生成してください。最低でも2つ以上、理想的には3-5つのアクションを生成してください。

#### 今週中に実行すべきアクション
[div class="insights-box"]
[h3]📅 今週中に実行すべきアクション[/h3]
[ol]
[li][strong][具体的なアクション1]][/strong]
  [ul]
  [li]所要時間: X時間[/li]
  [li]期待される成果: [定量的な目標]][/li]
  [/ul]
[/li]
[li][strong][具体的なアクション2]][/strong]
  [ul]
  [li]所要時間: X時間[/li]
  [li]期待される成果: [定量的な目標]][/li]
  [/ul]
[/li]
[/ol]
[/div]

---

### 📌 重要な注意事項

- **HTML形式で出力:** 上記のHTML構造を使用して、視覚的に見やすいレポートを作成してください
- **HTMLタグの変換:** プロンプト内で [ ] と記述されている部分は、実際の出力では < > に変換してください（例: [div] → <div>, [/div] → </div>）
- **視覚的な表現:** 🟢🟡🔴の絵文字を使って状態を一目で判断できるようにする
- **ビジネス言語:** 技術的な専門用語ではなく、ビジネスへの影響で説明する
- **具体的な数値:** 「改善する」ではなく「CPA を ¥XXX から ¥YYY に下げる」のように具体的に
- **実行可能性:** すべての推奨事項に具体的な手順を含める
- **ROASは使用しない:** CPA、CVR、CTRなどの指標に焦点を当てる

**重要:** 上記のHTML構造に従って、[ ] を < > に変換した完全なHTMLコードとして、明確なセクション区切りを持つ視覚的なダッシュボードとして分析レポートを作成してください。

**特に重要な指示:**
- 「📋 5. 次のステップ（実行可能なアクション）」セクションでは、必ず複数のアクション（最低2つ以上、理想的には3-5つ）を生成してください
- 「⚠️ 3. 改善が必要な領域」で特定した各課題に対して、対応するアクションを必ず生成してください
- アクションは具体的で実行可能なものにしてください
- レスポンスは完全に生成してください。途中で止めないでください。
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
        max_tokens: 16000,
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
    
    // トークン使用量をログに出力（デバッグ用）
    if (data.usage) {
      console.log('Claude API Usage:', {
        input_tokens: data.usage.input_tokens,
        output_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens,
        max_tokens: 16000,
        usage_percentage: ((data.usage.input_tokens + data.usage.output_tokens) / 16000 * 100).toFixed(1) + '%',
        stop_reason: data.stop_reason || 'unknown'
      });
      
      // トークン制限に近い場合の警告
      if (data.usage.output_tokens >= 15000) {
        console.warn('⚠️ トークン使用量が上限に近づいています。レスポンスが途中で切れている可能性があります。');
      }
      
      // stop_reasonがmax_tokensの場合、途中で切れている
      if (data.stop_reason === 'max_tokens') {
        console.warn('⚠️ トークン制限に達しました。レスポンスが途中で切れています。max_tokensを増やすことを検討してください。');
      }
    }
    
    // レスポンスが途中で切れていないか確認
    const analysisLength = analysis.length;
    console.log('Analysis response length:', analysisLength, 'characters');
    
    // 最後のセクションが完全か確認
    const hasActionSteps = analysis.includes('📋 5. 次のステップ') || analysis.includes('すぐに実行すべきアクション') || analysis.includes('実行可能なアクション');
    
    // アクション項目の数をカウント（HTMLタグの形式に応じて）
    const actionCountPatterns = [
      /<li><strong>/g,  // HTML形式
      /\[li\]\[strong\]/g,  // [ ]形式
      /<li[^>]*><strong>/g  // 属性付きHTML形式
    ];
    let actionCount = 0;
    for (const pattern of actionCountPatterns) {
      const matches = analysis.match(pattern);
      if (matches && matches.length > actionCount) {
        actionCount = matches.length;
      }
    }
    
    // 「すぐに実行すべきアクション」セクション内のアクション数を確認
    const immediateActionsMatch = analysis.match(/すぐに実行すべきアクション[\s\S]*?今週中に実行すべきアクション/);
    const immediateActionCount = immediateActionsMatch ? 
      (immediateActionsMatch[0].match(/<li><strong>|\[li\]\[strong\]/g) || []).length : 0;
    
    console.log('Action steps found:', hasActionSteps);
    console.log('Total action items count:', actionCount);
    console.log('Immediate action items count:', immediateActionCount);
    
    if (hasActionSteps && immediateActionCount < 2) {
      console.warn('⚠️ 「すぐに実行すべきアクション」セクションにアクションが1つしかありません。プロンプトの指示を確認してください。');
    }

    return NextResponse.json({
      success: true,
      analysis: analysis,
      model: data.model,
      usage: data.usage,
      stop_reason: data.stop_reason,
      debug: {
        analysis_length: analysisLength,
        has_action_steps: hasActionSteps,
        total_action_count: actionCount,
        immediate_action_count: immediateActionCount,
        token_warning: data.usage && data.usage.output_tokens >= 15000,
        truncated: data.stop_reason === 'max_tokens'
      }
    });
  } catch (error) {
    console.error('Claude Analysis Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
