# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-17 14:02
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dict', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='word',
            name='transcription',
            field=models.CharField(max_length=200, null=True),
        ),
    ]