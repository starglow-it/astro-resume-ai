from django.db import models
from django.contrib.auth.models import User
import json

class Profile(models.Model):
    user = models.ForeignKey(User, related_name='profiles', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    recent_role = models.CharField(max_length=255)
    phone = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list)
    work_authorization = models.CharField(max_length=255, blank=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    linkedin = models.CharField(max_length=255, blank=True, null=True)
    github = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

    def to_text(self):
        skills_text = json.dumps(self.skills, indent=2)
        education_texts = "\n".join(edu.to_text() for edu in self.education.all())
        experience_texts = "\n".join(exp.to_text() for exp in self.experience.all())
        return f"""
        Name: {self.name}
        Email: {self.email}
        Recent Role: {self.recent_role}
        Phone: {self.phone or 'N/A'}
        Location: {self.location or 'N/A'}
        Summary: {self.summary or 'N/A'}
        Skills: {skills_text}
        Work Authorization: {self.work_authorization or 'N/A'}
        Website: {self.website or 'N/A'}
        LinkedIn: {self.linkedin or 'N/A'}
        GitHub: {self.github or 'N/A'}
        
        Education:
        {education_texts}

        Experience:
        {experience_texts}
        """.strip()


class Education(models.Model):
    profile = models.ForeignKey(Profile, related_name='education', on_delete=models.CASCADE)
    university = models.CharField(max_length=255)
    education_level = models.CharField(max_length=255, blank=True, null=True)
    graduation_year = models.CharField(max_length=255, blank=True, null=True)
    major = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.university}, {self.education_level or 'N/A'}, {self.graduation_year or 'N/A'}, {self.major or 'N/A'}"

    def to_text(self):
        return f"University: {self.university}\nEducation Level: {self.education_level or 'N/A'}\nGraduation Year: {self.graduation_year or 'N/A'}\nMajor: {self.major or 'N/A'}\n"


class Experience(models.Model):
    profile = models.ForeignKey(Profile, related_name='experience', on_delete=models.CASCADE)
    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    duration = models.CharField(max_length=255, blank=True, null=True)
    description = models.JSONField(default=list)

    def __str__(self):
        return f"{self.job_title} at {self.company or 'N/A'}, {self.location or 'N/A'}, {self.duration or 'N/A'}"

    def to_text(self):
        description_text = "\n".join(self.description) if isinstance(self.description, list) else json.dumps(self.description, indent=2)
        return f"Job Title: {self.job_title}\nCompany: {self.company or 'N/A'}\nLocation: {self.location or 'N/A'}\nDuration: {self.duration or 'N/A'}\nDescription:\n{description_text}\n"
