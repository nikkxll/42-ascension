# Constants used in models.py

# TOURNAMENT_STATUS_CHOICES = [
#     # ('scheduled', 'Scheduled'),
#     ('in_progress', 'In Progress'),
#     ('completed', 'Completed')
# ]

# ROUND_CHOICES = [
#     ('SF', 'Semifinals'),
#     ('F', 'Final')
# ]

# MATCH_STATUS_CHOICES = [
#     ('scheduled', 'Scheduled'),
#     # ('in_progress', 'In Progress'),
#     ('completed', 'Completed')
# ]

# ACTIVITY_STATUS_CHOICES = [
#     ('online', 'Online'),
#     ('offline', 'Offline')
# ]

FRIENDSHIP_STATUS_CHOICES = [
    ('pending_first_second', 'Pending (first -> second)'),
    ('pending_second_first', 'Pending (second -> first)'),
    ('friends', 'Friends')
]
# Other constants to specify

# Names of the keys for Match model
PLAYER_KEYS = ["player1", "player2", "player3", "player4"]
WINNER_LOSER_KEYS = ["winner1", "winner2", "loser1", "loser2"]

# AI Player User ID
AI_ID = 1