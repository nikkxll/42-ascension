from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=30, unique=True, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', default='fallback.png', blank=True)

    def __str__(self):
        return self.display_name if self.display_name else self.user.username


# Use signal to remove corresponding user on player deletion
@receiver(post_delete, sender=Player)
def delete_user_with_player(sender, instance, **kwargs):
    # Delete the associated user when the player is deleted
    if instance.user:
        instance.user.delete()
