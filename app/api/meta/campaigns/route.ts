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
          `fields=spend,impressions,clicks,ctr,cpm,cpc,reach,frequency,actions,cost_per_action_type&` +
          `date_preset=${datePreset || 'last_7d'}&` +
          `access_token=${apiKey}`;

        try {
          const insightsResponse = await fetch(insightsUrl);
          if (insightsResponse.ok) {
            const insightsData = await insightsResponse.json();
            if (insightsData.data && insightsData.data.length > 0) {
              const insights = insightsData.data[0];

              // コンバージョンとCPAを抽出
              const conversions = insights.actions?.find(
                (action: any) => action.action_type === 'offsite_conversion.fb_pixel_purchase'
              )?.value || '0';

              const cpa = insights.cost_per_action_type?.find(
                (cost: any) => cost.action_type === 'offsite_conversion.fb_pixel_purchase'
              )?.value || '0';

              return {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
                spend: parseFloat(insights.spend || '0'),
                impressions: parseInt(insights.impressions || '0'),
                clicks: parseInt(insights.clicks || '0'),
                conversions: parseFloat(conversions),
                ctr: parseFloat(insights.ctr || '0'),
                cpm: parseFloat(insights.cpm || '0'),
                cpc: parseFloat(insights.cpc || '0'),
                reach: parseInt(insights.reach || '0'),
                frequency: parseFloat(insights.frequency || '0'),
                cpa: parseFloat(cpa)
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
          cpa: 0
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
