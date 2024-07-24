from django.shortcuts import render, get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse

from profile_management.models import Profile
from .models import Answer, Question, StandardQuestion
from .utils import find_similar_sentence

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
            if Answer.objects.filter(standard_question=standard_question, profile=profile, inputType=inputType).first():
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
    urls = [
        "https://www.indeed.com/pagead/clk?mo=r&ad=-6NYlbfkN0BGew-iwE01Iq6lgB-4_2amoZBEavAojx349KiqDz3xyIgW2imC53zIa3reS3N4XurCHbq7K6oD4OA0kEGRraOxaubs5RcUJM7tzoE1ovz-7bbPE0xULV5pMgrF-xCMLHcVNhR92wzg3WGxCuVR5lbmxKkUj_Y86RCLXupLzZCIdnYDfXGBGQHJ_umPWSVZrd_qwcTSzZJQCoRKjje2hP7zsMoPaOlsXCnlVOWnwLFfi4ECSHcB_iLNiYLflcDbuiSmHW_-h0rp4z6gqwV65YkoEWNIigPhwykgIjusX7n1W4IPqrxh-TonbpQjeaGwe6_lrDJHzLSfsQ5sjnFDveho95JyokFWedkvDv7p4TdxKrGqycD68R-q_MLMrpZ8g6N8VSr5kq-J9kMSUEW5N6bdvicrT0f9wc7lxVFWXKkI-jzPxpdGp-cfE8TNj8oQ2Hx6JjctPOffOBBwaT8ubcO8qKphdF3L75WJeKLxzDLIeETbyA7VrDxErh_Hji1r6MQYg_yRdR8GDL7hnlsQVbBFroEbQJo7aOKj4SfuPswASdOlhDBCbckS5vWkv3uEUYu5u9KtsmSGIqfc8D_fWibNCd4EEU1LTij5I0kVJwxFUMSz5CVaDw5KA34fzRXmxZb35VeGrnyaCkp2uM8AoMan0LipSuidzxo=&xkcb=SoAq6_M3-xDUBgSJ250JbzkdCdPP&camk=nUmJqO2E8ri3TdDAXPRRUg==&p=0&fvj=1&vjs=3",
        "https://www.indeed.com/pagead/clk?mo=r&ad=-6NYlbfkN0B9ongrXVJuirvHG7ZJtzAJoL6qE4YPhJl7IvYEvTwKYF0yLyHKgBPQDG6bqQ_Z5kXwPaabSI0-TelwQqjB840hefeUCbRnyO1176_GA50FpbZTQn5dp00bB9AfJCA-rseBIR-xmzPfMAmDdZbGuLD1fN4Q1P7ehRoK8NXrDFqMZ0xkxhr1Agtb_8fBbUynNvmDrGn9JULSxufnlpiy3wlNiUltKjS9BpUwG98ELVss7bctzdyiZE0NtJa5S3YpWQpwxYSlUnag_dES8NcnXfkluKlP7Ux11f_5FvUdDzs_JzU3PZxjlg1XvglXU_5nHuvZ6Vu0fEZ27C0ozTkoG81J-1qUWZIwj18Oh3jCXzIjVSHQM5j79Fxp4SoOAUBR6ymMwFP1L0xMJmgf2nmT-_0GMWR66LBabVMrZhxAs6kd06jMBItbBfR4FYMImGHOu-j1NtdrhzD2ttoa94FUpqeVQmgW9ZyCZ68e0GRPowMzzNX2qxxL9fQyY28QWP36_yYdR_DosN_IcQ7b9A8hiNm3ZFbmzM-0yAMJAQ0WXuGrz74VB-sdLKRThFo2uMQKLN0xR00ni9fwJHuFdsotUKu9lJVZqy5hluiXyrgzzpJxPFOI0cxtDGe7-kYyrZEDwt_VdYUa0nt1OWw7fHNqF21Rabf4uJS7MZwuTv3MFtM0Cw==&xkcb=SoCe6_M3-xDUBgSJ250IbzkdCdPP&camk=nUmJqO2E8rgUVq3MI8YRTg==&p=1&fvj=1&vjs=3&tk=1i3h5mui3klrd8fg&jsa=4301&oc=1&sal=1",
        "http://example.com/3"
    ]
    
    return JsonResponse({'urls': urls})

        
