import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, accountId, days = 7 } = await request.json();

    if (!apiKey || !accountId) {
      return NextResponse.json(
        { error: 'APIキーとアカウントIDが必要です' },
        { status: 400 }
      );
    }

    // 日別トレンドのための日付範囲を計算
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1); // 昨日まで

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1)); // 過去N日

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Meta Ads Graph APIから日別インサイトデータを取得
    const fields = [
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
      'reach',
      'date_start',
      'date_stop'
    ].join(',');

    const url = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `time_range={"since":"${formatDate(startDate)}","until":"${formatDate(endDate)}"}&` +
      `level=account&` +
      `time_increment=1&` + // 日別データ
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

      const formattedTrends = data.data.map((day: any) => {
        // 標準イベントを取得
        const allConversions: any = {};
        const allCosts: any = {};
        const allValues: any = {};

        if (day.actions) {
          day.actions.forEach((action: any) => {
            allConversions[action.action_type] = parseFloat(action.value);
          });
        }

        if (day.cost_per_action_type) {
          day.cost_per_action_type.forEach((cost: any) => {
            allCosts[cost.action_type] = parseFloat(cost.value);
          });
        }

        if (day.action_values) {
          day.action_values.forEach((value: any) => {
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
          cpa = parseFloat(day.spend || '0') / conversions;
        }

        return {
          date: day.date_start,
          spend: parseFloat(day.spend || '0'),
          impressions: parseInt(day.impressions || '0'),
          clicks: parseInt(day.clicks || '0'),
          conversions: conversions,
          ctr: parseFloat(day.ctr || '0'),
          cpm: parseFloat(day.cpm || '0'),
          cpc: parseFloat(day.cpc || '0'),
          reach: parseInt(day.reach || '0'),
          frequency: parseFloat(day.frequency || '0'),
          cpa: cpa,
          revenue: revenue,
          cvr: conversions > 0 && day.clicks ? (conversions / parseInt(day.clicks)) * 100 : 0
        };
      });

      return NextResponse.json({
        success: true,
        data: formattedTrends
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
