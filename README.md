# PromiseIssue
I am struggling to add in removing users from private channels if they have been blocked.

I think my main issue coming from resolving promises correctly.  I have been watching videos and trying different possible solutions for about 16 hours and have been banging my head against the wall on this issue.

There is a file that correctly pulls down all private channels without blocking users.  I am trying to add a snapshot for blocked users and filter out users which are blocked.  The issue file is my most current file that doesn't work due to:

TypeError: Cannot read property 'channelId' of undefined
