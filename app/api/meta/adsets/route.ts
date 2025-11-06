import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, accountId, datePreset } = await request.json();

    if (!apiKey || !accountId) {
      return NextResponse.json(
        { error: 'APIキーとアカウントIDが必要です' },
        { status: 400 }
      );
    }

    // Meta Ads Graph APIから広告セットデータを取得
    const fields = [
      'name',
      'status',
      'campaign_id',
      'campaign_name',
      'daily_budget',
      'lifetime_budget',
      'optimization_goal',
      'targeting',
      'bid_strategy'
    ].join(',');

    const insightsFields = [
      'spend',
      'impressions',
      'clicks',
      'actions',
      'action_values',
      'cost_per_action_type',
      'ctr',
      'cpm',
      'cpc',
      'frequency',
      'reach'
    ].join(',');

    // 広告セット一覧とインサイトを取得
    const url = `https://graph.facebook.com/v21.0/${accountId}/adsets?` +
      `fields=${fields},insights.date_preset(${datePreset || 'last_7d'}){${insightsFields}}&` +
      `limit=100&` +
      `access_token=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Meta Ads API Error:', errorData);

      return NextResponse.json(
        {
          error: 'Meta Ads API接続に失敗しました',
          details: errorData,
          message: errorData.error?.message || '不明なエラー'
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // データを整形して返す
    if (data.data && data.data.length > 0) {
      const standardEvents = [
        'purchase',
        'omni_purchase',
        'offsite_conversion.fb_pixel_purchase',
        'lead',
        'omni_complete_registration',
        'complete_registration',
        'offsite_conversion.fb_pixel_lead',
        'offsite_conversion.fb_pixel_complete_registration',
        'initiate_checkout',
        'add_to_cart',
        'view_content'
      ];

      const formattedAdsets = data.data.map((adset: any) => {
        const insights = adset.insights?.data?.[0];

        if (!insights) {
          return {
            id: adset.id,
            name: adset.name,
            status: adset.status,
            campaign_name: adset.campaign_name,
            optimization_goal: adset.optimization_goal,
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            cpm: 0,
            cpc: 0,
            reach: 0,
            frequency: 0,
            cpa: 0
          };
        }

        // 標準イベントを取得
        const allConversions: any = {};
        const allCosts: any = {};

        if (insights.actions) {
          insights.actions.forEach((action: any) => {
            allConversions[action.action_type] = parseFloat(action.value);
          });
        }

        if (insights.cost_per_action_type) {
          insights.cost_per_action_type.forEach((cost: any) => {
            allCosts[cost.action_type] = parseFloat(cost.value);
          });
        }

        // 主要なコンバージョンイベントを優先順位順に検索
        let conversions = 0;
        let cpa = 0;

        for (const eventType of standardEvents) {
          if (allConversions[eventType] && allConversions[eventType] > 0) {
            conversions = allConversions[eventType];
            cpa = allCosts[eventType] || 0;
            break;
          }
        }

        // CPAが取得できない場合は計算
        if (!cpa && conversions > 0) {
          cpa = parseFloat(insights.spend || '0') / conversions;
        }

        return {
          id: adset.id,
          name: adset.name,
          status: adset.status,
          campaign_name: adset.campaign_name,
          optimization_goal: adset.optimization_goal,
          daily_budget: adset.daily_budget ? parseFloat(adset.daily_budget) / 100 : null,
          lifetime_budget: adset.lifetime_budget ? parseFloat(adset.lifetime_budget) / 100 : null,
          spend: parseFloat(insights.spend || '0'),
          impressions: parseInt(insights.impressions || '0'),
          clicks: parseInt(insights.clicks || '0'),
          conversions: conversions,
          ctr: parseFloat(insights.ctr || '0'),
          cpm: parseFloat(insights.cpm || '0'),
          cpc: parseFloat(insights.cpc || '0'),
          reach: parseInt(insights.reach || '0'),
          frequency: parseFloat(insights.frequency || '0'),
          cpa: cpa,
          allConversions: allConversions
        };
      });

      // 広告費順でソート
      formattedAdsets.sort((a: any, b: any) => b.spend - a.spend);

      return NextResponse.json({
        success: true,
        data: formattedAdsets
      });
    } else {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
