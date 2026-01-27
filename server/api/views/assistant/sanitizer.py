import re
import logging

logger = logging.getLogger(__name__)
def sanitize_input(user_input:str) -> str:
    """
    Sanitize user input to prevent injection attacks and remove unwanted characters.
    
    Args:
        user_input (str): The raw input string from the user.
        
    Returns:
        str: The sanitized input string.
    """
    try:
        sanitized = user_input
        
        # Remove any style tags
        sanitized = re.sub(r'<style.*?>.*?</style>', '', sanitized, flags=re.IGNORECASE)

        # Remove any HTML/script tags
        sanitized = re.sub(r'<.*?>', '', sanitized)

        # Remove Phone Numbers
        sanitized = re.sub(r'\+?\d[\d -]{8,}\d', '[Phone Number]', sanitized)

        # Remove Email Addresses
        sanitized = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[Email Address]', sanitized)

        # Escape special characters
        sanitized = re.sub(r'["\'\\]', '', sanitized)

        # Limit length to prevent buffer overflow attacks
        max_length = 5000
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()
    except Exception as e:
        logger.error(f"Error sanitizing input: {e}")
        return ""

