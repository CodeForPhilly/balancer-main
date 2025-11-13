from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.views.listMeds.models import Medication
from api.models.model_medRule import MedRule, MedRuleSource
import openai
import os


class RiskWithSourcesView(APIView):
    def post(self, request):
        openai.api_key = os.environ.get("OPENAI_API_KEY")

        drug = request.data.get("drug")
        if not drug:
            return Response({"error": "Drug not found. Request must include 'drug'."}, status=status.HTTP_400_BAD_REQUEST)
        source = request.data.get("source")
        print(f"Requested source: {source}")

        # If source is provided, validate it
        valid_sources = ["include", "diagnosis", "diagnosis_depressed", "diagnosis_manic", "diagnosis_hypomanic", "diagnosis_euthymic"]
        if source and source not in valid_sources:
            return Response({"error": f"Source must be one of: {', '.join(valid_sources)}."}, status=status.HTTP_400_BAD_REQUEST)

        # If no source is provided, return all sources
        if not source:
            try:
                return self._handle_all_sources(drug)
            except Exception as e:
                print(f"Error in _handle_all_sources: {str(e)}")
                return Response({"error": f"Failed to retrieve all sources data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Handle diagnosis source by linking to medrules
        if source in ["diagnosis", "diagnosis_depressed", "diagnosis_manic", "diagnosis_hypomanic", "diagnosis_euthymic"]:
            try:
                return self._handle_diagnosis_source(drug, source)
            except Exception as e:
                print(f"Error in _handle_diagnosis_source: {str(e)}")
                return Response({"error": f"Failed to retrieve diagnosis data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if source == "include":
            try:
                return self._handle_include_source(drug)
            except Exception as e:
                print(f"Error in _handle_include_source: {str(e)}")
                return Response({"error": f"Failed to retrieve include data: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            prompt = (
                f"You are to provide a concise list of 5 key benefits and 5 key risks "
                f"for the medication suggested when taking it for Bipolar. Each point should be short, "
                f"clear and be kept under 10 words. Begin the benefits section with !!!benefits!!! and "
                f"the risks section with !!!risk!!!. Please provide this information for the medication: {drug}."
            )

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

                    # Get filename from upload_file if available
                    filename = None
                    if hasattr(embedding, 'upload_file') and embedding.upload_file:
                        filename = embedding.upload_file.file_name

                    source_info = {
                        'filename': filename,
                        'title': getattr(embedding, 'title', None),
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
                    'sources': 'include',
                    'note': 'No specific medrule sources found, showing general medication information'
                })

            return Response({
                'benefits': [f'- {b.strip()}' for b in medication.benefits.split(',')],
                'risks': risks if risks else [f'- {r.strip()}' for r in medication.risks.split(',')],
                'sources': sources_info,
                'medrules_found': len(medrules) + len(exclude_rules)
            })

        except Medication.DoesNotExist:
            return Response({"error": f"Medication '{drug}' not found."}, status=status.HTTP_404_NOT_FOUND)

    def _handle_diagnosis_source(self, drug, source):
        """Handle diagnosis source by looking up medrules for the medication"""
        try:
            # Get the medication
            medication = Medication.objects.get(name=drug)

            print(
                f"Found medication '{medication.name}' for '{drug}' with ID {medication.id}")

            # Map source parameter to history_type value
            source_to_history_type = {
                "diagnosis_depressed": "DIAGNOSIS_DEPRESSED",
                "diagnosis_manic": "DIAGNOSIS_MANIC",
                "diagnosis_hypomanic": "DIAGNOSIS_HYPOMANIC",
                "diagnosis_euthymic": "DIAGNOSIS_EUTHYMIC",
                "diagnosis": "DIAGNOSIS_DEPRESSED"  # default to depressed for backward compatibility
            }

            history_type = source_to_history_type.get(source, "DIAGNOSIS_DEPRESSED")
            print(f"Using history_type: {history_type} for source: {source}")

            # Find medrules that include this medication with the specified history type
            medrule_ids = MedRuleSource.objects.filter(
                medication=medication,
                medrule__history_type=history_type
            ).values_list('medrule_id', flat=True).distinct()

            print(medrule_ids)

            medrules = MedRule.objects.filter(id__in=medrule_ids)
            print(f"Found {medrules.count()} medrules for {drug}")
            benefits = []
            risks = []
            sources_info = []

            # Extract benefits and sources
            for medrule in medrules:
                print(
                    f"Medrule {medrule.id}: rule_type={medrule.rule_type}, explanation='{medrule.explanation}'")

                # Only add INCLUDE rules to benefits
                if medrule.rule_type == 'INCLUDE' and medrule.explanation:
                    benefits.append(f"- {medrule.explanation}")
                elif medrule.rule_type == 'EXCLUDE' and medrule.explanation:
                    # Add EXCLUDE rules to risks
                    risks.append(f"- {medrule.explanation}")
                else:
                    print(
                        f"Medrule {medrule.id} has no explanation or is not INCLUDE/EXCLUDE, skipping")

                # Get associated sources through MedRuleSource
                medrule_sources = MedRuleSource.objects.filter(
                    medrule=medrule,
                    medication=medication
                )
                print(
                    f"Found {medrule_sources.count()} sources for medrule {medrule.id}")

                for source_link in medrule_sources:
                    embedding = source_link.embedding

                    # Get filename from upload_file if available
                    filename = None
                    if hasattr(embedding, 'upload_file') and embedding.upload_file:
                        filename = embedding.upload_file.file_name

                    source_info = {
                        'filename': filename,
                        'title': getattr(embedding, 'title', None),
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

            # Check EXCLUDE rules for risks with the specified history type
            exclude_rules = MedRule.objects.filter(
                medications=medication,
                rule_type='EXCLUDE',
                history_type=history_type
            )
            print(f"Found {exclude_rules.count()} exclude rules for {drug}")

            for rule in exclude_rules:
                print(
                    f"Exclude rule {rule.id}: explanation='{rule.explanation}'")
                if rule.explanation:
                    risks.append(f"- {rule.explanation}")
                else:
                    print(
                        f"Exclude rule {rule.id} has no explanation, skipping risks")

            print(
                f"Total benefits collected: {len(benefits)}, Total risks collected: {len(risks)}")
            if not benefits and not risks:
                basic_benefits = [
                    f'- {b.strip()}' for b in medication.benefits.split(',')]
                basic_risks = [
                    f'- {r.strip()}' for r in medication.risks.split(',')]

                return Response({
                    'benefits': basic_benefits,
                    'risks': basic_risks,
                    'sources': sources_info,
                    'note': 'No specific medrule sources found, showing general medication information'
                })

            return Response({
                'benefits': benefits if benefits else [f'- {b.strip()}' for b in medication.benefits.split(',')],
                'risks': risks if risks else [f'- {r.strip()}' for r in medication.risks.split(',')],
                'sources': sources_info,
                'medrules_found': len(medrules) + len(exclude_rules)
            })

        except Medication.DoesNotExist:
            return Response({"error": f"Medication '{drug}' not found."}, status=status.HTTP_404_NOT_FOUND)

    def _handle_all_sources(self, drug):
        """Handle request with no source specified - return all sources"""
        try:
            # Get the medication
            medication = Medication.objects.get(name=drug)

            print(
                f"Found medication '{medication.name}' for '{drug}' with ID {medication.id}")

            # Find all medrules that are related to this medication via MedRuleSource
            medrule_ids = MedRuleSource.objects.filter(
                medication=medication
            ).values_list('medrule_id', flat=True).distinct()

            medrules = MedRule.objects.filter(id__in=medrule_ids)
            print(
                f"Found {medrules.count()} total medrules for {drug} across all sources")

            benefits = []
            risks = []
            sources_info = []

            # Extract benefits, risks, and sources from all medrules
            for medrule in medrules:
                print(
                    f"Medrule {medrule.id}: rule_type={medrule.rule_type}, history_type={medrule.history_type}")

                # Add INCLUDE rules to benefits
                if medrule.rule_type == 'INCLUDE' and medrule.explanation:
                    benefits.append(f"- {medrule.explanation}")
                # Add EXCLUDE rules to risks
                elif medrule.rule_type == 'EXCLUDE' and medrule.explanation:
                    risks.append(f"- {medrule.explanation}")

                # Get associated sources through MedRuleSource
                medrule_sources = MedRuleSource.objects.filter(
                    medrule=medrule,
                    medication=medication
                )
                print(
                    f"Found {medrule_sources.count()} sources for medrule {medrule.id}")

                for source_link in medrule_sources:
                    embedding = source_link.embedding

                    # Get filename from upload_file if available
                    filename = None
                    if hasattr(embedding, 'upload_file') and embedding.upload_file:
                        filename = embedding.upload_file.file_name

                    source_info = {
                        'filename': filename,
                        'title': getattr(embedding, 'title', None),
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

            print(
                f"Total benefits collected: {len(benefits)}, Total risks collected: {len(risks)}, Total sources: {len(sources_info)}")

            # If no medrule-based benefits or risks, fall back to basic medication info
            if not benefits and not risks:
                basic_benefits = [
                    f'- {b.strip()}' for b in medication.benefits.split(',')]
                basic_risks = [
                    f'- {r.strip()}' for r in medication.risks.split(',')]

                return Response({
                    'benefits': basic_benefits,
                    'risks': basic_risks,
                    'sources': sources_info,
                    'note': 'No specific medrule sources found, showing general medication information'
                })

            return Response({
                'benefits': benefits if benefits else [f'- {b.strip()}' for b in medication.benefits.split(',')],
                'risks': risks if risks else [f'- {r.strip()}' for r in medication.risks.split(',')],
                'sources': sources_info,
                'medrules_found': len(medrules),
                'source_type': 'all'
            })

        except Medication.DoesNotExist:
            return Response({"error": f"Medication '{drug}' not found."}, status=status.HTTP_404_NOT_FOUND)

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
        prompt = (
            f"You are providing medication information from a diagnosis/clinical perspective. "
            f"Provide a concise list of 5 key benefits and 5 key risks for the medication {drug} "
            f"when prescribed for Bipolar disorder, focusing on clinical evidence and diagnostic considerations. "
            f"Each point should be short, clear and be kept under 10 words. "
            f"Begin the benefits section with !!!benefits!!! and the risks section with !!!risk!!!."
        )

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
