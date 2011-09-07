

# Unfollow Service


import time, datetime
from django.conf import settings
from home.models import Candidate

def run():

  print 'Starting Unfollow Service'
 
  idle = 60*5 
  apm = 2
  sleeping_time = 60/2
  
  threshold = datetime.datetime.now()- datetime.timedelta(7)

  while(True):

    qs = Candidate.objects.filter(managed=True).filter(following=True).filter(follow_date__lte=threshold)
    qs = qs[:100]

    if len(qs)==0:
      print 'nothing to do'
      time.sleep(idle)
      continue

    for c in qs:
#      c.update()
      if c.following:
        print 'unfollowing ', c.name, ' of ', c.user.username
        c.unfollow()
      
      time.sleep(sleeping_time)
