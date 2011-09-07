#encoding:utf-8

import datetime, time, logging 

from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

from weibopy.api import API
from weibopy.error import WeibopError

logger = logging.getLogger("goldeneye.model")

__all__ = ['SinaWeibo', 'Keyword', 'Candidate']

daily_reset_time = datetime.time(3,28)
def daily_today():
    n = datetime.datetime.now()
    if n.time() > daily_reset_time:
        return n.date()
    else:
        return n - datetime.timedelta(1)

def handle_exception(self, exp):
    if not hasattr(exp, "code"):
        logger.error(exp)
        raise exp
    c = exp.code
    if exp.code == '40033':
      logger.warn("deleting %s cause of %s"%(self, exp.reason))
      self.delete()
      return
    if exp.code == '40028' and exp.reason.find(u"根据对方的设置") >=0:
      self.delete()
      return
    else:
      raise exp

class SinaWeibo(models.Model):
  name = models.CharField(max_length=100)
  weiboid = models.CharField(max_length=20)
  user = models.ForeignKey(User,null=True)
  access_token = models.CharField(max_length=200)
  access_secret = models.CharField(max_length=200)
  daily_quota = models.IntegerField(default=50)
  daily_followed = models.IntegerField(default=0)
  daily_last = models.DateField(default=daily_today())
  
  def __unicode__(self):
    return u'[Sina]' + self.name

  def get_auth(self):
    from weibopy.auth import OAuthHandler
    from weibopy.oauth import OAuthToken
    auth = OAuthHandler(settings.SINA_CONSUMER_KEY, settings.SINA_CONSUMER_SECRET)
    auth.access_token = OAuthToken(self.access_token, self.access_secret)
    return auth

  def get_api(self, auth = None):
    if auth is None: 
      auth = self.get_auth()
    from weibopy.api import API
    api = API(auth)
    return api

  @classmethod
  def get_by_user(cls, user):
    query = cls.objects.filter(user = user)
    if (len(query) >= 1):
      return query[0]
    else:
      return None

  def reset_daily_quota(self):
    self.daily_last = daily_today()
    self.daily_followed = 0

  def check_reset_daily_quota(self):
    if self.daily_last != daily_today():
        self.reset_daily_quota()

  def can_follow(self):
    if self.daily_last != daily_today():
        return True
    return self.daily_followed < self.daily_quota

  @property
  def daily_remained_quota(self):
    self.check_reset_daily_quota()
    t = self.daily_quota - self.daily_followed
    if t<0: t=0
    return t
 
  @property
  def idle_days(self):
    if self.daily_last is None:
      self.reset_daily_quota()
    time_delta = daily_today() - self.daily_last
    return time_delta.days
      

  def daily_follow(self):
    loop_count = 0
    escaped = []
    while(loop_count < 5):
        loop_count +=1
        remained_quota = self.daily_remained_quota
        print remained_quota
        if (remained_quota<=0):
            break
        qs = Candidate.get_by_user(self.user).filter(managed__isnull=True).order_by('-priority') 
        qs = qs[:remained_quota + len(escaped)]
        print len(qs)
        if (len(qs)==0):
            break
        for c in qs:
          if c.weiboid in escaped:
            print escaped
            continue
          try:
            c.follow()
            c.managed=True
            c.save()
          except WeibopError, e:
            print e
            escaped.append(c.weiboid)
            try:
              handle_exception(c, e)
            except Exception ,e2:
              if hasattr(e2,"code"):
                code = e2.code
                if e2.code == '40304':
                  return
              pass


  def get_follow_graph(self):
    from django.db import connection, transaction
    cursor = connection.cursor()
    upper_date = (datetime.datetime.now() - datetime.timedelta(60)).date()
    cursor.execute("""select date(follow_date), count(*) from home_candidate where user_id = %s and follow_date >= %s group by date(follow_date)""", [self.user.id, upper_date]) 
    rows = cursor.fetchall()

    data = dict((row[0], [row[1], 0]) for row in rows)

    #x_axis = [row[0] for row in rows]
    #followed = [row[1] for row in rows]

     
    cursor.execute("""select date(follow_date), count(*) from home_candidate where user_id = %s and followed_back and follow_date >= %s GROUP BY date(follow_date) """, [self.user.id, upper_date]) 
    rows = cursor.fetchall()
    #following_back = [row[1] for row in rows]
    for row in rows:
        item = data.get(row[0],None)
        if item is None: continue;
        item[1]= row[1]
    return data

class Keyword(models.Model):
  value = models.CharField(max_length=200)
  sina = models.ForeignKey(SinaWeibo)
  enabled = models.BooleanField(null=False, default=True)

  def __unicode__(self):
    return self.value
 
def collect_candidate(user, auth, keyword):
  api = API(auth)
  weibo_list = api.search(q=keyword)
  for weibo in weibo_list:
    o = Candidate.get_by_id(user, weibo.from_user_id)
    if o is not None:
      o.priority += 1
      o.save()
    else:
      o = Candidate()
      o.name = weibo.from_user
      o.weiboid = weibo.from_user_id
      o.user = user
      o.priority = 1
      o.save()
  

def follow_all(user, auth):
  api = API(auth)
  candidates = Candidate.get_by_user(user).filter(follow_date = None)
  for c in candidates:
    try:
      d = api.create_friendship(user_id = c.weiboid)
      c.follow_date = datetime.datetime.now()
      c.save()
    except WeibopError,e:
      #没有接口能够轻易的判断出错误原因。
      #很可能是已经关注了 
      c.delete()  

def clear_all(user):
  candidates = Candidate.get_by_user(user).filter(follow_date = None)
  candidates.delete()
  

class Candidate(models.Model):
  name = models.CharField(max_length=100)
  weiboid = models.CharField(max_length=20, primary_key=True)
  user = models.ForeignKey(User,db_index=True)
  priority = models.FloatField(default=0.0)
  follow_date = models.DateTimeField(null=True)
  unfollow_date = models.DateTimeField(null=True)
  following = models.NullBooleanField(null=True)
  followed_back = models.NullBooleanField(null=True)
  followed_back_date = models.DateTimeField(null=True)
  managed = models.NullBooleanField()
  update_date = models.DateTimeField(default=datetime.datetime(2011,1,1))
  text = models.TextField()

  class OutOfQuota(Exception):
    pass
  
 
  @classmethod 
  def get_by_id(cls, user, weiboid):
    s = cls.objects.filter(user = user).filter(weiboid = weiboid).all()
    if (len(s)>0):
      return s[0]
    else:
      return None

  @classmethod
  def get_by_user(cls, user):
    q = cls.objects.filter(user = user)
    return q

  def handle_exception(self, exp):
    c = exp.code
    if exp.code == '40033':
      logger.warn("deleting %s cause of %s"%(self, exp.reason))
      self.delete()
      return
    else:
      raise exp
 
  def follow(self, check_quota = True):
    weibo = SinaWeibo.get_by_user(self.user) 

    api = weibo.get_api()
    try:
      source, target = api.show_friendship(target_id = self.weiboid)
      if (source.following):
        self.following = True
        self.save()
        return
#      print self.name, self.follow_date
      d = api.create_friendship(user_id = self.weiboid)
      if self.follow_date is None:
#          print weibo.daily_followed
          weibo.check_reset_daily_quota()
          if check_quota and  weibo.daily_followed >= weibo.daily_quota:
            raise self.OutOfQuota
          weibo.daily_followed +=1
#          print weibo.daily_followed
          weibo.save()
      self.follow_date = datetime.datetime.now()
      self.following = True
      self.save()
    except WeibopError, e:
      handle_exception(self, e)


  def unfollow(self):
    
    auth = SinaWeibo.get_by_user(self.user) 
    api = auth.get_api()
    try:
      source, target = api.show_friendship(target_id = self.weiboid)
      if (not source.following):
        self.following = False
        self.save()
        return
      d = api.destroy_friendship(user_id = self.weiboid)
      self.unfollow_date = datetime.datetime.now()
      self.following = False
      self.save()
    except WeibopError, e:
      handle_exception(self, e)

  def update(self):
    api = SinaWeibo.get_by_user(self.user).get_api()
    try:
      source, target = api.show_friendship(target_id = self.weiboid)
      if (self.following != source.following):
        self.following = source.following
      if not self.followed_back and source.followed_by:
        self.followed_back_date = datetime.datetime.now()
      if self.followed_back and not source.followed_by:
        logger.info("UNFO %s by %s" % (source.screen_name, target.screen_name))
      if (self.followed_back != source.followed_by):
        self.followed_back = source.followed_by
      self.update_date = datetime.datetime.now()
      self.save()
    except WeibopError, e:
      handle_exception(self,e)

  def __unicode__(self):
    return "%s(%s)"%(self.name, self.weiboid)

  def managed_string(self):
    if self.managed is None:
        return "No"
    elif self.managed == True:
        return "Yes"
    elif self.managed == False:
        return "Manual"
