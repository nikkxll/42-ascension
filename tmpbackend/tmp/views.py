from django.http import JsonResponse
import time
# Create your views here.
def index(req):
    return JsonResponse({"player1": "me", "player2": "you"})