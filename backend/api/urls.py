from django.urls import path
from . import views

urlpatterns = [
    path("csrf/", views.get_csrf_token, name="csrf"),
    path("players/", views.manage_players, name="manage_players"),
    path("players/<int:id>/", views.manage_player, name="manage_player"),
    path('players/<int:id>/avatar/', views.upload_avatar, name='upload_avatar'),
    path('players/<int:id>/stats/', views.get_player_stats, name='get_player_stats'),
    path("players/<int:id>/friends/", views.manage_friends, name="manage_friends"),
    path("players/<int:id>/friends/manage/", views.manage_friend_request, name="manage_friend"),
    path("players/<int:id>/matches/", views.get_player_matches, name="get_player_matches"),
    path("tournaments/", views.manage_tournaments, name="manage_tournaments"),
    path("tournaments/current/", views.get_current_sessions_tournament, name="get_current_sessions_tournament"),
    path("tournaments/<int:id>/", views.get_tournament, name="get_tournament"),
    path("tournaments/<int:id>/matches/", views.manage_tournament_match, name="manage_tournament_match"),
    path("matches/", views.manage_matches, name="manage_matches"),
    path("matches/<int:id>/", views.manage_match_update, name="manage_match_update"),
    path('auth/login/', views.custom_login, name='login'),
    path('auth/logout/<int:id>/', views.custom_logout, name='logout'),
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback')
]
