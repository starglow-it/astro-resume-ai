# Generated by Django 5.0.3 on 2024-04-05 21:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profile_management', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='experience',
            name='description',
            field=models.JSONField(default=list),
        ),
    ]
