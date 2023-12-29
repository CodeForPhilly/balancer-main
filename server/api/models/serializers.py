# Import the UserCreateSerializer from Djoser.
from djoser.serializers import UserCreateSerializer

# Import Django's function for retrieving the user model.
from django.contrib.auth import get_user_model
# Call the function to get the current active user model set in your Django project.
User = get_user_model()

# Begin defining a new class named UserCreateSerializer.
# This class inherits from the UserCreateSerializer provided by Djoser.


class UserCreateSerializer(UserCreateSerializer):

    # Define a nested Meta class inside your UserCreateSerializer.
    # This Meta class inherits from UserCreateSerializer.Meta provided by Djoser.
    class Meta(UserCreateSerializer.Meta):
        # Specify that the model to be used is the User model we retrieved earlier.
        model = User

        # Define the fields that should be included in the serialized data.
        # Here, we're including the user's id, email, first name, last name, and password.
        fields = ('id', 'email', 'first_name', 'last_name', 'password')
