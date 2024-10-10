from django.contrib.auth.models import User
from django.http import JsonResponse
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.utils.crypto import get_random_string
from urllib.parse import urlencode
from .models import Player
import json
import requests
import os
import json


@csrf_exempt
def create_player(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        # Extract required fields from the request body
        username = data.get('username')
        password = data.get('password')
        display_name = data.get('displayName')
        if not username:
            return JsonResponse({'error': 'User name is required'}, status=400)
        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)
        if not display_name:
            return JsonResponse({'error': 'Display name is required'}, status=400)

        try:
            # Create the user
            user = User.objects.create_user(
                username=username, password=password)
            # Create the player with the associated user
            player = Player.objects.create(
                user=user, display_name=display_name)

            # Return success response
            return JsonResponse({
                'id': player.id,
                'username': user.username,
                'displayName': player.display_name,
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

# def upload_avatar(request, player_id):
#     if request.method == 'POST':
#         avatar = request.FILES.get('avatar')

#         if not avatar:
#             return JsonResponse({'error': 'No file uploaded'}, status=400)

#         try:
#             player = Player.objects.get(pk=player_id)
#         except ObjectDoesNotExist:
#             return JsonResponse({'error': 'Player not found'}, status=404)

#         player.avatar = avatar
#         player.save()

#         return JsonResponse({
#             'message': 'Avatar uploaded successfully!',
#             'avatar_url': player.avatar.url
#         }, status=200)

#     return JsonResponse({'error': 'Invalid request method'}, status=405)


def oauth_redirect(request):
    # Get OAuth parameters from environment variables
    client_id = os.environ.get('OAUTH_CLIENT_ID')
    redirect_uri = os.environ.get('OAUTH_REDIRECT')
    state = get_random_string(32)
    request.session['oauth_state'] = state
    base_url = 'https://api.intra.42.fr/oauth/authorize'
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'state': state
    }
    auth_url = f"{base_url}?{urlencode(params)}"
    return HttpResponseRedirect(auth_url)


def oauth_callback(request):

    if request.method == 'GET':
        # state = request.GET.get('state')
        code = request.GET.get('code')
        if not code:
             return JsonResponse({'error': 'No code provided'}, status=400)
        token_response = exchange_code_for_token(code)
        if 'error' in token_response:
            return JsonResponse(token_response, status=400)
        user_data = fetch_42_user_data(token_response['access_token'])
        if 'error' in user_data:
            return JsonResponse(user_data, status=400)
        try:
            # Create the user
            user = User.objects.create_user(username=f'aaaabsdf{user_data['login']}')
            # Create the player with the associated user
            player = Player.objects.create(
                user=user, display_name=f'aaaabsdf{user_data['displayname']}')

            # Return success response
            return HttpResponseRedirect('http:://localhost/callback.html')

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


def fetch_42_user_data(access_token):
    api_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': f'Failed to fetch user data: {str(e)}'}


def exchange_code_for_token(code):
 token_url = 'https://api.intra.42.fr/oauth/token'
 data = {
       'grant_type': 'authorization_code',
        'client_id': os.environ.get('OAUTH_CLIENT_ID'),
        'client_secret': os.environ.get('OAUTH_CLIENT_SECRET'),
        'code': code,
        'redirect_uri': os.environ.get('OAUTH_REDIRECT'),
       }
 try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        return response.json()
 except requests.exceptions.RequestException as e:
        return {'error': 'Token exchange failed: {str(e)}'}
