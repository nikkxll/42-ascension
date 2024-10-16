from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from .constants import (
    TOURNAMENT_STATUS_CHOICES,
    ROUND_CHOICES,
    MATCH_STATUS_CHOICES,
    FRIEND_ACTIVITY_STATUS_CHOICES
)

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=30, unique=True, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/fallback.png', blank=True)
    status = models.CharField(max_length=20,
                              choices=FRIEND_ACTIVITY_STATUS_CHOICES,
                              default='offline') # Status of the friend
    created_at = models.DateTimeField(default=timezone.now) # Date of account creation
    updated_at = models.DateTimeField(auto_now=True) # Date of last account update

    def __str__(self):
        return self.display_name if self.display_name else self.user.username

# Use signal to remove corresponding user on player deletion
@receiver(post_delete, sender=Player)
def delete_user_with_player(sender, instance, **kwargs):
    # Delete the associated user when the player is deleted
    if instance.user:
        instance.user.delete()


class Tournament(models.Model):
    name = models.CharField(max_length=100) # Name of the tournament
    status = models.CharField(max_length=20,
                              choices=TOURNAMENT_STATUS_CHOICES,
                              default='scheduled') # Status of the tournament
    winner = models.ForeignKey(Player,
                               on_delete=models.SET_NULL,
                               null=True,
                               blank=True,
                               related_name='won_tournaments') # Winner of the tournament
    created_at = models.DateTimeField(auto_now_add=True) # Date of tournament creation

    def __str__(self):
        return f"Tournament: {self.name} - Status: {self.status}"

# Association table for players and tournaments
class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(Tournament,
                                   on_delete=models.CASCADE,
                                   related_name='participants') # Tournament the player is participating in
    player = models.ForeignKey(Player, on_delete=models.CASCADE) # Player participating in the tournament
    order = models.IntegerField() # Order of the player in the tournament (For seeding purposes)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['tournament', 'player'], name='unique_tournament_participant')
    ]

    def __str__(self):
        return f"{self.player.display_name} in {self.tournament.name}"


class Match(models.Model):
    tournament = models.ForeignKey(Tournament,
                                   on_delete=models.SET_NULL,
                                   related_name='matches',
                                   null=True,
                                   blank=True) # Tournament the match is part of
    player1 = models.ForeignKey(Player,
                                on_delete=models.SET_NULL,
                                null=True,
                                related_name='player1_matches') # First player in the match
    player2 = models.ForeignKey(Player,
                                on_delete=models.SET_NULL,
                                null=True,
                                related_name='player2_matches') # Second player in the match
    round_stage = models.CharField(max_length=2, choices=ROUND_CHOICES, null=True, blank=True)
    player1_score = models.IntegerField(null=True, blank=True) # Score of player 1
    player2_score = models.IntegerField(null=True, blank=True) # Score of player 2
    winner = models.ForeignKey(Player,
                               on_delete=models.SET_NULL,
                               null=True,
                               blank=True,
                               related_name='won_matches') # Winner of the match
    loser = models.ForeignKey(Player,
                              on_delete=models.SET_NULL,
                              null=True,
                              blank=True,
                              related_name='lost_matches') # Loser of the match
    status = models.CharField(max_length=20,
                              choices=MATCH_STATUS_CHOICES,
                              default='scheduled') # Status of the match
    created_at = models.DateTimeField(auto_now_add=True) # Date of match creation

    def __str__(self):
        return f"Match: {self.player1} vs {self.player2} - Status: {self.status}"


class Friend(models.Model):
    player = models.ForeignKey(Player,
                               on_delete=models.CASCADE,
                               related_name='friends') # Player who has the friend
    friend = models.ForeignKey(Player,
                               on_delete=models.CASCADE,
                               related_name='friend_of') # Player who is the friend
    created_at = models.DateTimeField(auto_now_add=True) # Date of friendship creation

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['player', 'friend'], name='unique_friend_for_player')
    ]

    def __str__(self):
        return f"{self.player.display_name if self.player.display_name else self.player.user.username} is friends with {self.friend.display_name}"
