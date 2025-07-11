from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AI_PromptStorage
from .serializers import AI_PromptStorageSerializer


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def store_prompt(request):
    print(request.user)
    data = request.data.copy() # noqa: F841
    print(request.user)
    serializer = AI_PromptStorageSerializer(
        data=request.data, context={'request': request})

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_all_prompts(request):
    """
    A view to get all prompts stored in the database.
    """
    if request.method == 'GET':
        prompts = AI_PromptStorage.objects.all()
        serializer = AI_PromptStorageSerializer(prompts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
