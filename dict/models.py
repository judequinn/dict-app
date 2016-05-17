from django.db import models

class Word(models.Model):
    english = models.CharField(max_length=200)
    russian = models.CharField(max_length=200)

    def __str__(self):
        return self.english
