from functools import wraps
from django.http import JsonResponse
from .sessions import decrypt_session_value


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
