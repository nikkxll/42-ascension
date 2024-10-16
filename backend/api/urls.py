from django.urls import path
from . import views

urlpatterns = [
    path('players/', views.create_player, name='create_player'),
    path('players/<int:id>/', views.update, name='update'),
    # path('set-display-name/<int:id>/', views.set_display_name, name='set_display_name'),
    # path('set-username/<int:id>/', views.set_username, name='set_username'),
    path('players/<int:id>/avatar/', views.upload_avatar, name='upload_avatar'),
    path('auth/login/', views.custom_login, name='login'),
    path('auth/logout/<int:id>/', views.custom_logout, name='logout'),
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback')
]
