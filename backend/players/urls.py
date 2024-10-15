from django.urls import path
from . import views

urlpatterns = [
    path('create-player/', views.create_player, name='create_player'),
    path('set-display-name/<str:username>/', views.set_display_name, name='set_display_name'),
    path('login/', views.custom_login, name='login'),
    path('logout/<str:username>/', views.custom_logout, name='logout'),
    path('upload-avatar/<str:username>/', views.upload_avatar, name='upload_avatar'),
]
