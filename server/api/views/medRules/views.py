from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from ...models.model_medRule import MedRule
from .serializers import MedRuleSerializer  # You'll need to create this


@method_decorator(csrf_exempt, name='dispatch')
class MedRules(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Get all med rules
        med_rules = MedRule.objects.all()

        # Serialize the data
        serializer = MedRuleSerializer(med_rules, many=True)

        data = {
            'status': 'success',
            'count': len(serializer.data),
            'results': serializer.data
        }

        return Response(data, status=status.HTTP_200_OK)
