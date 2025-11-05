"""
Scheduling functionality for weekly reports
"""
import schedule
import time
import logging
from datetime import datetime
from typing import Callable

logger = logging.getLogger(__name__)


class ReportScheduler:
    """
    Handles scheduling of weekly advertising reports
    """

    def __init__(self):
        """Initialize the scheduler"""
        self.jobs = []
        logger.info("Report scheduler initialized")

    def schedule_weekly_report(
        self,
        report_function: Callable,
        day: str = "monday",
        time_str: str = "09:00"
    ):
        """
        Schedule a weekly report

        Args:
            report_function: Function to call for generating and sending the report
            day: Day of the week (e.g., "monday", "tuesday", etc.)
            time_str: Time in HH:MM format (e.g., "09:00")
        """
        day_map = {
            "monday": schedule.every().monday,
            "tuesday": schedule.every().tuesday,
            "wednesday": schedule.every().wednesday,
            "thursday": schedule.every().thursday,
            "friday": schedule.every().friday,
            "saturday": schedule.every().saturday,
            "sunday": schedule.every().sunday
        }

        day_lower = day.lower()
        if day_lower not in day_map:
            logger.error(f"Invalid day: {day}. Using monday as default.")
            day_lower = "monday"

        # Schedule the job
        job = day_map[day_lower].at(time_str).do(report_function)
        self.jobs.append(job)

        logger.info(f"Scheduled weekly report for {day} at {time_str}")

    def run_now(self, report_function: Callable):
        """
        Run the report generation immediately (for testing)

        Args:
            report_function: Function to call for generating and sending the report
        """
        logger.info("Running report generation immediately")
        try:
            report_function()
            logger.info("Report generation completed successfully")
        except Exception as e:
            logger.error(f"Error running report: {str(e)}")

    def start(self, run_pending_only: bool = False):
        """
        Start the scheduler loop

        Args:
            run_pending_only: If True, only run pending jobs once and exit
        """
        if run_pending_only:
            logger.info("Running pending jobs once...")
            schedule.run_pending()
            return

        logger.info("Starting scheduler loop...")
        logger.info(f"Active jobs: {len(self.jobs)}")

        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def clear_all_jobs(self):
        """Clear all scheduled jobs"""
        schedule.clear()
        self.jobs = []
        logger.info("All scheduled jobs cleared")

    def get_next_run_time(self) -> str:
        """
        Get the next scheduled run time

        Returns:
            String representation of the next run time
        """
        if not self.jobs:
            return "No jobs scheduled"

        next_run = min(job.next_run for job in self.jobs if job.next_run)
        return next_run.strftime("%Y-%m-%d %H:%M:%S")
