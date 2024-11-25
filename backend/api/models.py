from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from .constants import (
    # TOURNAMENT_STATUS_CHOICES,
    # ROUND_CHOICES,
    # MATCH_STATUS_CHOICES,
    # ACTIVITY_STATUS_CHOICES,
    FRIENDSHIP_STATUS_CHOICES,
)


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=30, unique=True, blank=True, null=True)
    avatar = models.ImageField(
        upload_to="avatars/", default="avatars/fallback.png", blank=True
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    last_active_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.display_name if self.display_name else self.user.username


# Use signal to remove corresponding user on player deletion
@receiver(post_delete, sender=Player)
def delete_user_with_player(sender, instance, **kwargs):
    # Delete the associated user when the player is deleted
    if instance.user:
        instance.user.delete()


class Tournament(models.Model):
    name = models.CharField(
        max_length=100, null=False, blank=False, default="Unnamed Tournament"
    )
    # status = models.CharField(
    #     max_length=20, choices=TOURNAMENT_STATUS_CHOICES, default="in_progress"
    # )  # Status of the tournament
    winner = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="won_tournaments",
    )  # Winner of the tournament
    created_at = models.DateTimeField(auto_now_add=True)  # Date of tournament creation
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Tournament: {self.name}"


# Association table for players and tournaments
class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name="participants"
    )  # Tournament the player is participating in
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE
    )  # Player participating in the tournament
    order = (
        models.IntegerField()
    )  # Order of the player in the tournament (For seeding purposes)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["tournament", "player"], name="unique_tournament_participant"
            )
        ]

    def __str__(self):
        return f"{self.player.display_name} in {self.tournament.name}"


class Match(models.Model):
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.SET_NULL,
        related_name="matches",
        null=True,
        blank=True
    )  # Tournament the match is part of
    player1 = models.ForeignKey(
        Player, on_delete=models.SET_NULL, null=True, related_name="player1_matches", default=None
    )
    player2 = models.ForeignKey(
        Player, on_delete=models.SET_NULL, null=True, related_name="player2_matches", default=None
    )
    player3 = models.ForeignKey(
        Player, on_delete=models.SET_NULL, null=True, related_name="player3_matches", default=None
    )
    player4 = models.ForeignKey(
        Player, on_delete=models.SET_NULL, null=True, related_name="player4_matches", default=None
    )
    winner1 = models.ForeignKey(
        Player, on_delete=models.SET_NULL, null=True, related_name="winner1_matches", default=None
    )
    winner2 = models.ForeignKey(
        Player, on_delete=models.SET_NULL, null=True, related_name="winner2_matches", default=None
    )
    # round_stage = models.CharField(
    #     max_length=2, choices=ROUND_CHOICES, null=True, blank=True
    # )
    score = models.CharField(null=True, blank=True)
    loser1 = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="loser1_matches",
        default=None
    )
    loser2 = models.ForeignKey(
        Player,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="loser2_matches",
        default=None
    )
    # status = models.CharField(
    #     max_length=20, choices=MATCH_STATUS_CHOICES, default="scheduled"
    # )
    duration = models.DurationField(null=True, blank=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        is_match_of_4 = self.player3 and self.player4
        return f"Match {self.player1.user.username}{' and ' + self.player2.user.username if is_match_of_4 else ''} vs {self.player3.user.username + 'and ' + self.player4.user.username if is_match_of_4 else self.player2.user.username}"


class Friendship(models.Model):
    player1 = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="friends_as_player1"
    )
    player2 = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="friends_as_player2"
    )
    status = models.CharField(
        max_length=20, choices=FRIENDSHIP_STATUS_CHOICES, default="pending_first_second"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["player1", "player2"], name="unique_friend_for_player"
            ),
            models.CheckConstraint(
                check=models.Q(player1__lt=models.F("player2")),
                name="player1_lt_player2",
            ),
        ]

    def __str__(self):
        return f"{self.player1.display_name if self.player1.display_name else self.player1.user.username} is friends with {self.player2.display_name if self.player2.display_name else self.player2.user.username}"
