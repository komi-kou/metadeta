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

    // 年齢・性別のbreakdownを取得
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

    // 年齢breakdownを取得
    const ageUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=age&` +
      `access_token=${apiKey}`;

    const ageResponse = await fetch(ageUrl);

    // 性別breakdownを取得
    const genderUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=gender&` +
      `access_token=${apiKey}`;

    const genderResponse = await fetch(genderUrl);

    // 年齢×性別のクロスbreakdownを取得
    const ageGenderUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
      `breakdowns=age,gender&` +
      `access_token=${apiKey}`;

    const ageGenderResponse = await fetch(ageGenderUrl);

    if (!ageResponse.ok) {
      const errorData = await ageResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'デモグラフィックデータの取得に失敗しました', details: errorData },
        { status: ageResponse.status }
      );
    }

    const ageData = await ageResponse.json();
    const genderData = await genderResponse.json();
    const ageGenderData = await ageGenderResponse.json();

    // 標準イベントの優先順位リスト
    const standardEvents = [
      'purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase',
      'lead', 'omni_complete_registration', 'complete_registration'
    ];

    // データを整形
    const formatDemographicData = (data: any) => {
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
          age: item.age || null,
          gender: item.gender || null,
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

    const ageBreakdown = formatDemographicData(ageData);
    const genderBreakdown = formatDemographicData(genderData);
    const ageGenderBreakdown = formatDemographicData(ageGenderData);

    // 広告費順でソート
    ageBreakdown.sort((a: any, b: any) => b.spend - a.spend);
    genderBreakdown.sort((a: any, b: any) => b.spend - a.spend);
    ageGenderBreakdown.sort((a: any, b: any) => b.spend - a.spend);

    return NextResponse.json({
      success: true,
      data: {
        byAge: ageBreakdown,
        byGender: genderBreakdown,
        byAgeAndGender: ageGenderBreakdown
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
