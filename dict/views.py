from django.shortcuts import render
from .models import Word

import json

def word_list(request):

    words = Word.objects.order_by('english')

    if request.method == "POST":

        body_unicode = request.body.decode('utf-8')
        data = json.loads(body_unicode)

        try:
            existing = Word.objects.get(english=data['english'])
            existing.russian = data['russian']
            existing.save()
        except:
            word = Word(english = data['english'], russian = data['russian'])
            word.save()

        return render(request, 'dict/word_list.html', {'words': words})

    return render(request, 'dict/word_list.html', {'words': words})
