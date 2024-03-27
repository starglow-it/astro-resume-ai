from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .resume_parser import ResumeParser  # Adjust this import path as necessary
import os
from django.core.files.storage import default_storage

@csrf_exempt
def parse_resume(request):
    if request.method == 'POST':
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file part'}, status=400)
        
        file = request.FILES['file']
        if file.name == '':
            return JsonResponse({'error': 'No selected file'}, status=400)
        
        if file and is_allowed_file(file.name):
            file_path = default_storage.save(os.path.join('uploaded-resumes', file.name), file)
            file_path = default_storage.path(file_path)
            
            parser = ResumeParser(os.getenv('OPEN_API_KEY'))
            
            try:
                parsed_resume = parser.query_resume(file_path)
                return JsonResponse(parsed_resume, safe=False, status=200)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

def is_allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
