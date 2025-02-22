from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.core.exceptions import MultipleObjectsReturned

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from openai import OpenAI

from profile_management.models import Profile
from .models import Answer, StandardQuestion
from .utils import auto_answer_generation_model, get_standard_question

@api_view(["POST"])
def save_answers(request):
    profile_id = request.data.get('profile_id', None)
    filled_form = request.data.get('data', [])
    profile = get_object_or_404(Profile, id=profile_id)

    success_count = 0
    failure_count = 0
    errors = []

    # Validation function
    def validate_field(field):
        errors = []
        if not field.get('standard_question'):
            errors.append('Standard question ID is required.')
        if not isinstance(field.get('isOptional', False), bool):
            errors.append('Invalid value for isOptional. It must be a boolean.')
        # Add more validations as needed
        return errors

    for field in filled_form:
        # Validate the field
        field_errors = validate_field(field)
        if field_errors:
            errors.append({'field': field, 'errors': field_errors})
            failure_count += 1
            continue  # Skip to the next field

        standard_question_id = field.get('standard_question')
        inputType = field.get('inputType', 'text')
        standard_question = None
        answer_value = field.get('answer', '')

        # Skip if the answer is empty or null
        if not answer_value:
            continue

        try:
            standard_question = StandardQuestion.objects.get(id=standard_question_id)
        except StandardQuestion.DoesNotExist:
            errors.append({'error': f'Standard question with ID {standard_question_id} does not exist'})
            failure_count += 1
            continue 

        try:
            with transaction.atomic():  # Ensure atomicity for each operation
                # Attempt to update or create the Answer object
                answer, created = Answer.objects.update_or_create(
                    profile=profile,
                    standard_question=standard_question,
                    inputType=inputType,
                    defaults={
                        'isOptional': field.get('isOptional', False),
                        'answer': answer_value
                    }
                )
                if created:
                    print('*standard_question=>', standard_question)
                    print('*answer created=>', answer.answer)
                    success_count += 1
                else:
                    success_count += 1
        except Exception as e:
            print(str(e))
            errors.append({'error': str(e), 'field': field})
            failure_count += 1

    response_data = {
        'message': 'Processing completed',
        'success_count': success_count,
        'failure_count': failure_count,
        'errors': errors
    }

    return Response(response_data, status=status.HTTP_207_MULTI_STATUS if failure_count else status.HTTP_201_CREATED)

@api_view(["POST"])
def create_answers(request):
    profile_id = request.query_params.get('profile')
    answers_data = request.data.get('answers', [])

    profile = get_object_or_404(Profile, id=profile_id)

    success_count = 0
    failure_count = 0
    errors = []

    for answer_data in answers_data:
        question_text = answer_data.get('question')
        input_type = answer_data.get('inputType', 'text')
        answer_text = answer_data.get('answer', '')

        if not answer_text:
            continue  # Skip if answer is empty or null

        try:
            with transaction.atomic():
                # Get or create the standard question
                try:
                    standard_question, created = StandardQuestion.objects.get_or_create(
                        standard_question=question_text
                    )
                except MultipleObjectsReturned:
                    # Handle multiple values returned
                    standard_question = StandardQuestion.objects.filter(
                        standard_question=question_text
                    ).first()

                # Check if the answer already exists
                existing_answer = Answer.objects.filter(
                    profile=profile,
                    standard_question=standard_question,
                    inputType=input_type
                ).first()

                if existing_answer:
                    # If an answer already exists, skip creation
                    continue

                # Create the answer
                Answer.objects.create(
                    profile=profile,
                    standard_question=standard_question,
                    inputType=input_type,
                    answer=answer_text
                )
                success_count += 1

        except IntegrityError as e:
            errors.append({'error': str(e)})
            failure_count += 1
        except Exception as e:
            errors.append({'error': str(e), 'field': answer_data})
            failure_count += 1

    response_data = {
        'message': 'Processing completed',
        'success_count': success_count,
        'failure_count': failure_count,
        'errors': errors
    }

    return Response(response_data, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)

@api_view(["POST"])
def get_answer(request):
    try:
        profile_id = request.data.get('profile_id', None)
        question_data = request.data.get('data', {})
        job_description = request.data.get('job_description', '')

        profile = get_object_or_404(Profile, id=profile_id)
        
        # Extract question and inputType from the question_data dictionary
        question = question_data.get('question')
        inputType = question_data.get('inputType', 'text')

        # Get the standard question for the question
        standard_question = get_standard_question(question)

        # Retrieve the answer based on question and inputType
        answer_query = Answer.objects.filter(
            profile=profile,
            standard_question=standard_question,
            inputType=inputType
        ).first()

        answer = {}
        if answer_query:
            answer['answer'] = answer_query.answer
        else:
            if not standard_question:
                standard_question = StandardQuestion.objects.create(standard_question=question)
            profile_text = profile.to_text()
            answer['answer'] = auto_answer_generation_model(question, profile_text)
            print('*answer from model => ', answer['answer'])
            if not answer['answer'] and inputType == 'textarea' and question:
                gptPrompt = f"""
                    Here is my resume profile:
                    {profile_text}

                    And here is a job description:
                    {job_description}

                    Please provide a concise and positive answer to the following question:
                    "{question}"
                    
                    Causion:
                    1. When a descriptive answer is needed, avoid using the CV owner's name; instead, use 'I.'
                    2. Do not repeat the question in your answer.
                    """

                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                chat_completion = client.chat.completions.create(
                    messages=[
                        {"role": "user", "content": gptPrompt}
                    ],
                    model="gpt-3.5-turbo-0125",
                )

                message = chat_completion.choices[0].message.content
                answer['answer'] = message
                
        print('*answer =>', answer['answer'])
        answer['standard_question'] = standard_question.id if standard_question else None

        return Response({
            'message': 'Answers successfully retrieved',
            'answer': answer
        }, status=status.HTTP_200_OK)
    
    except Profile.DoesNotExist:
        return Response({
            'message': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    except StandardQuestion.DoesNotExist:
        return Response({
            'message': 'Standard question not found'
        }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        print(str(e))
        return Response({
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(["GET"])
def get_answers(request):
    try:
        profile_id = request.query_params.get('profile')
        
        # Filter answers by profile if profile_id is provided, otherwise return all answers
        if profile_id:
            answers = Answer.objects.filter(profile_id=profile_id)
        else:
            answers = Answer.objects.all()
        
        if not answers.exists():
            return Response({
                'message': 'No answers found for the specified profile' if profile_id else 'No answers found'
            }, status=status.HTTP_404_NOT_FOUND)

        answer_list = []
        for answer in answers:
            answer_list.append({
                'id': answer.id,
                'profile': answer.profile.name,
                'question': answer.standard_question.standard_question,
                'inputType': answer.inputType,
                'answer': answer.answer,
            })

        return Response({
            'message': 'Answers successfully retrieved',
            'answers': answer_list
        }, status=status.HTTP_200_OK)

    except Profile.DoesNotExist:
        return Response({
            'message': 'Profile not found'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        print(str(e))
        return Response({
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
def update_answers(request):
    try:
        answers_data = request.data.get('answers', [])

        for answer_data in answers_data:
            answer_id = answer_data.get('id')
            new_answer = answer_data.get('answer')

            if not answer_id or new_answer is None:
                return Response({
                    'message': 'Invalid data in request'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                answer = Answer.objects.get(id=answer_id)
                answer.answer = new_answer
                answer.save()
            except Answer.DoesNotExist:
                return Response({
                    'message': f'Answer with id {answer_id} not found'
                }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'message': 'Successfully updated'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(str(e))
        return Response({
            'message': 'An unexpected error occurred',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)