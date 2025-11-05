"""
Chatwork API integration for sending notifications
"""
import os
import requests
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)


class ChatworkNotifier:
    """
    Sends notifications to Chatwork rooms
    """

    BASE_URL = "https://api.chatwork.com/v2"

    def __init__(self, api_token: str = None, room_id: str = None):
        """
        Initialize Chatwork notifier

        Args:
            api_token: Chatwork API token (if not provided, will use CHATWORK_API_TOKEN env var)
            room_id: Default Chatwork room ID (if not provided, will use CHATWORK_ROOM_ID env var)
        """
        self.api_token = api_token or os.getenv("CHATWORK_API_TOKEN")
        self.default_room_id = room_id or os.getenv("CHATWORK_ROOM_ID")

        if not self.api_token:
            raise ValueError("Chatwork API token is required")

        self.headers = {
            "X-ChatWorkToken": self.api_token
        }

        logger.info("Chatwork notifier initialized")

    def send_message(
        self,
        message: str,
        room_id: str = None,
        mention_all: bool = False,
        self_unread: bool = False
    ) -> bool:
        """
        Send a message to a Chatwork room

        Args:
            message: Message content to send
            room_id: Chatwork room ID (uses default if not specified)
            mention_all: If True, mentions all members in the room
            self_unread: If True, marks your own message as unread

        Returns:
            True if message was sent successfully, False otherwise
        """
        target_room_id = room_id or self.default_room_id

        if not target_room_id:
            logger.error("No room ID specified")
            return False

        # Format message with mention if requested
        formatted_message = message
        if mention_all:
            formatted_message = "[toall]\n" + message

        url = f"{self.BASE_URL}/rooms/{target_room_id}/messages"
        data = {
            "body": formatted_message
        }

        if self_unread:
            data["self_unread"] = 1

        try:
            response = requests.post(url, headers=self.headers, data=data)
            response.raise_for_status()

            logger.info(f"Message sent successfully to room {target_room_id}")
            return True

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send message: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            return False

    def send_weekly_report(
        self,
        report_content: str,
        room_id: str = None,
        mention_all: bool = True
    ) -> bool:
        """
        Send a formatted weekly advertising report to Chatwork

        Args:
            report_content: The analysis report content
            room_id: Chatwork room ID (uses default if not specified)
            mention_all: If True, mentions all members

        Returns:
            True if report was sent successfully, False otherwise
        """
        # Format the report with a header
        formatted_report = f"""[info][title]📊 週次広告運用レポート[/title]{report_content}[/info]"""

        logger.info("Sending weekly report to Chatwork")
        return self.send_message(formatted_report, room_id, mention_all)

    def send_alert(
        self,
        alert_message: str,
        room_id: str = None,
        mention_all: bool = True
    ) -> bool:
        """
        Send an alert message to Chatwork

        Args:
            alert_message: Alert message content
            room_id: Chatwork room ID (uses default if not specified)
            mention_all: If True, mentions all members

        Returns:
            True if alert was sent successfully, False otherwise
        """
        formatted_alert = f"[info][title]⚠️ アラート[/title]{alert_message}[/info]"

        logger.info("Sending alert to Chatwork")
        return self.send_message(formatted_alert, room_id, mention_all)

    def get_room_info(self, room_id: str = None) -> Optional[dict]:
        """
        Get information about a Chatwork room

        Args:
            room_id: Chatwork room ID (uses default if not specified)

        Returns:
            Dictionary with room information, or None if failed
        """
        target_room_id = room_id or self.default_room_id

        if not target_room_id:
            logger.error("No room ID specified")
            return None

        url = f"{self.BASE_URL}/rooms/{target_room_id}"

        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get room info: {str(e)}")
            return None

    def test_connection(self) -> bool:
        """
        Test the Chatwork API connection

        Returns:
            True if connection is successful, False otherwise
        """
        url = f"{self.BASE_URL}/me"

        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()

            user_info = response.json()
            logger.info(f"Connection successful. User: {user_info.get('name')}")
            return True

        except requests.exceptions.RequestException as e:
            logger.error(f"Connection test failed: {str(e)}")
            return False
