from django.apps import AppConfig
from django.db.models.signals import post_migrate
from django.db import IntegrityError

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Connect the signal to create the player on startup
        post_migrate.connect(create_default_player, sender=self)

def create_default_player(sender, **kwargs):
    # Import inside the function to ensure it's done after apps are ready
    from .models import Player, User  # Import your Player and User models
    # This function will create a default Player instance
    # Check if the player already exists to avoid creating duplicates
    try:
        if not Player.objects.exists():  # If no players exist, create one
            user = User.objects.create_user(
                username='ai_player',
                password='ai_player_password'
            )
            player = Player.objects.create(
                user=user,
                display_name='AI Player'
            )
            print("AI player created!")
    except IntegrityError:
        print("AI already exists.")