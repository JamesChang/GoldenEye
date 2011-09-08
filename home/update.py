# Unfollow Service

import time, datetime
import logging
from django.conf import settings
from home.models import Candidate

logger = logging.getLogger('goldeneye.service.update')

def run():

  logger.info('Starting update Service')
 
  idle = 60*5 
  apm = 10
  sleeping_time = 60/apm
  

  while(True):
    threshold = datetime.datetime.now()- datetime.timedelta(1)

    qs = Candidate.objects.filter(managed__isnull=False).filter(update_date__lte=threshold)
    qs = qs[:100]

    if len(qs)==0:
      logger.debug("nothing to do")
      time.sleep(idle)
      continue

    for c in qs:
      logger.debug("updateing %s of %s"%(c.name, c.user.username))
      c.update()
      time.sleep(sleeping_time)
