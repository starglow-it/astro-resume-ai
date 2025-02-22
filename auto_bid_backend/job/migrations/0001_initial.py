# Generated by Django 5.0.3 on 2024-07-29 16:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('profile_management', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobPost',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('site', models.CharField(max_length=255)),
                ('title', models.CharField(max_length=255)),
                ('company', models.CharField(blank=True, max_length=255, null=True)),
                ('job_url', models.URLField()),
                ('job_url_direct', models.TextField(blank=True, null=True)),
                ('location', models.CharField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('company_url', models.TextField(blank=True, null=True)),
                ('company_url_direct', models.TextField(blank=True, null=True)),
                ('job_type', models.CharField(blank=True, max_length=50, null=True)),
                ('interval', models.CharField(blank=True, choices=[('yearly', 'Yearly'), ('monthly', 'Monthly'), ('weekly', 'Weekly'), ('daily', 'Daily'), ('hourly', 'Hourly')], max_length=20, null=True)),
                ('min_amount', models.FloatField(blank=True, null=True)),
                ('max_amount', models.FloatField(blank=True, null=True)),
                ('currency', models.CharField(blank=True, default='USD', max_length=3, null=True)),
                ('date_posted', models.DateField(blank=True, null=True)),
                ('emails', models.TextField(blank=True, null=True)),
                ('is_remote', models.BooleanField(blank=True, default=False, null=True)),
                ('is_easy_apply', models.BooleanField(blank=True, default=False, null=True)),
                ('company_addresses', models.TextField(blank=True, null=True)),
                ('company_industry', models.CharField(blank=True, max_length=255, null=True)),
                ('company_num_employees', models.CharField(blank=True, max_length=255, null=True)),
                ('company_revenue', models.CharField(blank=True, max_length=255, null=True)),
                ('company_description', models.TextField(blank=True, null=True)),
                ('ceo_name', models.CharField(blank=True, max_length=255, null=True)),
                ('ceo_photo_url', models.TextField(blank=True, null=True)),
                ('logo_photo_url', models.TextField(blank=True, null=True)),
                ('banner_photo_url', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField(blank=True, null=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='job', to='job.jobpost')),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to='profile_management.profile')),
            ],
            options={
                'unique_together': {('job', 'profile')},
            },
        ),
    ]
