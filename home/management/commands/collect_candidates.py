from django.core.management.base import BaseCommand, CommandError
from home.models import *

MAX = 200

class Command(BaseCommand):

  def handle(self, *args, **kwargs):
    while(True):
#      self.update_all()
      self.once(self, *args, **kwargs)
      time.sleep(60*3)
  
  def once(self, *args, **kwargs):
    
    keywords = Keyword.objects.filter(enabled=True).all()
    for k in keywords:
      print "handling %s" % k
      weibo = k.sina
      user = weibo.user
      candidates = Candidate.objects.filter(follow_date__isnull=True).filter(user=user).count()
      if (candidates > 200):
   
        continue
      auth = weibo.get_auth()
      collect_candidate(user, auth, k.value)

  SLEEP = 30
  def update_all(self, *args, **kwargs):
     
    candidates = Candidate.objects.all()
    for c in candidates:
      print 'updating ', c.name
      c.update()
      time.sleep(self.SLEEP)
        
