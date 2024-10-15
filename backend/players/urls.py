from django.urls import path
from . import views

urlpatterns = [
    path('create-player/', views.create_player, name='create_player'),
    path('login/', views.custom_login, name='login'),
    path('logout/<str:username>/', views.custom_logout, name='logout'),
    path('upload-avatar/<str:username>/', views.upload_avatar, name='upload_avatar'),
]
