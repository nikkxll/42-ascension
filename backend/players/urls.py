from django.urls import path
from . import views

urlpatterns = [
    path('create-player/', views.create_player, name='create_player'),
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback')
    ]
