import { NextRequest, NextResponse } from 'next/server';

// 日付範囲を計算する関数
function calculateDateRanges(datePreset: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;

  switch (datePreset) {
    case 'yesterday':
      // 昨日 vs 一昨日
      currentEnd = new Date(today);
      currentEnd.setDate(currentEnd.getDate() - 1);
      currentStart = new Date(currentEnd);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      break;

    case 'last_7d':
      // 過去7日 vs 前週7日
      currentEnd = new Date(today);
      currentEnd.setDate(currentEnd.getDate() - 1);
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() - 6);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      break;

    case 'last_14d':
      // 過去14日 vs 前々週14日
      currentEnd = new Date(today);
      currentEnd.setDate(currentEnd.getDate() - 1);
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() - 13);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 13);
      break;

    case 'last_30d':
      // 過去30日 vs 前月30日
      currentEnd = new Date(today);
      currentEnd.setDate(currentEnd.getDate() - 1);
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() - 29);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 29);
      break;

    case 'this_month':
      // 今月 vs 先月
      currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
      currentEnd = new Date(today);
      currentEnd.setDate(currentEnd.getDate() - 1);

      previousStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      previousEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    case 'last_month':
      // 先月 vs 先々月
      currentStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      currentEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      previousStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      previousEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      break;

    default:
      // デフォルト: 過去7日
      currentEnd = new Date(today);
      currentEnd.setDate(currentEnd.getDate() - 1);
      currentStart = new Date(currentEnd);
      currentStart.setDate(currentStart.getDate() - 6);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return {
    current: {
      since: formatDate(currentStart),
      until: formatDate(currentEnd)
    },
    previous: {
      since: formatDate(previousStart),
      until: formatDate(previousEnd)
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, accountId, datePreset } = await request.json();

    if (!apiKey || !accountId) {
      return NextResponse.json(
        { error: 'APIキーとアカウントIDが必要です' },
        { status: 400 }
      );
    }

    const dateRanges = calculateDateRanges(datePreset || 'last_7d');

    // フィールド定義
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

    // 現在の期間のデータを取得
    const currentUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `time_range={"since":"${dateRanges.current.since}","until":"${dateRanges.current.until}"}&` +
      `level=account&` +
      `access_token=${apiKey}`;

    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      const errorData = await currentResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Meta Ads API接続に失敗しました', details: errorData },
        { status: currentResponse.status }
      );
    }

    const currentData = await currentResponse.json();

    // 前期のデータを取得
    const previousUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?` +
      `fields=${fields}&` +
      `time_range={"since":"${dateRanges.previous.since}","until":"${dateRanges.previous.until}"}&` +
      `level=account&` +
      `access_token=${apiKey}`;

    const previousResponse = await fetch(previousUrl);
    const previousData = await previousResponse.json();

    // データを整形
    const formatInsights = (data: any) => {
      if (!data.data || data.data.length === 0) {
        return null;
      }

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

      return {
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
        primaryEventType: primaryEventType,
        allConversions: allConversions,
        allCosts: allCosts,
        allValues: allValues
      };
    };

    const currentInsights = formatInsights(currentData);
    const previousInsights = formatInsights(previousData);

    if (!currentInsights) {
      return NextResponse.json({
        success: false,
        error: 'データが見つかりませんでした'
      });
    }

    // 比較データを計算
    const calculateChange = (current: number, previous: number) => {
      if (!previous || previous === 0) {
        return { value: 0, percentage: 0 };
      }
      const change = current - previous;
      const percentage = (change / previous) * 100;
      return {
        value: change,
        percentage: percentage
      };
    };

    const comparison = previousInsights ? {
      spend: calculateChange(currentInsights.spend, previousInsights.spend),
      impressions: calculateChange(currentInsights.impressions, previousInsights.impressions),
      clicks: calculateChange(currentInsights.clicks, previousInsights.clicks),
      conversions: calculateChange(currentInsights.conversions, previousInsights.conversions),
      ctr: calculateChange(currentInsights.ctr, previousInsights.ctr),
      cpm: calculateChange(currentInsights.cpm, previousInsights.cpm),
      cpc: calculateChange(currentInsights.cpc, previousInsights.cpc),
      frequency: calculateChange(currentInsights.frequency, previousInsights.frequency),
      reach: calculateChange(currentInsights.reach, previousInsights.reach),
      revenue: calculateChange(currentInsights.revenue, previousInsights.revenue),
      cpa: calculateChange(currentInsights.cpa, previousInsights.cpa),
      cvr: calculateChange(currentInsights.cvr, previousInsights.cvr)
    } : null;

    return NextResponse.json({
      success: true,
      current: {
        ...currentInsights,
        date_start: dateRanges.current.since,
        date_stop: dateRanges.current.until
      },
      previous: previousInsights ? {
        ...previousInsights,
        date_start: dateRanges.previous.since,
        date_stop: dateRanges.previous.until
      } : null,
      comparison: comparison
    });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: String(error) },
      { status: 500 }
    );
  }
}
