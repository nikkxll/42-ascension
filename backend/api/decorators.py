from functools import wraps
from django.http import JsonResponse
from .sessions import decrypt_session_value


# Decorator factory which return a decorator for different role authorization
# strict=True authentication will also check if corresponding session_id has correct user id
# strict=False only checks if any session is logged in

def session_authenticated(strict=False):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            id = kwargs.get("id")
            session_value = None

            # Check passed id (usually passed form the API endpoint URL, e.g. /players/2/)
            if (id):
                session_key = f"session_{id}"
                session_value = request.COOKIES.get(session_key)
            # No ID in URL, then trying to authenticate with any available session
            elif (strict == False):
                for cookie_key, session in request.COOKIES.items():
                    # Check if the cookie key starts with 'session_'
                    if cookie_key.startswith("session_"):
                        print()
                        # Extract the id from the session key (e.g., 'session_1' -> '1')
                        session_value = session
                        break

            print("Trying to authenticate!!!")
            print("Session value: ", session_value)
            if session_value:
                session_data = decrypt_session_value(session_value)
                print(session_data)
                if (
                    session_data
                    and session_data.get("is_authenticated")
                    and (strict==False or session_data.get("id") == id)
                ):
                    return func(request, *args, **kwargs)

            return JsonResponse(
                {
                    "ok": False,
                    "error": "Unauthorized or invalid session",
                    "statusCode": 401,
                },
                status=401,
            )

        return wrapper

    return decorator

def session_authenticated_logged_in(func):
    return session_authenticated()(func)

def session_authenticated_id(func):
    return session_authenticated(strict=True)(func)