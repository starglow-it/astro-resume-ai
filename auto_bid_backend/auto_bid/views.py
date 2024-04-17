from django.shortcuts import render, get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from profile_management.models import Profile
from .models import Answer

def find_ai_matched_question(question):
    
    return score

# Save answers for yet-unanswered questions 
@api_view(["POST"])
def save_answers(request):
    profile_id = request.data.get('profile_id', None)
    filled_form = request.data.get('data', [])
    
    profile = get_object_or_404(Profile, id=profile_id)

    for field in filled_form:
        question = field.get('question')
        inputType = field.get('inputType', 'text')

        if question:  # Check if there's actually a question provided
            answer_obj, created = Answer.objects.update_or_create(
                profile=profile,
                question=question,
                inputType=inputType,
                defaults={
                    'isOptional': field.get('isOptional', False),
                    'answer': field.get('answer', '')
                }
            )

    return Response({'message': 'Answer successfully saved or updated'}, status=status.HTTP_201_CREATED)
    
@api_view(["POST"])        
def get_answers(request):
    profile_id = request.data.get('profile_id', None)    
    questions = request.data.get('data', [])

    profile = get_object_or_404(Profile, id=profile_id)

    # questions = [q['question'] for q in questions_data if 'question' in q]

    # Create a dictionary to store the answers.
    answers_dict = {}
    
    for question_data in questions:
        question = question_data.get('question')
        inputType = question_data.get('inputType', 'text')

        # Retrieve the answer based on question and inputType.
        answer_query = Answer.objects.filter(
            profile=profile,
            question=question,
            inputType=inputType
        ).first()  # We use first() to get the first matching item.

        if answer_query:
            answers_dict[question_data.get('id')] = answer_query.answer
        else:
            answers_dict[question_data.get('id')] = None  # or any default value you want to provide

    return Response({
        'message': 'Answers successfully retrieved',
        'answers': answers_dict
    }, status=status.HTTP_200_OK)

        
