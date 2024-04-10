# Create your models here.
from django.db import models
from django.utils.translation import gettext_lazy as _

class CompensationInterval(models.TextChoices):
    YEARLY = 'yearly', _('Yearly')
    MONTHLY = 'monthly', _('Monthly')
    WEEKLY = 'weekly', _('Weekly')
    DAILY = 'daily', _('Daily')
    HOURLY = 'hourly', _('Hourly')

class JobPost(models.Model):
    site = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, null=True, blank=True)
    job_url = models.URLField()
    job_url_direct = models.TextField(null=True, blank=True)
    location = models.CharField(null=True, blank=True)
    
    description = models.TextField(null=True, blank=True)
    company_url = models.TextField(null=True, blank=True)
    company_url_direct = models.TextField(null=True, blank=True)
    
    job_type = models.CharField(max_length=50, null=True, blank=True)
    interval = models.CharField(max_length=20, choices=CompensationInterval.choices, null=True, blank=True)
    min_amount = models.FloatField(null=True, blank=True)
    max_amount = models.FloatField(null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD', null=True, blank=True)
    date_posted = models.DateField(null=True, blank=True)
    emails = models.TextField(null=True, blank=True)
    is_remote = models.BooleanField(null=True, blank=True)
    
    # indeed specific fields
    company_addresses = models.TextField(null=True, blank=True)
    company_industry = models.CharField(max_length=255, null=True, blank=True)
    company_num_employees = models.CharField(max_length=255, null=True, blank=True)
    company_revenue = models.CharField(max_length=255, null=True, blank=True)
    company_description = models.TextField(null=True, blank=True)
    ceo_name = models.CharField(max_length=255, null=True, blank=True)
    ceo_photo_url = models.TextField(null=True, blank=True)
    logo_photo_url = models.TextField(null=True, blank=True)
    banner_photo_url = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title
