import os
from pdfminer.high_level import extract_text
from openai import OpenAI
import json
import docx2txt
import textract

class ResumeParser():
    def __init__(self, OPENAI_API_KEY):
        # set GPT-3 API key from the environment vairable
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        # GPT-3 completion questions
        self.prompt_questions = \
"""Summarize the text below into a JSON with exactly the following structure \
    {name, email, phone, location, Recent Role/Title, skills: [], education: {university, education_level (BS, MS, or PhD), graduation_year,}\
    experience: [{job_title, company, location, duration, job_summary}], Work Authorization, linkedin, github }
"""
    def query_completion(self: object,
                        prompt: str,
                        engine: str='gpt-3.5-turbo',
                        max_tokens: int = 100,
                        ) -> object:
        """
        Base function for querying GPT-3. 
        Send a request to GPT-3 with the passed-in function parameters and return the response object.
        :param prompt: GPT-3 completion prompt.
        """
        response = self.client.chat.completions.create(
            messages=[{
                'role': 'user',
                'content': prompt
            }],
            model="gpt-3.5-turbo",
        )
        return response

    def extract_text_from_file(self: object, file_path: str) -> str:
        file_ext = os.path.splitext(file_path)[1]
        text = ""

        if file_ext == '.doc':
            # docx_path = self.convert_doc_to_docx(file_path)
            # file_path = docx_path  # Update file_path to point to the converted .docx

            text = textract.process(file_path)
            return text.decode('utf-8')

        if file_ext == '.docx':
            """Extract text from docx file including body, headers, footers, and content controls."""
            text = docx2txt.process(file_path)
            return text
        elif file_ext == '.pdf':
            text = extract_text(file_path)

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