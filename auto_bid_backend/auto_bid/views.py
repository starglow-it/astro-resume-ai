from django.shortcuts import render, get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from profile_management.models import Profile
from .models import Answer, Question, StandardQuestion
from .utils import find_similar_sentence

# def add_question_with_standardization(new_question_text):
#     # First, get all standard questions from the database
#     # standard_questions = StandardQuestion.objects.all().values_list('standard_question', flat=True)

#     # # Find similar standard questions
#     # similar_questions = find_similar_sentence(new_question_text, list(standard_questions), score_threshold=0.9)
#     similar_question = StandardQuestion.objects.get(standard_question=new_question_text)
#     print(similar_question)
#     if similar_question:
#         # If there are similar standard questions, get the most similar one
#         standard_question = StandardQuestion.objects.filter(standard_question=similar_question)
#         if standard_question.count() >= 1:
#             standard_question = standard_question.first()
#         else:
#             standard_question = None
#     else:
#         # If there are no similar questions, create a new standard question
#         standard_question = StandardQuestion.objects.create(standard_question=new_question_text)
#         Question.objects.create(question=new_question_text, standard_question=standard_question)
    
#     return standard_question

def get_similar_question(question):
    standard_questions = StandardQuestion.objects.all().values_list('standard_question', flat=True)
    similar_question = find_similar_sentence(question, list(standard_questions), score_threshold=0.7)
    standard_question = None
    
    if similar_question:
        standard_question = StandardQuestion.objects.get(standard_question=similar_question)
    
    return standard_question if standard_question else None

def get_standard_question(question_text):
    # Try to get the question from the StandardQuestion
    try:
        standard_question = StandardQuestion.objects.get(standard_question=question_text)
        
        return standard_question
    except StandardQuestion.MultipleObjectsReturned:
        standard_question = StandardQuestion.objects.filter(standard_question=question_text).first()
        return standard_question
    
    except StandardQuestion.DoesNotExist:
        # If the question does not exist, standardize and add to DB
        standard_question = StandardQuestion.objects.create(standard_question=question_text)
        Question.objects.create(question=question_text, standard_question=standard_question)
        
        return standard_question

# Save answers for yet-unanswered questions 
@api_view(["POST"])
def save_answers(request):
    profile_id = request.data.get('profile_id', None)
    filled_form = request.data.get('data', [])
    profile = get_object_or_404(Profile, id=profile_id)

    for field in filled_form:
        standard_question_id = field.get('standard_question')
        inputType = field.get('inputType', 'text')
        standard_question = None

        try:
            standard_question = StandardQuestion.objects.get(id=standard_question_id)
        except StandardQuestion.DoesNotExist:
            print({'error': f'Standard question with ID {standard_question_id} does not exist'})
        

        if standard_question:  # Check if there's actually a question provided
            if Answer.objects.filter(standard_question=standard_question, profile=profile, inputType=inputType).exists():
                continue
            
            Answer.objects.update_or_create(
                profile=profile,
                standard_question=standard_question,
                inputType=inputType,
                defaults={
                    'isOptional': field.get('isOptional', False),
                    'answer': field.get('answer', '')
                }
            )

    return Response({'message': 'Answer successfully saved or updated'}, status=status.HTTP_201_CREATED)

# Save question and standardized question and get answers if exist. ( For single question )
@api_view(["POST"])        
def get_answer(request):
    profile_id = request.data.get('profile_id', None)    
    question_data = request.data.get('data', [])

    profile = get_object_or_404(Profile, id=profile_id)
    
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
        standard_question = get_similar_question(question)
        answer_query = Answer.objects.filter(profile=profile, standard_question=standard_question, inputType=inputType).first()
        if answer_query:
            answer['answer'] = answer_query.answer
        else:
            answer['answer'] = None
    print(standard_question)
    print(answer['answer'])
    # Add the standard_question to answers_dict
    answer['standard_question'] = standard_question.id

    return Response({
        'message': 'Answers successfully retrieved',
        'answer': answer
    }, status=status.HTTP_200_OK)

# Save question and standardized question and get answers if exist. ( For bulk questions )
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

        
