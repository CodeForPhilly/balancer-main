from django.test import TestCase, Client
from unittest.mock import patch
import json
class ChatGPTViewTest(TestCase):
 
 def setUp(self):
        self.client = Client()
