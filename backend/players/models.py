from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=30, unique=True)
    avatar = models.ImageField(upload_to='avatars/', default='fallback.png', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Player: {self.display_name}"

# Use signal to remove corresponding user on player deletion
@receiver(post_delete, sender=Player)
def delete_user_with_player(sender, instance, **kwargs):
    # Delete the associated user when the player is deleted
    if instance.user:
        instance.user.delete()


class Tournament(models.Model):
    name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ], default='scheduled')
    winner = models.ForeignKey(Player, on_delete=models.SET('Unknown'), null=True, blank=True, related_name='won_tournaments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tournament: {self.name} - Status: {self.status}"


class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='participants')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    order = models.IntegerField()

    class Meta:
        unique_together = ('tournament', 'player')

    def __str__(self):
        return f"{self.player.display_name} in {self.tournament.name}"


class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches', null=True, blank=True)
    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player1_matches')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='player2_matches')
    round_of = models.IntegerField(null=True, blank=True)
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.ForeignKey(Player, on_delete=models.SET('Unknown'), null=True, blank=True, related_name='won_matches')
    loser = models.ForeignKey(Player, on_delete=models.SET('Unknown'), null=True, blank=True, related_name='lost_matches')
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed')
    ], default='scheduled')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match: {self.player1} vs {self.player2} - Status: {self.status}"


class Friend(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friends')
    friend = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='friend_of')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('online', 'Online'),
        ('offline', 'Offline'),
    ], default='offline')

    class Meta:
        unique_together = ('player', 'friend')

    def __str__(self):
        return f"{self.player.display_name} is friends with {self.friend.display_name}"