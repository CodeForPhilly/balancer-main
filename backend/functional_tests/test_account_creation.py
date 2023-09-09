# Create your tests here.
from balancer.users.models import User


class TestAccountCreation:
    account_creation_endpoint = "/auth/users/"
    email = "tester@test.org"
    password = "mYpAsSwOrD@!dfe!!21"
    account_creation_headers = {"email": email, "password": password}

    def test_failed_account_creation_bad_email(self, transactional_db, client):
        """
        Given invalid args, we should get a 400 status code and exception content in response.json.
        """
        response = client.post(
            self.account_creation_endpoint,
            {**self.account_creation_headers, "email": "abc"},
        )
        assert response.status_code == 400
        assert "email" in response.json()

    def test_account_creation(self, transactional_db, client):
        response = client.post(
            self.account_creation_endpoint,
            {**self.account_creation_headers},
        )
        assert response.status_code == 201  # account created
        data = response.json()
        assert self.email == data["email"]
        assert (user_id := data["id"])
        assert User.objects.filter(id=user_id).exists()
