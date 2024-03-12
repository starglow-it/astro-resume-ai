from django.conf import settings
from django.http import HttpResponse
from django.utils.html import escape  # For basic HTML escaping
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Resume, JobDescription
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


@api_view(['POST'])
def generate_resume(request):
    job_description_text = request.data.get('job_description')
    job_url = request.data.get('job_url', '')
    title = request.data.get('title', '')
    resume_id = request.data.get('resume_id', None)
    resume_pdf_path = None  # Define early to ensure it's in scope for the finally block

    try:
        origin_resume = get_origin_resume(resume_id)
        resume_data = generate_resume_data(title, job_description_text, origin_resume)
        # Save the job description and generated resume to the database
        job_description_obj = JobDescription.objects.create(job_url=job_url, title=title, description=job_description_text)
        resume_obj = save_resume_data_to_db(resume_data)

        resume_pdf_path = generate_pdf_from_resume_data(resume_data, title)
        return Response({
            'message': 'Resume PDF generated successfully',
            'url': resume_pdf_path
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
        resume = Resume.objects.get(id=resume_id)
    else:
        resume = Resume.objects.first() if Resume.objects.exists() else None
    
    if resume:
        # Manually serialize the Resume instance
        return serialize_resume(resume)
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


def generate_resume_data(title, job_description, origin_resume):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    prompt = (f"Given the following resume: {json.dumps(origin_resume, indent=2)} and the job description: Title ==> {title} Description ==> {job_description}, update the resume to match the job description 100%. Provide the updated resume in JSON format. In this case, don't use ( '_' ) unerscore for filed name "
              f"Also get all keywords (400 + words) as much as (get really many keywords as possible) can from the job description and add them as string to the 'hide_text' filed in resume json. get really many keywords so that we can increase the matching score."
              f"Please update profile.overview, experience ( title, responsibilities) and skills for perfect match with job description. Actually your provided resume matched about 50%. I have to increase this to about 100%."
              f"Only provide JSON code. Don't mention explain."
              )
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "user", "content": prompt}
        ],
        model="gpt-4",
        stop=None
    )

    # Extract and print the assistant's response
    response_message = chat_completion.choices[0].message
    resume_json = process_json(json.loads(response_message.content))
    return resume_json

def save_resume_data_to_db(resume_data):
    resume_data_without_id = {key: value for key, value in resume_data.items() if key != 'id'}
    return Resume.objects.create(**resume_data_without_id)

def generate_pdf_from_resume_data(resume_data, title):
    # Paths for the LaTeX template and output directory
    template_path = os.path.join(settings.BASE_DIR, 'latex_templates', 'resume_template.tex')
    output_dir = os.path.join(settings.BASE_DIR, 'output')
    os.makedirs(output_dir, exist_ok=True)
    cls_path = os.path.join(settings.BASE_DIR, 'latex_templates', 'resume_template.cls')
    shutil.copy(cls_path, output_dir)

    personal_info = resume_data['personal_information']
    profile = resume_data['profile']

    experience = format_experience_section(resume_data['experience'])
    education = format_education_section(profile['education'])
    skills = format_skills_section(resume_data['skills'])

    # Fill out the LaTeX template with sanitized data
    with open(template_path, 'r') as file:
        latex_content = file.read()
    latex_content = latex_content.replace('{{name}}', f"{{{personal_info['name']}}}")
    latex_content = latex_content.replace('{{linkedin}}', f"{{{personal_info['linkedin']}}}")
    latex_content = latex_content.replace('{{email}}', f"{{{personal_info['email']}}}")
    latex_content = latex_content.replace('{{phone}}', f"{{{personal_info['phone']}}}")
    latex_content = latex_content.replace('{{website}}', f"{{{personal_info['website']}}}")  # Use the actual website data
    latex_content = latex_content.replace('{{summary}}', profile['overview'])
    latex_content = latex_content.replace('{{experiences}}', experience)
    latex_content = latex_content.replace('{{education}}', education)
    latex_content = latex_content.replace('{{skills}}', skills)
    latex_content = latex_content.replace('{{hide_text}}', f"{{{resume_data['hide_text']}}}")
    current_datetime = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    # Write filled content to a temporary .tex file
    file_name = sanitize_for_filename(f"{personal_info['name']}_{title}_{current_datetime}.tex")
    temp_tex_path = os.path.join(output_dir, file_name)
    print (temp_tex_path)
    with open(temp_tex_path, 'w') as file:
        file.write(latex_content)

    # Compile LaTeX to PDF
    compile_success = subprocess.run(['latexmk', '-xelatex', '-outdir=' + output_dir, temp_tex_path])

    # Clean up auxiliary files, leaving only the PDF
    subprocess.run(['latexmk', '-c', '-outdir=' + output_dir, temp_tex_path])

    if compile_success.returncode != 0:
        raise Exception("LaTeX compilation failed")

    # Return path to the generated PDF
    return os.path.splitext(temp_tex_path)[0] + '.pdf'

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

# Function to format the experience section
def format_experience_section(experiences):
    formatted = ""
    for exp in experiences:
        formatted += f"\\begin{{subsection}}{{{exp['title']}}}{{{exp['company']}}}{{{exp['duration']}}}{{}}\n"
        for responsibility in exp['responsibilities']:
            formatted += f"\\item {responsibility}\n"
        formatted += "\\end{subsection}\n\n"
    return formatted

# Function to format the education section
def format_education_section(education):
    formatted = ""
    for edu in education:
        formatted += f"\\begin{{subsectionnobullet}}{{{edu['degree']}}}{{{edu['institution']}}}{{{edu['duration']}}}{{}}\n\\italicitem{{}}\\end{{subsectionnobullet}}\n\n"
    return formatted


# Function to format the education section
# Function to format skills section for sectiontable in LaTeX
def format_skills_section(skills):
    formatted_skills = ""
    for category, skill_list in skills.items():
        formatted_skills += "\\entry{" + category.replace("programmingLangage", "Programming Languages").title() + "}\n"
        formatted_skills += f"{{{', '.join(skill_list)}}}"  # Assuming no description for each skill
    return formatted_skills



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
        personal_information = data.get('personal_information', {})
        profile = data.get('profile', {})
        experience = data.get('experience', [])
        skills = data.get('skills', {})
        hide_text = data.get('hide_text', '')
        
        resume_obj = Resume.objects.create(
                personal_information=personal_information,
                profile=profile,
                experience=experience,
                skills=skills,
                hide_text=hide_text
            )
        return Response({'message': 'Resume created successfully', 'id': str(resume_obj.id)}, status=status.HTTP_201_CREATED)

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
