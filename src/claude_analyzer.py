"""
Claude API integration for analyzing advertising data
"""
import os
import json
from typing import Dict, List, Any
import logging
from anthropic import Anthropic

logger = logging.getLogger(__name__)


class ClaudeAnalyzer:
    """
    Analyzes advertising data using Claude AI
    """

    def __init__(self, api_key: str = None):
        """
        Initialize Claude analyzer

        Args:
            api_key: Anthropic API key (if not provided, will use ANTHROPIC_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("Anthropic API key is required")

        self.client = Anthropic(api_key=self.api_key)
        logger.info("Claude analyzer initialized")

    def analyze_ad_performance(
        self,
        ad_data: List[Dict[str, Any]],
        analysis_type: str = "weekly_summary"
    ) -> str:
        """
        Analyze advertising data and generate insights

        Args:
            ad_data: List of advertising data from different platforms
            analysis_type: Type of analysis (e.g., "weekly_summary", "optimization_suggestions")

        Returns:
            Formatted analysis report as a string
        """
        logger.info(f"Analyzing ad performance data - Type: {analysis_type}")

        # Prepare the prompt for Claude
        data_json = json.dumps(ad_data, indent=2, ensure_ascii=False)

        prompt = self._get_analysis_prompt(data_json, analysis_type)

        try:
            # Call Claude API
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            analysis_result = message.content[0].text
            logger.info("Analysis completed successfully")
            return analysis_result

        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")
            return f"分析中にエラーが発生しました: {str(e)}"

    def _get_analysis_prompt(self, data_json: str, analysis_type: str) -> str:
        """
        Generate the appropriate prompt based on analysis type

        Args:
            data_json: JSON string of advertising data
            analysis_type: Type of analysis requested

        Returns:
            Formatted prompt string
        """
        if analysis_type == "weekly_summary":
            return f"""
以下の広告運用データを分析し、日本語で週次レポートを作成してください。

【データ】
{data_json}

【レポートに含める内容】
1. 全体サマリー（総支出、総インプレッション、総クリック数、平均CTR、ROASなど）
2. プラットフォーム別のパフォーマンス比較
3. 注目すべきトレンドや変化
4. 改善提案と次週のアクションアイテム
5. 懸念事項やアラート

レポートは見やすく、Chatworkで表示されることを考慮してフォーマットしてください。
必要に応じて絵文字を使用して、重要なポイントを強調してください。
"""
        elif analysis_type == "optimization_suggestions":
            return f"""
以下の広告運用データを分析し、最適化の提案を日本語で作成してください。

【データ】
{data_json}

【提案に含める内容】
1. パフォーマンスが低いキャンペーンの特定
2. 具体的な改善アクション
3. 予算配分の最適化提案
4. クリエイティブの改善提案
5. ターゲティングの見直し提案

実行可能で具体的な提案をお願いします。
"""
        else:
            return f"""
以下の広告運用データを分析し、日本語でレポートを作成してください。

【データ】
{data_json}

データの重要なポイントと洞察を提供してください。
"""

    def generate_custom_report(
        self,
        ad_data: List[Dict[str, Any]],
        custom_prompt: str
    ) -> str:
        """
        Generate a custom report based on a user-defined prompt

        Args:
            ad_data: List of advertising data
            custom_prompt: Custom analysis prompt

        Returns:
            Analysis result as a string
        """
        logger.info("Generating custom report")

        data_json = json.dumps(ad_data, indent=2, ensure_ascii=False)

        full_prompt = f"""
{custom_prompt}

【データ】
{data_json}
"""

        try:
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ]
            )

            return message.content[0].text

        except Exception as e:
            logger.error(f"Error generating custom report: {str(e)}")
            return f"カスタムレポート生成中にエラーが発生しました: {str(e)}"
