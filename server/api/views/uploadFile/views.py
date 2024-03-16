from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from .models import UploadFile
from django.core.exceptions import ValidationError


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def uploadFiles(request):
    if request.method == 'POST':
        file = request.FILES.get('file')

        # Validate input
        if not file:
            return JsonResponse({'error': 'Missing file'}, status=400)

        # Read file contents in binary mode
        file_contents = file.read()
        print(file.read())
        # Use the original file name
        file_name = file.name

        # Create an instance of the model
        upload_file = UploadFile(file_name=file_name, file=file_contents)

        # Save the instance to the database
        try:
            upload_file.full_clean()  # Validate the model instance
            upload_file.save()
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)

        # Return the GUID in the response
        return JsonResponse({'guid': str(upload_file.guid)})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
