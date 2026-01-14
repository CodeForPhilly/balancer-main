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
        # Remove any script tags
        sanitized = re.sub(r'<script.*?>.*?</script>', '', user_input, flags=re.IGNORECASE)
        
        # Remove any HTML tags
        sanitized = re.sub(r'<.*?>', '', sanitized)
        
        # Escape special characters
        sanitized = re.sub(r'["\'\\]', '', sanitized)

        # Limit length to prevent buffer overflow attacks
        max_length = 1000
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()
    except Exception as e:
        logger.error(f"Error sanitizing input: {e}")
        return ""

