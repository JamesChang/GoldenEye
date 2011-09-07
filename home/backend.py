from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User, Permission

from home.models import SinaWeibo

class SinaBackend(ModelBackend):
  def authenticate(self, sinaweiboid=None):
    objs = SinaWeibo.objects.filter(weiboid = sinaweiboid)
    if (len(objs) == 1):
      return objs[0].user
    else:
      return None

  def get_user(self, user_id):
    try:
      return User.objects.get(pk=user_id)
    except User.DoesNotExist:
      return None

