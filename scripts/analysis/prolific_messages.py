"""Shared Prolific participant message constants.

Centralises message text so that approve_submissions.py and
send_thank_you.py always use identical wording and can be updated
in one place.
"""

THANK_YOU_MESSAGE = (
    "Hi, thank you for participating in our Technology Adoption Barriers Survey "
    "and for taking the time to respond to our review message. Your submission "
    "has been approved. We appreciate your thoughtful engagement and the insights "
    "you shared — they are valuable to our research. Thank you again for your "
    "contribution!"
)

# Unique substring used to detect whether a thank-you message has already
# been sent to a participant (checked against message body on Prolific).
SIGNATURE = "Your submission has been approved"
