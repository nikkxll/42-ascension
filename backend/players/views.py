import os
import json
from django.contrib.auth.models import User
from .models import Player
from django.views.decorators.csrf import csrf_exempt
from functools import wraps
from django.contrib.auth import authenticate, login, logout
from django.core import signing
from django.core.files.base import ContentFile
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse


# Decorator factory which return a decorator for different role authorization
def session_authenticated(required_role=None):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            username = kwargs.get("username")
            session_key = f"session_{username}"
            session_value = request.COOKIES.get(session_key)

            # print("Trying to authenticate!!!")
            # print("Session value: ", session_value)
            if session_value:
                session_data = decrypt_session_value(session_value)
                print(session_data)
                if session_data and session_data.get("is_authenticated"):
                    # if required_role and session_data.get("role") != required_role:
                    #     return JsonResponse({"error": "Permission denied"}, status=403)

                    return func(request, *args, **kwargs)

            return JsonResponse(
                {"error": "Unauthorized or invalid session"}, status=401
            )

        return wrapper

    return decorator


# Helper function to create encrypted session value
def create_encrypted_session_value(data):
    signed_data = signing.dumps(data, salt=os.environ.get("AUTH_SALT"))
    return signed_data


# Helper function to decrypt session value
def decrypt_session_value(signed_data):
    try:
        data = signing.loads(signed_data, salt=os.environ.get("AUTH_SALT"))
        return data
    except signing.BadSignature:
        return None  # Invalid or tampered session data


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
            session_key = f"session_{username}"

            # Encrypt user session data
            session_value = create_encrypted_session_value(
                {
                    "username": user.username,
                    "is_authenticated": True,
                }
            )

            # Set the session in the cookies
            response = JsonResponse({"message": f"Login successful for {username}"})
            # response.set_cookie(session_key, session_value, httponly=True, secure=True) // secure will work with HTTPS only
            response.set_cookie(session_key, session_value, httponly=True)

            return response
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
@session_authenticated()
def custom_logout(request, username):
    if request.method == "POST":
        # data = json.loads(request.body)
        # username = data.get("username")
        session_key = f"session_{username}"

        # Check if the session exists for the given user
        if session_key in request.COOKIES:
            # Create a response object
            response = JsonResponse({"message": f"Logged out {username}"})
            # Delete the session cookie by setting it to an empty value and an expired date
            response.delete_cookie(session_key)
            return response
        else:
            return JsonResponse(
                {"error": f"No active session for {username}"}, status=404
            )
    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def create_player(request):
    if request.method == "POST":
        data = json.loads(request.body)

        # Extract required fields from the request body
        username = data.get("username")
        password = data.get("password")
        display_name = data.get("displayName")

        if not username:
            return JsonResponse({"error": "User name is required"}, status=400)
        if not password:
            return JsonResponse({"error": "Password is required"}, status=400)
        if not display_name:
            return JsonResponse({"error": "Display name is required"}, status=400)

        try:
            # Create the user
            user = User.objects.create_user(username=username, password=password)
            # Create the player with the associated user
            player = Player.objects.create(user=user, display_name=display_name)

            # Return success response
            return JsonResponse(
                {
                    "id": player.id,
                    "username": user.username,
                    "displayName": player.display_name,
                },
                status=201,
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
@session_authenticated()
def upload_avatar(request, username):
    if request.method == 'POST':
        # Access the raw binary data
        avatar = request.body  # This will contain the binary data of the file

        if not avatar:
            return JsonResponse({'error': 'No file uploaded'}, status=400)

        try:
            user = User.objects.get(username=username)
            # Then access the related Player object
            player = user.player  # Assuming a OneToOne relationship with Player model
        except ObjectDoesNotExist:

            return JsonResponse({'error': 'Player not found'}, status=404)

        # # Assuming player.avatar is a FileField or ImageField
        player.avatar.save(f'{username}_avatar.png', ContentFile(avatar), save=True)

        return JsonResponse({
            'message': 'Avatar uploaded successfully!',
            'avatar_url': player.avatar.url
        }, status=200)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

#
# Authentication
#


# @csrf_exempt  # Disable CSRF just for demonstration; better to use tokens in production
# def custom_login(request):
#     if request.method == 'POST':
#         # Parse the JSON data sent in the request body
#         data = json.loads(request.body)

#         username = data.get('username')
#         password = data.get('password')

#         # Authenticate the user
#         user = authenticate(request, username=username, password=password)
#         if user is not None:
#             login(request, user)  # Log the user in
#             return JsonResponse({'message': 'Login successful'}, status=200)
#         else:
#             return JsonResponse({'error': 'Invalid credentials'}, status=401)

#     return JsonResponse({'error': 'Invalid method'}, status=400)


# @csrf_exempt
# def custom_logout(request):
#     if request.method == 'POST':
#         logout(request)  # Log the user out
#         return JsonResponse({'message': 'Logout successful'}, status=200)

#     return JsonResponse({'error': 'Invalid method'}, status=400)
