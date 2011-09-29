#encoding:utf-8
import time, datetime, logging

from home.models import *
from weibopy.error import WeibopError

def comb(items, n=None):
    if n is None: n=len(items)
#    if len(items)<n: return []
#    if len(items)==n: return items
    for i in range(len(items)):
        v = items[i:i+1]
        if n==1:
            yield v
        else:
            rest = items[i+1:]
            for c in comb(rest, n-1):
                yield v+c

def fullcomb(items, min=None):
    if min is None: min=1
    for i in range(min,len(items)+1):
        for c in comb(items, i):
            yield c

pool_high = 50
pool_mid = pool_high * 2
pool_size = pool_high * 4

banned_source = [
  u'淘宝网',u'微淘网',u'一键营销',u'五星服务',u'听众微博营销',u'我爱马克',
  u'Aiee微博定时',u'定时showone',u'皮皮时光机',u'月光宝盒',u'定时V',u'时光机',u'定时微',u'贴心小管家',u'定时微博',
]


class CollectionService(object):

    logger = logging.getLogger('goldeneye.service.collect')
    def start(self):
        self.logger.info('Starting Collection Service')
        self.idle_time = 60*5
        apm = 4
        self.sleeping_time = 60/apm

        while(True):
            accounts = SinaWeibo.objects.all()
            for account in accounts:
                try:
                    self.search_one_account(account)
                except WeibopError,e:
                    if hasattr(e,"code") and e.code == "40028":
                        self.logger.error("Sina API Error %s"%e.reason)
                    else:
                        raise e
            time.sleep(self.idle_time)

    def get_threshood(self, sina):
        from django.db import connection, transaction
        cursor = connection.cursor()
        cursor.execute("select min(priority) from (select priority from home_candidate where user_id = %s and managed is NULL order by priority desc limit %s) t;", [sina.user.id, pool_size])
        row = cursor.fetchone()
        min_priority =  row[0]
        cursor.execute("select count(*) from home_candidate where user_id = %s and managed is NULL", [sina.user.id])
        row = cursor.fetchone()
        c = row[0]
        if (c<pool_mid):
            return 0
        else:
            return min_priority
        
    def search_one_account(self,sina):
        keywords = Keyword.objects.filter(enabled=True).filter(sina=sina).all()
        key_combos = fullcomb(keywords,1)
        for ks in key_combos:
            t = self.get_threshood(sina)
            self.logger.debug('Searching %s, with threshood=%s' % (str(ks), t))
            self.search_one_keyword(ks, t)
            time.sleep(self.sleeping_time)
    
    def search_one_keyword(self,kws, threshood=0.0):
       
        sinas = set([kw.sina for kw in kws])
        assert len(sinas) == 1
        sina = list(sinas)[0]
        user = sina.user
        api = sina.get_api()
        keywords = Keyword.objects.filter(enabled=True).filter(sina=sina).all()

        weibo_list = api.search(q=" ".join([ kw.value for kw in kws]))
        for weibo in weibo_list:
            if int(weibo.from_user_id) == int(sina.weiboid):
                continue

            if weibo.text.find("http://t.cn/")>=0 or weibo.text.find("http://sinaurl.cn/")>=0:
                continue

            if weibo.source in banned_source:
                continue
            #rate
            ks = [k for k in keywords if weibo.text.lower().find(k.value.lower())>=0 ]
            new_rating = len(ks)
            if new_rating <= threshood:
               continue 

            o = Candidate.get_by_id(user, weibo.from_user_id)
            if (o is None):
                o = Candidate()
                o.name = weibo.from_user
                o.weiboid = weibo.from_user_id
                o.user = user
                o.save()

            print new_rating, weibo.text, weibo.from_user, o.priority
            if (new_rating > o.priority):
                o.priority = new_rating
                o.text = weibo.text
                o.textid = str(weibo.id)
                o.save()


    

