from django.shortcuts import render
from django.http import HttpResponse
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

def get_word(request, word):

    try:
        existing_word = Word.objects.get(english=word)
        existing_word_to_dict = {'english': existing_word.english, 'russian': existing_word.russian, 'id': existing_word.id}
        return HttpResponse(json.dumps(existing_word_to_dict), content_type="application/json")
    except:
        return HttpResponse(json.dumps({'error': 'word not found'}), content_type="application/json")

def get_words(request):
    word_list = []
    words = Word.objects.all()
    for w in words:
        word = {'english':w.english, 'russian':w.russian, 'id': w.id}
        word_list.append(word)

    return HttpResponse(json.dumps(word_list), content_type="application/json")
