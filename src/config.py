"""
Configuration management for the advertising integration tool
"""
import os
from typing import Optional
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)


class Config:
    """
    Manages configuration for the advertising integration tool
    """

    def __init__(self, env_file: str = ".env"):
        """
        Initialize configuration

        Args:
            env_file: Path to the .env file
        """
        # Load environment variables from .env file
        load_dotenv(env_file)
        logger.info(f"Loaded configuration from {env_file}")

        # Claude API
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")

        # Chatwork API
        self.chatwork_api_token = os.getenv("CHATWORK_API_TOKEN")
        self.chatwork_room_id = os.getenv("CHATWORK_ROOM_ID")

        # Marble.ai (if applicable)
        self.marble_api_key = os.getenv("MARBLE_API_KEY")

        # Scheduling
        self.report_day = os.getenv("REPORT_DAY", "monday").lower()
        self.report_time = os.getenv("REPORT_TIME", "09:00")

        # Validate required configuration
        self._validate()

    def _validate(self):
        """Validate that required configuration is present"""
        errors = []

        if not self.anthropic_api_key:
            errors.append("ANTHROPIC_API_KEY is not set")

        if not self.chatwork_api_token:
            errors.append("CHATWORK_API_TOKEN is not set")

        if not self.chatwork_room_id:
            errors.append("CHATWORK_ROOM_ID is not set")

        if errors:
            error_msg = "Configuration errors:\n" + "\n".join(f"  - {e}" for e in errors)
            logger.error(error_msg)
            raise ValueError(error_msg)

        logger.info("Configuration validated successfully")

    def get_schedule_info(self) -> str:
        """
        Get human-readable schedule information

        Returns:
            Schedule information string
        """
        return f"Reports scheduled for {self.report_day.capitalize()} at {self.report_time}"
