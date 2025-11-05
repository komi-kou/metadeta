"""
Main orchestration for the advertising integration tool
"""
import sys
import logging
import argparse
from datetime import datetime

from config import Config
from marble_client import MarbleClient
from claude_analyzer import ClaudeAnalyzer
from chatwork_notifier import ChatworkNotifier
from scheduler import ReportScheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ad_integration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class AdIntegrationOrchestrator:
    """
    Main orchestrator for advertising integration workflow
    """

    def __init__(self, config: Config):
        """
        Initialize the orchestrator

        Args:
            config: Configuration object
        """
        self.config = config

        # Initialize components
        self.marble_client = MarbleClient()
        self.claude_analyzer = ClaudeAnalyzer(api_key=config.anthropic_api_key)
        self.chatwork_notifier = ChatworkNotifier(
            api_token=config.chatwork_api_token,
            room_id=config.chatwork_room_id
        )
        self.scheduler = ReportScheduler()

        logger.info("Ad Integration Orchestrator initialized")

    def generate_and_send_report(self, date_range: str = "last_7_days"):
        """
        Main workflow: Fetch data, analyze, and send to Chatwork

        Args:
            date_range: Date range for the report
        """
        try:
            logger.info(f"Starting report generation for date range: {date_range}")

            # Step 1: Fetch advertising data from Marble.ai
            logger.info("Fetching advertising data...")
            ad_data = self.marble_client.get_all_platforms_data(date_range=date_range)

            # Step 2: Analyze data with Claude
            logger.info("Analyzing data with Claude AI...")
            analysis = self.claude_analyzer.analyze_ad_performance(
                ad_data=ad_data,
                analysis_type="weekly_summary"
            )

            # Step 3: Send to Chatwork
            logger.info("Sending report to Chatwork...")
            success = self.chatwork_notifier.send_weekly_report(
                report_content=analysis,
                mention_all=True
            )

            if success:
                logger.info("Report sent successfully!")
            else:
                logger.error("Failed to send report to Chatwork")

        except Exception as e:
            logger.error(f"Error in report generation workflow: {str(e)}")
            # Try to send an error notification
            try:
                self.chatwork_notifier.send_alert(
                    f"週次レポートの生成中にエラーが発生しました:\n{str(e)}"
                )
            except:
                pass

    def test_connections(self):
        """Test all API connections"""
        logger.info("Testing API connections...")

        # Test Chatwork
        logger.info("Testing Chatwork connection...")
        chatwork_ok = self.chatwork_notifier.test_connection()

        if chatwork_ok:
            logger.info("✓ Chatwork connection successful")
        else:
            logger.error("✗ Chatwork connection failed")

        # Test room info
        room_info = self.chatwork_notifier.get_room_info()
        if room_info:
            logger.info(f"✓ Connected to room: {room_info.get('name')}")
        else:
            logger.error("✗ Could not get room info")

        logger.info(f"Schedule: {self.config.get_schedule_info()}")

        return chatwork_ok

    def schedule_weekly_reports(self):
        """Schedule weekly reports"""
        logger.info("Scheduling weekly reports...")

        self.scheduler.schedule_weekly_report(
            report_function=self.generate_and_send_report,
            day=self.config.report_day,
            time_str=self.config.report_time
        )

        next_run = self.scheduler.get_next_run_time()
        logger.info(f"Next scheduled run: {next_run}")

        # Start the scheduler
        self.scheduler.start()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Advertising Integration Tool - Claude + Marble.ai + Chatwork"
    )

    parser.add_argument(
        "--mode",
        choices=["schedule", "run-now", "test"],
        default="schedule",
        help="Operation mode: schedule (default), run-now, or test"
    )

    parser.add_argument(
        "--date-range",
        default="last_7_days",
        help="Date range for reports (default: last_7_days)"
    )

    args = parser.parse_args()

    try:
        # Load configuration
        config = Config()

        # Initialize orchestrator
        orchestrator = AdIntegrationOrchestrator(config)

        if args.mode == "test":
            # Test mode: Check all connections
            logger.info("=== TEST MODE ===")
            orchestrator.test_connections()

        elif args.mode == "run-now":
            # Run once immediately
            logger.info("=== RUN NOW MODE ===")
            orchestrator.generate_and_send_report(date_range=args.date_range)

        elif args.mode == "schedule":
            # Schedule mode: Run on schedule
            logger.info("=== SCHEDULE MODE ===")
            logger.info(config.get_schedule_info())

            # Test connections first
            if not orchestrator.test_connections():
                logger.error("Connection test failed. Please check your configuration.")
                sys.exit(1)

            # Start scheduler
            orchestrator.schedule_weekly_reports()

    except ValueError as e:
        logger.error(f"Configuration error: {str(e)}")
        logger.error("Please check your .env file and ensure all required variables are set.")
        sys.exit(1)

    except KeyboardInterrupt:
        logger.info("Shutting down...")
        sys.exit(0)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
