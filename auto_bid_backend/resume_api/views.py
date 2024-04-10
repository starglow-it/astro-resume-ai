from django.conf import settings
from django.http import HttpResponse
from django.utils.html import escape  # For basic HTML escaping
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Resume, JobDescription
from .serializers import ResumeSerializer
from profile_management.models import Profile
from profile_management.serializers import ProfileSerializer
import json
import os
import subprocess
import tempfile
from openai import OpenAI
from django.shortcuts import get_object_or_404
from django.http import QueryDict
import shutil
from datetime import datetime
import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from django.template.loader import render_to_string, get_template
from jinja2 import Environment, FileSystemLoader
from markupsafe import Markup
import copy

# Load a pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embeddings(texts):
    # Generate embeddings for a batch of texts
    # The encode method supports b atches directly.
    embeddings = model.encode(texts)
    return embeddings

def calculate_batch_similarity(embeddings1, embeddings2):
    # Cosine similarity for batches
    # This calculates the similarity between each pair of embeddings
    similarities = cosine_similarity(embeddings1, embeddings2)
    return similarities

def calculate_similarity(embedding1, embedding2):
    # Cosine similarity

    similarity = cosine_similarity([embedding1], [embedding2])
    return similarity[0][0]

def get_matching_scores(resumes, job_descriptions):
    # Ensure that resumes and job_descriptions are lists of texts
    assert len(resumes) == len(job_descriptions), "Each resume must correspond to one job description."
    
    # Generate embeddings for batches
    resume_embeddings = get_embeddings(resumes)
    job_description_embeddings = get_embeddings(job_descriptions)
    
    # Calculate similarity for each pair
    scores = calculate_batch_similarity(resume_embeddings, job_description_embeddings)
    
    # Since we're calculating one-to-one matches, we return the diagonal of the similarity matrix
    # which represents the similarity scores between corresponding resumes and job descriptions.
    return np.diag(scores)

def get_matching_score(resume, job_description):
    # Generate embeddings
    resume_embedding = get_embeddings(resume)
    job_description_embedding = get_embeddings(job_description)
    
    # Calculate similarity
    score = calculate_similarity(resume_embedding, job_description_embedding)
    return score

def deep_values_to_string(nested_dict, separator=' '):
    """
    Recursively traverses a nested dictionary, converts all values to strings,
    and joins them into a single string.

    Parameters:
    - nested_dict: The nested dictionary to process.
    - separator: The string used to separate values in the final output.

    Returns:
    - A string containing all values from the nested dictionary.
    """
    values = []
    for value in nested_dict.values():
        if isinstance(value, dict):
            # If the value is a dictionary, recursively process it
            values.append(deep_values_to_string(value, separator))
        else:
            values.append(str(value))  # Convert non-dictionary values to string
    return separator.join(values)

@api_view(['POST'])
def generate_resume(request):
    job_description_text = request.data.get('job_description')
    job_url = request.data.get('job_url', '')
    title = request.data.get('title', '')
    resume_id = request.data.get('resume_id', None)
    resume_pdf_path = None  # Define early to ensure it's in scope for the finally block

    print(resume_id)
    try:
        origin_resume = get_origin_resume(resume_id)
        resume_data = generate_resume_data(title, job_description_text, origin_resume)
        # Save the job description and generated resume to the database
        # job_description_obj = JobDescription.objects.create(job_url=job_url, title=title, description=job_description_text)
        # resume_obj = save_resume_data_to_db(resume_data)
        score = get_matching_score(deep_values_to_string(resume_data), job_description_text)
        print (score)
        # resume_pdf_path = generate_pdf_from_resume_data(resume_data, title)
        resume_pdf_path = generate_pdf_from_resume_data(resume_data, title)
        return Response({
            'message': 'Resume PDF generated successfully',
            'url': resume_pdf_path,
            'score': score
        }, status=status.HTTP_200_OK)
        # return serve_pdf_response(resume_pdf_path)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def sanitize_for_filename(s):
    """
    Sanitizes a string for use in a filename by removing or replacing
    characters that are illegal or problematic in file paths.
    """
    # Replace newlines and slashes with a space or underscore
    s = re.sub(r'[\n/]', '_', s)
    # Remove problematic characters
    s = re.sub(r'[<>:"\\|?*]', '', s)
    # Optional: Remove leading/trailing whitespace
    s = s.strip()
    # Optional: Shorten the string or further process it as needed
    return s

def serialize_resume(resume):
    # Assuming 'resume' is a Django model instance of Resume
    # Adjust fields as necessary
    return {
        "id": str(resume.id),
        "personal_information": resume.personal_information,
        "profile": resume.profile,
        "experience": resume.experience,
        "skills": resume.skills,
        "hide_text": resume.hide_text,
    }

def get_origin_resume(resume_id):
    if resume_id:
        resume = Profile.objects.get(id=resume_id)
    else:
        resume = Profile.objects.first() if Profile.objects.exists() else None
    
    if resume:
        # Manually serialize the Resume instance
        serialier = ProfileSerializer(resume)
        return serialier.data
    return None

def escape_latex_special_chars(text):
    """
    Escapes LaTeX special characters in the given text.
    """
    # List of LaTeX special characters that need to be escaped
    # Backslash must be first to not double-escape other escaped characters
    special_chars = ['\\', '&', '%', '$', '#', '_', '{', '}', '~', '^']
    # Dictionary to specify the escape sequence for each special character
    escape_sequences = {'~': '\\textasciitilde{}', '^': '\\textasciicircum{}'}
    
    # Escape each special character
    for char in special_chars:
        if char in escape_sequences:
            # Use a more specific escape sequence if defined
            text = text.replace(char, escape_sequences[char])
        else:
            # Prepend a backslash to the character to escape it
            text = text.replace(char, f"\\{char}")
    
    return text


def escape_json_values(obj):
    """
    Recursively escape all string values in a JSON object.
    """
    if isinstance(obj, dict):
        return {k: escape_json_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [escape_json_values(elem) for elem in obj]
    elif isinstance(obj, str):
        return escape_latex_special_chars(obj)
    else:
        return obj

def process_json(input_json):
    """
    Takes a JSON object (as a string or dict), escapes all LaTeX special characters in its string values,
    and returns the updated JSON object.
    """
    if isinstance(input_json, str):
        # Parse the JSON string into a Python object
        input_obj = json.loads(input_json)
    else:
        input_obj = input_json
    
    # Escape LaTeX special characters in all string values
    escaped_obj = escape_json_values(input_obj)
    
    # Convert the updated object back to a JSON string
    return escaped_obj


def update_resume_data(origin_resume, resume_json):
    updated_resume = copy.deepcopy(origin_resume)
    updated_resume['skills'] = resume_json['skills']
    updated_resume['summary'] = resume_json['summary']
    for i, exp in enumerate(resume_json['experience']):
        updated_resume['experience'][i]['job_title'] = exp['job_title']
        updated_resume['experience'][i]['description'] = exp['description'] 
    updated_resume['hide_text'] = resume_json['hide_text']
    return updated_resume





def generate_resume_data(title, job_description, origin_resume):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = (f"""
                In order to fine-tune my resume for a specific job application and enhance its compatibility with Applicant Tracking Systems (ATS), I require assistance with the following revisions, based on the job title and description provided:
                1. Summary Update: Please draft a new summary that effectively demonstrates my qualifications for the position, drawing directly from the job description to emphasize my suitability. And get all skills from job description and place them in summary
                2.Keyword Optimization:
                    Introduce a 'hide_text' field within my resumes JSON structure. This field should be populated with a comprehensive list of keywords extracted from the job description, formatted as a single, comma-separated string. The goal is to incorporate an extensive selection of keywords to significantly enhance the resume's ATS matching capability.
                    Ensure the job title and any keywords mentioned three or more times in the job description are included in the 'hide_text' field to improve ATS visibility.
                3. Skills Section Revision: Expand the skills section to cover all skills listed in the job description, alongside any other skills that are relevant and beneficial. Again: Get all skills that mentioned in job description.              
                4. generate new experiences includes at least 3 roles that aligns with the job description. really important to generate more three experiences that matches with job description.
                    structure example: At least 3 items.
                       experience: [
                           {{
                               "job_title" : "",
                               "description" : ["", "", "", ""]
                           }},
                           {{
                               "job_title" : "",
                               "description" : ["", "", "", ""]
                           }},
                           {{
                               "job_title" : "",
                               "description" : ["", "", "", ""]
                           }}
                       ]
                I am seeking guidance and am open to any adjustments necessary to ensure my resume aligns precisely with the job description. Please find my resume and the job specifics below for your consideration:
                

              Original Resume: 
               summary: {json.dumps(origin_resume['summary'])}
               skills: {json.dumps(origin_resume['skills'])}
               experience: {json.dumps(origin_resume['experience'])}
              
              Job Title: {title}
              Job Description:
              {job_description}
              """)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "user", "content": prompt}
        ],
        functions = [
            {
                "name": "createProfileObject",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "summary": { "type": "string" },
                        "skills": {
                            "type": "array",
                            "items": {
                            "type": "object",
                            "properties": {
                                "category_name": { "type": "string" },
                                "proficiency_list": { 
                                "type": "array",
                                "items": {
                                    "type": "string"
                                }
                                }
                            },
                            "required": ["category_name", "proficiency_list"]
                            }
                        },
                        "experience": {
                            "type": "array",
                            "items": {
                            "type": "object",
                            "properties": {
                                "job_title": { "type": "string" },
                                "description": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                    }
                                },
                            },
                            "required": ["title", "description"]
                            }
                        },
                        "hide_text": {
                            "type": "string"
                        }
                    },
                    "required": ["summary", "skills", "experience", "hide_text"]
                }
            }
        ],
        function_call = { "name": "createProfileObject" },
        # model="gpt-4",
        model="gpt-3.5-turbo-0125",
        # model="text-babbage-002",
        response_format={ "type": "json_object" },
        stop=None
    )

    # Extract and print the assistant's response
    response_message = chat_completion.choices[0].message
    resume_json = json.loads(response_message.function_call.arguments)
    new_resume = process_json(update_resume_data(origin_resume, resume_json))
    return new_resume

def save_resume_data_to_db(resume_data):
    resume_data_without_id = {key: value for key, value in resume_data.items() if key != 'id'}
    return Resume.objects.create(**resume_data_without_id)

def generate_pdf_from_resume_data(resume_data, title):
    try:
        template_path = os.path.join(settings.BASE_DIR, 'latex_templates', 'resume_template_1.tex')
        output_dir = os.path.join(settings.BASE_DIR, 'output')
        os.makedirs(output_dir, exist_ok=True)
        cls_path = os.path.join(settings.BASE_DIR, 'latex_templates', 'resume_template_1.cls')
        shutil.copy(cls_path, output_dir)
        
        data = {
            'name': resume_data['name'],
            'email': resume_data['email'],
            'phone': resume_data['phone'],
            'linkedin': resume_data['linkedin'] if resume_data['linkedin'] else "",
            'location': resume_data['location'] if resume_data['location'] else "",
            'education': resume_data['education'] if resume_data['education'] else "",
            'summary': resume_data['summary'] if resume_data['summary'] else "",
            'experience': resume_data['experience'],
            'skills': resume_data['skills'],
            "hide_text": resume_data['hide_text'] + title
            # 'certifications': resume_data['certifications'],
            # 'projects': resume_data['projects'],
        }

        template = get_template(template_path)
        latex_content = template.render(data)

        current_datetime = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        file_name = f"{resume_data['name']}_Resume_{current_datetime}.tex"
        temp_tex_path = os.path.join(output_dir, file_name)
        with open(temp_tex_path, 'w') as file:
            file.write(latex_content)

        compile_success = subprocess.run(['latexmk', '-xelatex', '-outdir=' + output_dir, temp_tex_path])
        

        # Clean up auxiliary files, leaving only the PDF
        subprocess.run(['latexmk', '-c', '-outdir=' + output_dir, temp_tex_path])

        if compile_success.returncode != 0:
            raise Exception("LaTeX compilation failed")
        result = os.path.splitext(temp_tex_path)[0] + '.pdf'

        return result
    except Exception as e:
        print(e)

def serve_pdf_response(pdf_path):
    pdf_url = os.path.join(settings.STATIC_URL, 'pdfs', os.path.basename(pdf_path))

    return Response({'message': 'Resume PDF generated successfully', 'url': pdf_url}, status=status.HTTP_200_OK)

    # with open(pdf_path, 'rb') as pdf_file:
    #     response = HttpResponse(pdf_file.read(), content_type='application/pdf')
    #     response['Content-Disposition'] = 'attachment; filename="generated_resume.pdf"'
    #     return response

def cleanup_generated_files(pdf_path):
    if pdf_path and os.path.exists(pdf_path):
        os.remove(pdf_path)
        tex_path = pdf_path.replace('.pdf', '.tex')
        if os.path.exists(tex_path):
            os.remove(tex_path)

@api_view(['GET', 'POST'])
def resumes(request):
    if request.method == 'GET':
        resumes = Resume.objects.all()
            
        resumes_data = [{
            "id": str(resume.id),
            "personal_information": resume.personal_information,
            "profile": resume.profile,
            "experience": resume.experience,
            "skills": resume.skills,
            "hide_text": resume.hide_text,
        } for resume in resumes]
        return Response(resumes_data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        data = request.data
        user_id = data.get('user_id', '')
        personal_information = data.get('personal_information', {})
        profile = data.get('profile', {})
        experience = data.get('experience', [])
        skills = data.get('skills', {})
        hide_text = data.get('hide_text', '')
        
        resume_obj = Resume.objects.create(
                user_id = user_id,
                personal_information=personal_information,
                profile=profile,
                experience=experience,
                skills=skills,
                hide_text=hide_text
            )
        return Response({'message': 'Resume created successfully', 'id': str(resume_obj.id)}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def resumes_by_user(request):
    if request.method == 'GET':
        resumes = Resume.objects.filter(user_id=request.user.id)
        serializer = ResumeSerializer(resumes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
def resume_detail(request, resume_id):
    resume = get_object_or_404(Resume, id=resume_id)
    if request.method == 'GET':
        resume_data = {
            "id": str(resume.id),
            "personal_information": resume.personal_information,
            "profile": resume.profile,
            "experience": resume.experience,
            "skills": resume.skills,
            "hide_text": resume.hide_text,
        }
        return Response(resume_data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        data = request.data

        # Extract fields from the data
        personal_information = data.get('personal_information', {})
        profile = data.get('profile', {})
        experience = data.get('experience', [])
        skills = data.get('skills', {})
        hide_text = data.get('hide_text', '')

        if resume_id:
            # Update an existing resume
            resume, created = Resume.objects.update_or_create(
                id=resume_id,
                defaults={
                    'personal_information': personal_information,
                    'profile': profile,
                    'experience': experience,
                    'skills': skills,
                    'hide_text': hide_text,
                }
            )
            return Response({'message': 'Resume updated successfully', 'id': str(resume.id)}, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        resume.delete()
        return Response({'message': 'Resume deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['DELETE'])
def delete_resumes(request):
    resume_ids = request.data.get('ids', [])
    if not resume_ids:
        return Response({'error': 'No resume IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Filter resumes by the provided IDs and delete them
        Resume.objects.filter(id__in=resume_ids).delete()
        return Response({'message': 'Resumes deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET', 'POST'])
def cal_matching_scores(request):
    if request.method == 'POST':
        try:
            description = request.data.get('description', '')
            profiles = Profile.objects.filter(user = request.user)
            profileSerializer = ProfileSerializer(profiles, many=True)
            
            if not profileSerializer:
                return Response({'message': 'No resumes found', 'scores': {}}, status=status.HTTP_200_OK)

            resumesText = []
            descriptions = []

            for resume in profileSerializer.data:
                resumesText.append(json.dumps(resume))
                descriptions.append(description)

            scores = {}
            for idx, score in enumerate(get_matching_scores(resumesText, descriptions)):
                scores[profileSerializer.data[idx]['id']] = score

            return Response({'message': 'Successfully calculated', 'scores': scores}, status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'message': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)