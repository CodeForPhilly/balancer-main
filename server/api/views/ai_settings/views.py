from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AI_Settings
from .serializers import AISettingsSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def store_settings(request):
    serializer = AISettingsSerializer(
        data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(ModifiedByUser=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
