from django import forms
from .models import Word

class WordForm(forms.ModelForm):

    english = forms.CharField(label='Слово')
    russian = forms.CharField(label='Перевод')

    class Meta:
        model = Word
        fields = ('english', 'russian',)
