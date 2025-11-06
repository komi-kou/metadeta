// モックデータ: 広告パフォーマンスデータ

export const mockAdData = {
  summary: {
    period: '2024-11-01 ~ 2024-11-07',
    spend: 1250000,
    impressions: 523000,
    clicks: 12500,
    ctr: 2.39,
    cpc: 100,
    cpm: 2391,
    reach: 312000,
    frequency: 1.68,
    conversions: 425,
    cpa: 2941,
    roas: 3.2,
    // 前週比
    previousPeriod: {
      spend: 1100000,
      impressions: 485000,
      clicks: 11200,
      conversions: 380,
      roas: 2.8,
    }
  },

  campaignPerformance: [
    {
      id: '1',
      name: '春季セールキャンペーン',
      spend: 450000,
      impressions: 198000,
      clicks: 4800,
      ctr: 2.42,
      conversions: 165,
      cpa: 2727,
      roas: 3.8,
      status: 'active',
      trend: 'up'
    },
    {
      id: '2',
      name: '新商品プロモーション',
      spend: 380000,
      impressions: 152000,
      clicks: 3650,
      ctr: 2.40,
      conversions: 128,
      cpa: 2969,
      roas: 3.4,
      status: 'active',
      trend: 'up'
    },
    {
      id: '3',
      name: 'リターゲティング',
      spend: 220000,
      impressions: 89000,
      clicks: 2100,
      ctr: 2.36,
      conversions: 78,
      cpa: 2821,
      roas: 3.6,
      status: 'active',
      trend: 'stable'
    },
    {
      id: '4',
      name: 'ブランド認知',
      spend: 150000,
      impressions: 64000,
      clicks: 1450,
      ctr: 2.27,
      conversions: 42,
      cpa: 3571,
      roas: 2.2,
      status: 'active',
      trend: 'down'
    },
    {
      id: '5',
      name: 'コレクション広告',
      spend: 50000,
      impressions: 20000,
      clicks: 500,
      ctr: 2.50,
      conversions: 12,
      cpa: 4167,
      roas: 1.8,
      status: 'paused',
      trend: 'down'
    },
  ],

  adSetAnalysis: [
    {
      id: 'as1',
      campaignName: '春季セールキャンペーン',
      name: '20-30代女性ターゲット',
      spend: 180000,
      conversions: 72,
      cpa: 2500,
      roas: 4.2,
      creativeFatigue: 'low',
      recommendation: 'パフォーマンス良好。予算増加を推奨'
    },
    {
      id: 'as2',
      campaignName: '春季セールキャンペーン',
      name: '30-40代男性ターゲット',
      spend: 150000,
      conversions: 58,
      cpa: 2586,
      roas: 3.9,
      creativeFatigue: 'medium',
      recommendation: 'クリエイティブのリフレッシュを検討'
    },
    {
      id: 'as3',
      campaignName: '新商品プロモーション',
      name: '興味関心ターゲット',
      spend: 200000,
      conversions: 65,
      cpa: 3077,
      roas: 3.3,
      creativeFatigue: 'low',
      recommendation: 'ターゲティングの拡大を推奨'
    },
  ],

  creativeAnalysis: [
    {
      id: 'cr1',
      name: '春季セール_動画01',
      type: 'video',
      impressions: 95000,
      clicks: 2400,
      ctr: 2.53,
      conversions: 82,
      cvr: 3.42,
      fatigue: 15, // %
      daysRunning: 12,
      recommendation: 'パフォーマンス優秀。継続推奨'
    },
    {
      id: 'cr2',
      name: '春季セール_画像バナー02',
      type: 'image',
      impressions: 62000,
      clicks: 1420,
      ctr: 2.29,
      conversions: 48,
      cvr: 3.38,
      fatigue: 45, // %
      daysRunning: 28,
      recommendation: 'クリエイティブ疲弊。新規制作を推奨'
    },
    {
      id: 'cr3',
      name: '新商品_カルーセル01',
      type: 'carousel',
      impressions: 88000,
      clicks: 2180,
      ctr: 2.48,
      conversions: 71,
      cvr: 3.26,
      fatigue: 22, // %
      daysRunning: 18,
      recommendation: 'パフォーマンス良好。予算配分増加を検討'
    },
  ],

  dailyTrend: [
    { date: '11/01', spend: 165000, conversions: 58, roas: 2.9, ctr: 2.32 },
    { date: '11/02', spend: 172000, conversions: 62, roas: 3.1, ctr: 2.35 },
    { date: '11/03', spend: 185000, conversions: 68, roas: 3.3, ctr: 2.38 },
    { date: '11/04', spend: 192000, conversions: 72, roas: 3.4, ctr: 2.41 },
    { date: '11/05', spend: 178000, conversions: 65, roas: 3.2, ctr: 2.37 },
    { date: '11/06', spend: 180000, conversions: 55, roas: 2.8, ctr: 2.28 },
    { date: '11/07', spend: 178000, conversions: 45, roas: 2.5, ctr: 2.25 },
  ],

  actionPlans: [
    {
      priority: 'high',
      title: 'クリエイティブ疲弊への対応',
      description: '「春季セール_画像バナー02」が28日間稼働し、疲弊度45%。新規クリエイティブを3パターン制作し、A/Bテストを実施してください。',
      impact: '想定CPA改善: 15-20%',
    },
    {
      priority: 'medium',
      title: '高パフォーマンスキャンペーンの予算増額',
      description: '「春季セールキャンペーン」のROAS 3.8と好調。予算を30%増額し、スケール可能性をテストすることを推奨します。',
      impact: '想定売上増加: ¥450,000/週',
    },
    {
      priority: 'medium',
      title: 'リターゲティング精度の向上',
      description: 'サイト訪問後7日以内のユーザーへの配信を強化。カート放棄ユーザーには特別オファーを提示してください。',
      impact: '想定CVR改善: 25%',
    },
  ],

  insights: {
    performanceAnalysis: {
      overall: 'good',
      summary: '今週のパフォーマンスは前週比+13.6%と好調。特に春季セールキャンペーンが牽引。ただし、週末にかけてCVRが低下傾向にあり、クリエイティブ疲弊の兆候が見られます。',
      strengths: [
        '春季セールキャンペーンのROAS 3.8は目標値（3.0）を大きく上回る',
        '新規顧客獲得数が前週比+20%と順調',
        'リターゲティングキャンペーンの効率が改善（CPA -8%）',
      ],
      concerns: [
        '週末のCVRが平日比-22%と大幅に低下',
        'ブランド認知キャンペーンのROAS 2.2は目標未達',
        'クリエイティブ疲弊度が全体平均で27%に上昇',
      ]
    },
    creativeFatigueAnalysis: {
      status: 'warning',
      averageFatigue: 27,
      highFatigueCreatives: 2,
      recommendation: '28日以上稼働中の2つのクリエイティブで疲弊が顕著。優先的にリフレッシュが必要です。',
    },
    winningPattern: {
      bestPerforming: {
        creativeType: '動画（15秒）',
        targetAudience: '20-30代女性',
        message: 'セール訴求 + UGC（ユーザー生成コンテンツ）',
        avgROAS: 4.1,
      },
      insights: '動画クリエイティブ、特にユーザーレビューや使用シーンを含むUGC形式が最も高いエンゲージメントを獲得しています。',
    },
    nextWeekAdvice: 'クリエイティブリフレッシュを最優先で実施しつつ、高パフォーマンスキャンペーンへの予算配分を増やすことを推奨します。また、週末のパフォーマンス低下に対しては、曜日別の入札調整を検討してください。',
  }
};
