import os
from openai import OpenAI
import json
import docx2txt
from pypdf import PdfReader

class ResumeParser():
    def __init__(self, OPENAI_API_KEY):
        # set GPT-3 API key from the environment vairable
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        # GPT-3 completion questions
        self.prompt_questions = \
"""Summarize the text below into a JSON with exactly the following structure.  \
    {name, recent_role, email, phone, location, summary(write as it is), skills: {category_name: ''(e.g.Programming Language), proficiency_list: []}[], education: [{university, education_level, major, graduation_year,}]\
    experience: [{job_title: string, company: string, location: string, duration: string, description: [](Write whole sentences as they are)}], linkedin, github, website, language }
"""
    def query_completion(self: object,
                        prompt: str,
                        engine: str='gpt-3.5-turbo',
                        ) -> object:
        response = self.client.chat.completions.create(
            messages=[{
                'role': 'user',
                'content': prompt
            }],
            model=engine,
            response_format={ "type": "json_object" },
        )
        return response

    def extract_text_from_file(self: object, file_path: str) -> str:
        file_ext = os.path.splitext(file_path)[1]
        text = ""

        if file_ext == '.doc':
            text = docx2txt.process(file_path)

            return text.decode('utf-8')
        elif file_ext == '.docx':
            """Extract text from docx file including body, headers, footers, and content controls."""
            text = docx2txt.process(file_path)

            return text
        elif file_ext == '.pdf':
            reader = PdfReader(file_path)

            text = ''
            for index in range(len(reader.pages)):
                page = reader.pages[index]
                text += page.extract_text()

            return text
        
        # In other cases
        with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()

        return text 
    
    def query_resume(self: object, file_path: str) -> dict:
        """
        Query GPT-3 for the work experience and / or basic information from the resume at the PDF file path.
        :param file_path: Path to the file file.
        :return dictionary of resume with keys (basic_info, work_experience).
        """
        resume = {}

        extracted = self.extract_text_from_file(file_path)

        prompt = self.prompt_questions + '\n' + extracted

        response = self.query_completion(prompt)

        response_text = response.choices[0].message.content

        print(response_text)
        
        resume = json.loads(response_text)

        return resume