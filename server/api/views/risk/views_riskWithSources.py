from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.views.listMeds.models import Medication
from api.models.model_medRule import MedRule, MedRuleSource
from api.services.prompt_services import PromptTemplates
import openai
import os


class RiskWithSourcesView(APIView):
    def post(self, request):
        openai.api_key = os.environ.get("OPENAI_API_KEY")

        drug = request.data.get("drug")
        if not drug:
            return Response({"error": "Drug not found. Request must include 'drug'."}, status=status.HTTP_400_BAD_REQUEST)

        source = request.data.get("source")
        if source not in ["include", "diagnosis"]:
            return Response({"error": "Source must be either 'include' or 'diagnosis'."}, status=status.HTTP_400_BAD_REQUEST)

        # Handle diagnosis source by linking to medrules
        if source == "diagnosis":
            return self._handle_diagnosis_source(drug)

        if source == "include":
            return self._handle_include_source(drug)

        # Handle include source (existing logic)
        try:
            med = Medication.objects.get(name=drug)
            benefits = [f'- {b.strip()}' for b in med.benefits.split(',')]
            risks = [f'- {r.strip()}' for r in med.risks.split(',')]
            return Response({
                'benefits': benefits,
                'risks': risks
            })

        except Medication.DoesNotExist:
            prompt = PromptTemplates.get_risk_basic_medication_prompt(drug)

            try:
                ai_response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "system", "content": prompt}]
                )
            except Exception as e:
                return Response({"error": f"OpenAI request failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            content = ai_response['choices'][0]['message']['content']

            if '!!!benefits!!!' not in content or '!!!risks!!!' not in content:
                return Response({"error": "Unexpected format in OpenAI response."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            benefits_raw = content.split('!!!risks!!!')[0].replace(
                '!!!benefits!!!', '').strip()
            risks_raw = content.split('!!!risks!!!')[1].strip()

            benefits = [line.strip()
                        for line in benefits_raw.split('\n') if line.strip()]
            risks = [line.strip()
                     for line in risks_raw.split('\n') if line.strip()]

            return Response({
                'benefits': benefits,
                'risks': risks
            })

    def _handle_include_source(self, drug):
        """Handle include source by looking up medrules for the medication"""
        try:
            # Get the medication
            medication = Medication.objects.get(name=drug)

            print(
                f"Found medication '{medication.name}' for '{drug}' with ID {medication.id}")

            # Find medrules that include this medication
            medrule_ids = MedRuleSource.objects.filter(
                medication=medication,
                medrule__rule_type='INCLUDE'
            ).values_list('medrule_id', flat=True).distinct()

            medrules = MedRule.objects.filter(id__in=medrule_ids)
            print(f"Found {medrules.count()} medrules for {drug}")
            benefits = []
            risks = []
            sources_info = []

            # Extract benefits and sources
            for medrule in medrules:
                if medrule.explanation:
                    benefits.append(f"- {medrule.explanation}")

                # Get associated sources through MedRuleSource
                medrule_sources = MedRuleSource.objects.filter(
                    medrule=medrule,
                    medication=medication
                )
                print(
                    f"Found {medrule_sources.count()} sources for medrule {medrule.id}")

                for source_link in medrule_sources:
                    embedding = source_link.embedding

                    source_info = {
                        'title': getattr(embedding, 'title', 'Unknown source'),
                        'publication': getattr(embedding, 'publication', ''),
                        'text': getattr(embedding, 'text', ''),
                        'rule_type': medrule.rule_type,
                        'history_type': medrule.history_type,
                        # Add link data for PDF navigation
                        'upload_fileid': getattr(embedding, 'upload_file_id', None),
                        'page': getattr(embedding, 'page_num', None),
                        'link_url': self._build_pdf_link(embedding)
                    }

                    sources_info.append(source_info)

            # Check EXCLUDE rules for risks
            exclude_rules = MedRule.objects.filter(
                medications=medication,
                rule_type='EXCLUDE'
            )

            for rule in exclude_rules:
                if rule.explanation:
                    risks.append(f"- {rule.explanation}")

            if not benefits and not risks:
                basic_benefits = [
                    f'- {b.strip()}' for b in medication.benefits.split(',')]
                basic_risks = [
                    f'- {r.strip()}' for r in medication.risks.split(',')]

                return Response({
                    'benefits': basic_benefits,
                    'risks': basic_risks,
                    'source': 'include',
                    'note': 'No specific medrule sources found, showing general medication information'
                })

            return Response({
                'benefits': [f'- {b.strip()}' for b in medication.benefits.split(',')],
                'risks': risks if risks else [f'- {r.strip()}' for r in medication.risks.split(',')],
                'source': 'include',
                'sources': sources_info,
                'medrules_found': len(medrules) + len(exclude_rules)
            })

        except Medication.DoesNotExist:
            return Response({"error": f"Medication '{drug}' not found."}, status=status.HTTP_404_NOT_FOUND)

    def _handle_diagnosis_source(self, drug):
        """Handle diagnosis source by looking up medrules for the medication"""
        try:
            # Get the medication
            medication = Medication.objects.get(name=drug)

            # Find medrules that include this medication
            medrules = MedRule.objects.filter(
                medications=medication,
                rule_type='INCLUDE'
            )

            benefits = []
            risks = []
            sources_info = []

            # Extract information from medrules and their sources
            for medrule in medrules:
                if medrule.explanation:
                    benefits.append(f"- {medrule.explanation}")

                # Get associated sources through MedRuleSource
                medrule_sources = MedRuleSource.objects.filter(
                    medrule=medrule,
                    medication=medication
                )

                for source_link in medrule_sources:
                    embedding = source_link.embedding
                    source_info = {
                        'title': getattr(embedding, 'title', 'Unknown source'),
                        'publication': getattr(embedding, 'publication', ''),
                        'text': getattr(embedding, 'text', ''),
                        'rule_type': medrule.rule_type,
                        'history_type': medrule.history_type,
                        # Add link data for PDF navigation
                        'guid': getattr(embedding, 'guid', None),
                        'page': getattr(embedding, 'page_num', None),
                        'link_url': self._build_pdf_link(embedding)
                    }
                    sources_info.append(source_info)

            # Also check for exclude rules (risks)
            exclude_rules = MedRule.objects.filter(
                medications=medication,
                rule_type='EXCLUDE'
            )

            for rule in exclude_rules:
                if rule.explanation:
                    risks.append(f"- {rule.explanation}")

            # If no medrule data found, fall back to basic medication data
            if not benefits and not risks:
                basic_benefits = [
                    f'- {b.strip()}' for b in medication.benefits.split(',')]
                basic_risks = [
                    f'- {r.strip()}' for r in medication.risks.split(',')]

                return Response({
                    'benefits': basic_benefits,
                    'risks': basic_risks,
                    'source': 'diagnosis',
                    'note': 'No specific medrule sources found, showing general medication information'
                })

            return Response({
                'benefits': benefits if benefits else [f'- {b.strip()}' for b in medication.benefits.split(',')],
                'risks': risks if risks else [f'- {r.strip()}' for r in medication.risks.split(',')],
                'source': 'diagnosis',
                'sources': sources_info,
                'medrules_found': len(medrules) + len(exclude_rules)
            })

        except Medication.DoesNotExist:
            # If medication not in database, use AI fallback with diagnosis context
            return self._get_ai_response_for_diagnosis(drug)

    def _build_pdf_link(self, embedding):
        """Build the PDF viewer link URL by getting the document GUID from UploadFile"""
        try:
            # Get the upload_fileid from the embedding
            upload_fileid = getattr(embedding, 'upload_file_id', None)
            page = getattr(embedding, 'page_num', None)

            if not upload_fileid:
                return None

            from api.views.uploadFile.models import UploadFile

            # Get the UploadFile record to get the document GUID
            upload_file = UploadFile.objects.get(id=upload_fileid)
            document_guid = upload_file.guid

            if document_guid:
                base_url = "/drugsummary"
                if page:
                    return f"{base_url}?guid={document_guid}&page={page}"
                else:
                    return f"{base_url}?guid={document_guid}"

        except Exception as e:
            print(f"Error building PDF link: {e}")
            return None

        return None

    def _get_ai_response_for_diagnosis(self, drug):
        """Get AI response with diagnosis-specific context"""
        prompt = PromptTemplates.get_risk_diagnosis_medication_prompt(drug)

        try:
            ai_response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": prompt}]
            )
        except Exception as e:
            return Response({"error": f"OpenAI request failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        content = ai_response['choices'][0]['message']['content']

        if '!!!benefits!!!' not in content or '!!!risks!!!' not in content:
            return Response({"error": "Unexpected format in OpenAI response."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        benefits_raw = content.split('!!!risks!!!')[0].replace(
            '!!!benefits!!!', '').strip()
        risks_raw = content.split('!!!risks!!!')[1].strip()

        benefits = [line.strip()
                    for line in benefits_raw.split('\n') if line.strip()]
        risks = [line.strip()
                 for line in risks_raw.split('\n') if line.strip()]

        return Response({
            'benefits': benefits,
            'risks': risks,
            'source': 'diagnosis',
            'note': 'Generated from AI with diagnosis context - medication not found in database'
        })
