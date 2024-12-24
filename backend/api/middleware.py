from .sessions import decrypt_session_value
from .models import User
from django.utils import timezone
import re


class LastActiveMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        invalid_cookies = []
        for cookie_key, session_value in request.COOKIES.items():
            # Check if the cookie key starts with 'session_'
            if cookie_key.startswith("session_"):
                session_data = decrypt_session_value(session_value)
                if session_data:
                    try:
                        user = User.objects.get(id=session_data["id"])
                        player = user.player
                        player.last_active_at = timezone.now()
                        player.save()
                    except Exception as e:
                        print("Error in middleware: ", str(e))
                else:
                    invalid_cookies.append(cookie_key) 
    
        response = self.get_response(request)
        for cookie_key in invalid_cookies:
            response.delete_cookie(cookie_key)
    
        return response
