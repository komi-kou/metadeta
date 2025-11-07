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

    // プレースメント（配信面）のbreakdownを取得
    const fields = [
      'spend',
      'impressions',
      'clicks',
      'actions',
      'cost_per_action_type',
      'ctr',
      'cpm',
      'cpc',
      'reach',
      'frequency'
    ].join(',');

    // プレースメント別breakdownを取得（publisher_platform）
    const publisherUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=publisher_platform&` +
      `access_token=${apiKey}`;

    const publisherResponse = await fetch(publisherUrl);

    // プラットフォームポジション別breakdown
    const platformPositionUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=platform_position&` +
      `access_token=${apiKey}`;

    const platformPositionResponse = await fetch(platformPositionUrl);

    if (!publisherResponse.ok) {
      const errorData = await publisherResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'プレースメントデータの取得に失敗しました', details: errorData },
        { status: publisherResponse.status }
      );
    }

    const publisherData = await publisherResponse.json();
    const platformPositionData = await platformPositionResponse.json();

    // 標準イベントの優先順位リスト
    const standardEvents = [
      'purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase',
      'lead', 'omni_complete_registration', 'complete_registration'
    ];

    // データを整形
    const formatPlacementData = (data: any) => {
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
          publisher_platform: item.publisher_platform || null,
          platform_position: item.platform_position || null,
          spend: parseFloat(item.spend || '0'),
          impressions: parseInt(item.impressions || '0'),
          clicks: parseInt(item.clicks || '0'),
          conversions: conversions,
          ctr: parseFloat(item.ctr || '0'),
          cpm: parseFloat(item.cpm || '0'),
          cpc: parseFloat(item.cpc || '0'),
          reach: parseInt(item.reach || '0'),
          frequency: parseFloat(item.frequency || '0'),
          cpa: cpa,
          cvr: cvr
        };
      });
    };

    const publisherBreakdown = formatPlacementData(publisherData);
    const platformPositionBreakdown = formatPlacementData(platformPositionData);

    // 広告費順でソート
    publisherBreakdown.sort((a: any, b: any) => b.spend - a.spend);
    platformPositionBreakdown.sort((a: any, b: any) => b.spend - a.spend);

    return NextResponse.json({
      success: true,
      data: {
        byPublisher: publisherBreakdown,
        byPosition: platformPositionBreakdown
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
