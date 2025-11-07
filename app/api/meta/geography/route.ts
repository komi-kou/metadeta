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

    // 地域のbreakdownを取得
    const fields = [
      'spend',
      'impressions',
      'clicks',
      'actions',
      'cost_per_action_type',
      'ctr',
      'cpm',
      'cpc'
    ].join(',');

    // 国別breakdownを取得
    const countryUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=country&` +
      `access_token=${apiKey}`;

    const countryResponse = await fetch(countryUrl);

    // 地域（DMA）別breakdownを取得
    const regionUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=region&` +
      `access_token=${apiKey}`;

    const regionResponse = await fetch(regionUrl);

    if (!countryResponse.ok) {
      const errorData = await countryResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: '地域データの取得に失敗しました', details: errorData },
        { status: countryResponse.status }
      );
    }

    const countryData = await countryResponse.json();
    const regionData = await regionResponse.json();

    // 標準イベントの優先順位リスト
    const standardEvents = [
      'purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase',
      'lead', 'omni_complete_registration', 'complete_registration'
    ];

    // データを整形
    const formatGeographicData = (data: any) => {
      if (!data.data || data.data.length === 0) return [];

      return data.data.map((item: any) => {
        // 標準イベントを取得
        let conversions = 0;
        let cpa = 0;

        if (item.actions) {
          for (const eventType of standardEvents) {
            const action = item.actions.find((a: any) => a.action_type === eventType);
            if (action) {
              conversions = parseFloat(action.value);
              break;
            }
          }
        }

        if (item.cost_per_action_type) {
          for (const eventType of standardEvents) {
            const cost = item.cost_per_action_type.find((c: any) => c.action_type === eventType);
            if (cost) {
              cpa = parseFloat(cost.value);
              break;
            }
          }
        }

        // CPAが取得できない場合は計算
        if (!cpa && conversions > 0) {
          cpa = parseFloat(item.spend || '0') / conversions;
        }

        const cvr = conversions > 0 && item.clicks ? (conversions / parseInt(item.clicks)) * 100 : 0;

        return {
          country: item.country || null,
          region: item.region || null,
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0'),
          clicks: parseInt(item.clicks || '0'),
          conversions: conversions,
          ctr: parseFloat(item.ctr || '0'),
          cpm: parseFloat(item.cpm || '0'),
          cpc: parseFloat(item.cpc || '0'),
          cpa: cpa,
          cvr: cvr
        };
      });
    };

    const countryBreakdown = formatGeographicData(countryData);
    const regionBreakdown = formatGeographicData(regionData);

    // 広告費順でソート
    countryBreakdown.sort((a: any, b: any) => b.spend - a.spend);
    regionBreakdown.sort((a: any, b: any) => b.spend - a.spend);

    return NextResponse.json({
      success: true,
      data: {
        byCountry: countryBreakdown,
        byRegion: regionBreakdown
      }
    });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
