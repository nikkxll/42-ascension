import os
import json
from django.contrib.auth.models import User
from django.db import IntegrityError
from .models import Player
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from .decorators import session_authenticated
from .sessions import create_encrypted_session_value
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.http import HttpResponseRedirect, HttpResponse


import requests
from django.utils.crypto import get_random_string
from urllib.parse import urlencode


@csrf_exempt
def create_player(request):
    if request.method == "POST":
        data = json.loads(request.body)

        # Extract required fields from the request body
        username = data.get("username")
        password = data.get("password")
        display_name = data.get("displayName")

        if not username:
            return JsonResponse(
                {"ok": False, "error": "User name is required", "statusCode": 400},
                status=400,
            )
        if not password:
            return JsonResponse(
                {"ok": False, "error": "Password is required", "statusCode": 400},
                status=400,
            )
        # if not display_name:
        #     return JsonResponse({"error": "Display name is required"}, status=400)

        try:
            # Create the user
            user = User.objects.create_user(username=username, password=password)
            # Create the player with the associated user
            player = Player.objects.create(user=user, display_name=display_name)

            # Return success response
            return JsonResponse(
                {
                    "ok": True,
                    "data": {
                        "id": player.user.id,
                        "username": user.username,
                        "displayName": player.display_name,
                    },
                    "statusCode": 201,
                },
                status=201,
            )
        except IntegrityError:
            return JsonResponse(
                {"ok": False, "error": "User already exists", "statusCode": 400},
                status=400,
            )

        except Exception as e:
            return JsonResponse(
                {"ok": False, "error": str(e), "statusCode": 500}, status=500
            )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


@csrf_exempt
def custom_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        # Authenticate the user
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Create a unique session key
            session_key = f"session_{user.id}"

            # Encrypt user session data
            session_value = create_encrypted_session_value(
                {
                    "id": user.id,
                    "username": user.username,
                    "is_authenticated": True,
                }
            )

            # Set the session in the cookies
            response = JsonResponse(
                {
                    "ok": True,
                    "message": f"Login successful for {username}",
                    "data": {"id": user.id, "username": username},
                    "statusCode": 200,
                },
                status=200,
            )
            # response.set_cookie(session_key, session_value, httponly=True, secure=True) // secure will work with HTTPS only
            response.set_cookie(session_key, session_value, httponly=True)

            return response
        else:
            return JsonResponse(
                {"ok": False, "error": "Invalid credentials", "statusCode": 401},
                status=401,
            )
    return JsonResponse(
        {"ok": False, "error": "Method not allowed", "statusCode": 405}, status=405
    )


@csrf_exempt
@session_authenticated()
def custom_logout(request, id):
    if request.method == "POST":
        session_key = f"session_{id}"

        # Check if the session exists for the given user
        if session_key in request.COOKIES:
            # Create a response object
            response = JsonResponse(
                {"ok": True, "message": f"Logged out id:{id}", "statusCode": 200}
            )
            # Delete the session cookie by setting it to an empty value and an expired date
            response.delete_cookie(session_key)
            return response
        else:
            return JsonResponse(
                {
                    "ok": False,
                    "error": f"No active session for id:{id}",
                    "statusCode": 404,
                },
                status=404,
            )
    return JsonResponse(
        {"ok": False, "error": "Method not allowed", "statusCode": 405}, status=405
    )


@csrf_exempt
@session_authenticated()
def update(request, id):
    if request.method == "PATCH":
        message = "New data was set: "
        data = json.loads(request.body)
        new_username = data.get("username")
        new_password = data.get("password")
        new_display_name = data.get("displayName")
        if not new_username and not new_password and not new_display_name:
            return JsonResponse(
                {
                    "ok": False,
                    "error": "You need to provide at least one field",
                    "statusCode": 400,
                },
                status=400,
            )

        try:
            user = User.objects.get(id=id)
            player = Player.objects.get(user=user)
            if new_username:
                user.username = new_username
            if new_password:
                user.password = new_password
            if new_display_name:
                player.display_name = new_display_name
            message += ", ".join(
                [f"{key}: {value}" for key, value in data.items() if value and key != "password"]
            )
            player.save()
        except User.DoesNotExist:
            return JsonResponse(
                {"ok": False, "error": "User not found", "statusCode": 404}, status=404
            )
        except Player.DoesNotExist:
            return JsonResponse(
                {"ok": False, "error": "Player not found", "statusCode": 404},
                status=404,
            )
        except IntegrityError as e:
            return JsonResponse(
                {
                    "ok": False,
                    "error": "Integrity error occurred: " + str(e),
                    "statusCode": 400,
                },
                status=400,
            )
        except Exception as e:
            return JsonResponse(
                {"ok": False, "error": str(e), "statusCode": 500}, status=500
            )
        return JsonResponse(
            {
                "ok": True,
                "message": message,
                "statusCode": 200,
            }
        )

    return JsonResponse({"ok": False, "error": "Invalid request method"}, status=405)


@csrf_exempt
@session_authenticated()
def upload_avatar(request, id):
    if request.method == "POST":
        # Access the raw binary data
        avatar = request.body  # This will contain the binary data of the file

        if not avatar:
            return JsonResponse(
                {"ok": False, "error": "No file uploaded", "statusCode": 400},
                status=400,
            )

        try:
            user = User.objects.get(id=id)
            player = user.player
        except ObjectDoesNotExist:
            return JsonResponse(
                {"ok": False, "error": "Player not found", "statusCode": 404},
                status=404,
            )

        player.avatar.save(f"{id}_avatar.png", ContentFile(avatar), save=True)

        return JsonResponse(
            {
                "ok": True,
                "message": "Avatar uploaded successfully!",
                "data": {
                    "avatar_url": player.avatar.url,
                },
                "statusCode": 200,
            },
            status=200,
        )

    return JsonResponse(
        {"ok": False, "error": "Invalid request method", "statusCode": 405}, status=405
    )


##################################
# 42 Auth
##################################

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
        #state = request.GET.get('state')
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
            user = User.objects.create_user(username=user_data['login'])
            # Create the player with the associated user
            player = Player.objects.create(
                user=user, display_name=user_data['displayname'])

            # Return success response
            file_path = os.path.join(os.path.dirname(__file__), 'callback.html')
            file = open(file_path, 'r')
            html_content = file.read()
            return HttpResponse(html_content)
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
        return {'error': f'Token exchange failed: {str(e)}'}
