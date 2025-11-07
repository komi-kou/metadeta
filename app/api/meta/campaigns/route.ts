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

    // キャンペーン一覧を取得
    const campaignsUrl = `https://graph.facebook.com/v21.0/${accountId}/campaigns?` +
      `fields=id,name,status,objective&` +
      `access_token=${apiKey}`;

    const campaignsResponse = await fetch(campaignsUrl);

    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'キャンペーン取得に失敗しました', details: errorData },
        { status: campaignsResponse.status }
      );
    }

    const campaignsData = await campaignsResponse.json();

    // 各キャンペーンのインサイトを取得
    const campaignsWithInsights = await Promise.all(
      campaignsData.data.map(async (campaign: any) => {
        const insightsUrl = `https://graph.facebook.com/v21.0/${campaign.id}/insights?` +
          `fields=spend,impressions,clicks,ctr,cpm,cpc,reach,frequency,actions,action_values,cost_per_action_type,video_thruplay_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p100_watched_actions&` +
          `date_preset=${datePreset || 'last_7d'}&` +
          `access_token=${apiKey}`;

        try {
          const insightsResponse = await fetch(insightsUrl);
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            if (insightsData.data && insightsData.data.length > 0) {
              const insights = insightsData.data[0];

              // 標準イベントの優先順位リスト
              const standardEvents = [
                'purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase',
                'lead', 'omni_complete_registration', 'complete_registration',
                'offsite_conversion.fb_pixel_lead', 'offsite_conversion.fb_pixel_complete_registration',
                'initiate_checkout', 'add_to_cart', 'view_content'
              ];

              // すべての標準イベントを取得
              const allConversions: any = {};
              const allCosts: any = {};
              const allValues: any = {};

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

              if (insights.action_values) {
                insights.action_values.forEach((value: any) => {
                  allValues[value.action_type] = parseFloat(value.value);
                });
              }

              // 主要なコンバージョンイベントを優先順位順に検索
              let conversions = 0;
              let cpa = 0;
              let revenue = 0;

              for (const eventType of standardEvents) {
                if (allConversions[eventType] && allConversions[eventType] > 0) {
                  conversions = allConversions[eventType];
                  cpa = allCosts[eventType] || 0;
                  revenue = allValues[eventType] || 0;
                  break;
                }
              }

              // CPAが取得できない場合は計算
              if (!cpa && conversions > 0) {
                cpa = parseFloat(insights.spend || '0') / conversions;
              }

              // CVRを計算
              const cvr = conversions > 0 && insights.clicks ? (conversions / parseInt(insights.clicks)) * 100 : 0;

              return {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
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
                revenue: revenue,
                cvr: cvr
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching insights for campaign ${campaign.id}:`, error);
        }

        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          spend: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          cpm: 0,
          cpc: 0,
          reach: 0,
          frequency: 0,
          cpa: 0,
          revenue: 0,
          cvr: 0
        };
      })
    );

    // spendが高い順にソート
    campaignsWithInsights.sort((a, b) => b.spend - a.spend);

    return NextResponse.json({
      success: true,
      data: campaignsWithInsights,
      count: campaignsWithInsights.length
    });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
