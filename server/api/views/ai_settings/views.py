from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AI_Settings
from .serializers import AISettingsSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def settings_view(request):
    if request.method == 'GET':
        settings = AI_Settings.objects.all()
        serializer = AISettingsSerializer(settings, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = AISettingsSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(ModifiedByUser=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
