from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction

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
            continue  # Skip to the next field

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
            if standard_question:
                standard_question = StandardQuestion.objects.create(standard_question=question)
            profile_text = profile.to_text()
            answer['answer'] = auto_answer_generation_model(question, profile_text)
            print('*answer from model', answer['answer'])
            if not answer['answer'] and (inputType == 'text' or inputType == 'textarea') and question:
                gptPrompt = f"""
                    Here is my resume profile:
                    {profile_text}

                    And here is a job description:
                    {job_description}

                    Please provide a concise and positive answer to the following question:
                    "{question}"
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
            else:
                answer['answer'] = None
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

@api_view(["POST"])        
def get_answers(request):
    profile_id = request.data.get('profile_id', None)    
    questions = request.data.get('data', [])

    profile = get_object_or_404(Profile, id=profile_id)

    # Create a dictionary to store the answers.
    answers_dict = {}
    
    for question_data in questions:
        # Extract question and inputType from the question_data dictionary
        question = question_data.get('question')
        inputType = question_data.get('inputType', 'text')

        # Get the standard question for the question
        standard_question = get_standard_question(question)

        # Retrieve the answer based on question and inputType.
        answer_query = Answer.objects.filter(
            profile=profile,
            standard_question=standard_question,
            inputType=inputType
        ).first()  # We use first() to get the first matching item.

        answer = {}

        if answer_query:
            answer['answer'] = answer_query.answer
        else:
            answer['answer'] = None  # or any default value you want to provide

        # Add the standard_question to answers_dict
        answer['standard_question'] = standard_question.id
        answers_dict[question_data.get('id')] = answer

    return Response({
        'message': 'Answers successfully retrieved',
        'answers': answers_dict
    }, status=status.HTTP_200_OK)
    
@api_view(["GET"])
def get_urls(request):
    urls = []
    
    return JsonResponse({'urls': urls})