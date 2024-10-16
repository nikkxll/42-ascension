from django.urls import path
from . import views

urlpatterns = [
    path('create-player/', views.create_player, name='create_player'),
    path('login/', views.custom_login, name='login'),
    path('logout/<int:id>/', views.custom_logout, name='logout'),
    path('set-display-name/<int:id>/', views.set_display_name, name='set_display_name'),
    path('set-username/<int:id>/', views.set_username, name='set_username'),
    path('upload-avatar/<int:id>/', views.upload_avatar, name='upload_avatar'),
]
