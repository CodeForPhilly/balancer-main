import os
from dotenv import load_dotenv
from django.core.management import execute_from_command_line

dotenv_path = os.path.join(os.path.dirname(__file__), '../config/env/.env.dev')
load_dotenv(dotenv_path)

execute_from_command_line(["manage.py", "startapp", "appname"])