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

        # Remove Medical Record Numbers (simple pattern)
        sanitized = re.sub(r'\bMRN[:\s]*\d+\b', '[Medical Record Number]', sanitized, flags=re.IGNORECASE)

        # Normalize pronouns
        sanitized = normalize_pronouns(sanitized)

        # Escape special characters
        sanitized = re.sub(r'\s+', '', sanitized)

        # Limit length to prevent buffer overflow attacks
        max_length = 5000
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()
    except Exception as e:
        logger.error(f"Error sanitizing input: {e}")
        return ""
    
def normalize_pronouns(text:str) -> str:
    """
    Normalize first and second person pronouns to third person clinical language.

    Converts patient centric pronouns to a more neutral form.
    Args:
        text (str): The input text containing pronouns.
    Returns:
        str: The text with normalized pronouns.
    """
    # Normalize first person possessives: I, me, my, mine -> the patient
    text = re.sub(r'\bMy\b', 'The patient\'s', text)
    text = re.sub(r'\bmy\b', 'the patient\'s', text)

    # First person subject: I -> the patient
    text = re.sub(r'\bI\b', 'the patient', text)

    # First person object: me -> the patient
    text = re.sub(r'\bme\b', 'the patient', text)

    # First person reflexive: myself -> the patient
    text = re.sub(r'\bmyself\b', 'the patient', text)

    # Second person: you, your -> the clinician
    text = re.sub(r'\bYour\b', 'the clinician', text)
    return text