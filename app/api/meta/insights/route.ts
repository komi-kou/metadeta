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
      'cost_per_action_type'
    ].join(',');

    const url = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `date_preset=${datePreset || 'last_7d'}&` +
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

      // actionsからコンバージョンを抽出
      const conversions = insights.actions?.find(
        (action: any) => action.action_type === 'offsite_conversion.fb_pixel_purchase'
      )?.value || '0';

      // action_valuesから売上を抽出
      const revenue = insights.action_values?.find(
        (value: any) => value.action_type === 'offsite_conversion.fb_pixel_purchase'
      )?.value || '0';

      // cost_per_action_typeからCPAを抽出
      const cpa = insights.cost_per_action_type?.find(
        (cost: any) => cost.action_type === 'offsite_conversion.fb_pixel_purchase'
      )?.value || '0';

      const formattedData = {
        spend: parseFloat(insights.spend || '0'),
        impressions: parseInt(insights.impressions || '0'),
        clicks: parseInt(insights.clicks || '0'),
        conversions: parseFloat(conversions),
        ctr: parseFloat(insights.ctr || '0'),
        cpm: parseFloat(insights.cpm || '0'),
        cpc: parseFloat(insights.cpc || '0'),
        frequency: parseFloat(insights.frequency || '0'),
        reach: parseInt(insights.reach || '0'),
        revenue: parseFloat(revenue),
        cpa: parseFloat(cpa),
        roas: parseFloat(revenue) / parseFloat(insights.spend || '1'),
        cvr: (parseFloat(conversions) / parseInt(insights.clicks || '1')) * 100,
        date_start: insights.date_start,
        date_stop: insights.date_stop
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
