import logging
from app.core.config import get_settings

logger = logging.getLogger("communitypulse")
settings = get_settings()

class NotificationService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.twilio_sid = settings.TWILIO_ACCOUNT_SID

    async def dispatch_in_app_notification(self, user_id: str, title: str, body: str) -> bool:
        logger.info(f"[In-App Notification] Sent to {user_id} - Title: {title} | Body: {body}")
        return True

    async def dispatch_email(self, email: str, subject: str, message: str) -> bool:
        logger.info(f"[Email SMTP Service] Sent to {email} - Subject: {subject}")
        return True

    async def dispatch_sms(self, phone: str, message: str) -> bool:
        logger.info(f"[Twilio SMS Service] Sent to {phone} - Message: {message}")
        return True
