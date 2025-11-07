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

    // Meta Ads Graph APIからインサイトデータを取得
    // date_preset: last_7d, last_14d, last_30d, this_month, last_month など
    const fields = [
      'spend',
      'impressions',
      'clicks',
      'conversions',
      'ctr',
      'cpm',
      'cpc',
      'frequency',
      'reach',
      'actions',
      'action_values',
      'cost_per_action_type',
      'date_start',
      'date_stop'
    ].join(',');

    const url = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
      `level=account&` +
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
      const insights = data.data[0];

      // 標準イベントの優先順位リスト
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
        'view_content',
        'search',
        'add_to_wishlist',
        'contact'
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
      let revenue = 0;
      let cpa = 0;
      let primaryEventType = '';

      for (const eventType of standardEvents) {
        if (allConversions[eventType] && allConversions[eventType] > 0) {
          conversions = allConversions[eventType];
          cpa = allCosts[eventType] || 0;
          revenue = allValues[eventType] || 0;
          primaryEventType = eventType;
          break;
        }
      }

      // CPAが取得できない場合は計算
      if (!cpa && conversions > 0) {
        cpa = parseFloat(insights.spend || '0') / conversions;
      }

      const formattedData = {
        spend: parseFloat(insights.spend || '0'),
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        conversions: conversions,
        ctr: parseFloat(insights.ctr || '0'),
        cpm: parseFloat(insights.cpm || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        frequency: parseFloat(insights.frequency || '0'),
        reach: parseInt(insights.reach || '0'),
        revenue: revenue,
        cpa: cpa,
        cvr: conversions > 0 && insights.clicks ? (conversions / parseInt(insights.clicks)) * 100 : 0,
        date_start: insights.date_start,
        date_stop: insights.date_stop,
        primaryEventType: primaryEventType,
        // すべての標準イベントのコンバージョンデータ
        allConversions: allConversions,
        allCosts: allCosts,
        allValues: allValues,
        // デバッグ用の生データも含める
        raw_actions: insights.actions || [],
        raw_action_values: insights.action_values || [],
        raw_cost_per_action: insights.cost_per_action_type || []
      };

      return NextResponse.json({
        success: true,
        data: formattedData,
        raw: insights // デバッグ用に生データも返す
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'データが見つかりませんでした',
        data: null
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
