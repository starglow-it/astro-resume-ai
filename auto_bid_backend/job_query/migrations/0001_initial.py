# Generated by Django 5.0.3 on 2024-04-08 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='JobQuery',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('url', models.TextField(default='')),
                ('title_query', models.TextField(default='')),
                ('description_query', models.TextField(default='')),
            ],
        ),
    ]
