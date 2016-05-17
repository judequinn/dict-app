from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.word_list, name='word_list'),
    url(r'^get_word/(?P<word>[a-zA-Z]+)$', views.get_word),
    url(r'^get_words/$', views.get_words),
]
