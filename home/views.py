#coding=utf-8
import logging
import json
import functools

from django.shortcuts import render_to_response
from django.template import Context, loader
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.forms.models import modelformset_factory
from django import forms
from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

from weibopy.auth import OAuthHandler
from weibopy.api import API

from home.models import SinaWeibo, Candidate, follow_all, collect_candidate,clear_all, Keyword

logger = logging.getLogger('goldeneye.views')

RESPONSE_CODE2STRING = {
    200000:"OK",
    422000:"Authentication Failed",
    418000:"Parameter Error",
    419000:"Domain Error",
    419001:"Out Of Daily Quota Of Candidates",
    }
def make_json_response(request=None, data={}, code=200000):
    if code < 1000: code *=1000
    c = {}
    c['code'] = code
    c['code_desc'] = RESPONSE_CODE2STRING.get(code, "")
    data['response']= c
    r = json.dumps(data, ensure_ascii=False, indent=4)
    return HttpResponse(r.encode('utf8'))


def rest_login_required(func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated():
            return make_json_response(code=422)
        return func(request, *args, **kwargs)
    return wrapper


def apply_form(formcls):
    def decorator(f):
        def wrapper(request, *args, **kwargs):
            form = formcls(request.REQUEST, request.FILES)
            if not form.is_valid():
                return make_json_response(code=418)
               # return HttpResponse("418:Parameter Invalid", status=400) 
            return f(request, form=form, *args, **kwargs)
        functools.update_wrapper(wrapper, f)
        return wrapper
    return decorator

class JsonField(forms.CharField):
    default_error_messages = {
        'invalid': _(u'Json Required'),
    }

    def __init__(self, *args, **kwargs):
        super(JsonField, self).__init__(*args, **kwargs)

    def to_python(self, value):
        value = super(JsonField, self).to_python(value)
        if value is None:
            return None
        try:
            r = json.loads(value)
        except(ValueError):
            raise ValidationError(self.error_messages['invalid'])
        return r 

def oauth_sina(request):
  auth = OAuthHandler(settings.SINA_CONSUMER_KEY,settings.SINA_CONSUMER_SECRET,
    "http://www.tingwo.cc" + "/p/oauth_sina_callback")
  auth_url = auth.get_authorization_url()
  request.session['oauth_sina_request_token'] = auth.request_token
  return HttpResponseRedirect(auth_url)


def oauth_callback(request):
  oauth_verifier = request.REQUEST.get('oauth_verifier', None)
  request_token = request.session.get('oauth_sina_request_token',None)
  auth = OAuthHandler(settings.SINA_CONSUMER_KEY,settings.SINA_CONSUMER_SECRET)
  auth.request_token = request_token
  access_token = auth.get_access_token(oauth_verifier)
  logger.debug("authorized")
  request.session['oauth_sina'] = auth

  api = API(auth)
  data = api.verify_credentials()

  from django.contrib.auth import authenticate, login as django_login

  user = authenticate(sinaweiboid=data.id)
  if user is None:
#  query = SinaWeibo.objects.filter(weiboid = data.id)
#  if (len(query) ==  0):

    user = User()
    user.username = "sina|" + data.name
    user.backend = 'sinaweibo'
    user.save()
  
    sina_weibo = SinaWeibo()
    sina_weibo.weiboid = data.id
    sina_weibo.name = data.name
    sina_weibo.access_token = auth.access_token.key
    sina_weibo.access_secret = auth.access_token.secret
    sina_weibo.user = user
    sina_weibo.save()

    user = authenticate(sinaweiboid = data.id)
    assert user != None
#  else:
#    sina_weibo = query[0]
#    user = sina_weibo.user
#    user.backend = 'sinaweibo'

  django_login(request, user)

  return HttpResponseRedirect("/")


def login(request):
  return render_to_response("login.html")


def logout(request):
  from django.contrib.auth import logout
  logout(request)
  return HttpResponseRedirect("/")


def mock(request):
  from django.contrib.auth import authenticate, login as django_login
  userid = request.GET['userid']
  user = User.objects.get(pk=userid)
  weibo = SinaWeibo.get_by_user(user)
  user = authenticate(sinaweiboid = weibo.weiboid)
  django_login(request, user)
  return HttpResponseRedirect('/')

def homepage(request):
  if (not request.user.is_authenticated()):
    return HttpResponseRedirect("/login/")
  if (not request.session.has_key("oauth_sina")):
    return HttpResponseRedirect("/login/")
  
  return HttpResponseRedirect("/work/")

@login_required
def work(request):
  user = request.user
  action = request.REQUEST.get('action',None)
  weibo = SinaWeibo.get_by_user(user)
  if (action == 'search'):
    keyword = request.REQUEST.get("q")
    collect_candidate(user, weibo.get_auth(), keyword)
  elif (action == "followall"):
    follow_all(user, weibo.get_auth())
  elif (action == "clearall"):
    clear_all(user)
    
  KeywordFormSet = modelformset_factory(Keyword)
  keyword_formset = KeywordFormSet() 

  managed_count = Candidate.get_by_user(user).filter(follow_date__isnull=False).count()
  candidate_count = Candidate.get_by_user(user).filter(follow_date__isnull=True).count()
    
  return render_to_response("work.html", {"managed_count":managed_count, "candidate_count":candidate_count,
    "keyword_formset":keyword_formset})


class DynamicObject(object):
    pass

def user_vo(user):
  return {"name":user.username, "id":user.id}

def keyword_vo(kw):
    return {'value':kw.value, 'id':kw.id}

def candidate_vo(obj):
    return {'id':"%s-%s"%(obj.weiboid, obj.user.id),
            'name':obj.name,
            'priority':obj.priority,
            'following':True if obj.following else False,
            'followed_back':True if obj.followed_back else False,
            'managed': obj.managed,
            'text':obj.text,
            'commented': obj.been_commented(),
            }

def page_vo(paginator, page):
    return {'page':page.number,
            'count':paginator.count,
            'pages':paginator.num_pages,
            'perpage':paginator.per_page,
            'paginated':page.has_other_pages(),
            'has_next': page.has_next(),
            'has_previous':page.has_previous(),
            'next_page_number':page.next_page_number(),
            'previous_page_number':page.previous_page_number(),
            }
@rest_login_required
def page_pool(request):

    me = request.user
    sina = SinaWeibo.get_by_user(me)
    keywords = [keyword_vo(k) for k in Keyword.objects.filter(sina=sina)]

    candidates = Candidate.get_by_user(me).order_by("-follow_date")
    field_lookups = [k  for k in request.REQUEST.keys() if k.find('__')>=0]
    if field_lookups:
        for k in field_lookups:
            candidates = candidates.filter(**dict(((k,request.REQUEST[k]),)))
    perpage  = int(request.REQUEST.get('perpage','25'))
    page  = int(request.REQUEST.get('page','1'))
    candidate_paginator = Paginator(candidates, perpage)
    try:
        candidates_page = candidate_paginator.page(page)
    except (InvalidPage, EmptyPage):
        candidates_page = candidate_paginator.page(paginator.num_pages)

    #daily candidates
    found = Candidate.objects.filter(user=me).filter(managed__isnull=True).count()
    daily_res = {}
    daily_res['quota_remained']= sina.daily_remained_quota
    daily_res['quota'] = sina.daily_quota
    daily_res['followed'] = sina.daily_followed
    daily_res['idle_days'] = sina.idle_days
    daily_res['found'] = min(found, daily_res['quota_remained'])

    result = {}
    result['me'] = user_vo(me)
    result['keywords'] = keywords
    result['candidates'] = [candidate_vo(c) for c in candidates_page.object_list]
    result['candidate_page'] = page_vo(candidate_paginator, candidates_page)
    result['daily'] = daily_res

    return make_json_response(request, result)
    

@rest_login_required
def page_analysis(request):
    me =request.user
    weibo = SinaWeibo.get_by_user(me)
    d = weibo.get_follow_graph().items()
    d.sort()
    x_axis = [_d[0] for _d in d ] 
    followed = [_d[1][0] for _d in d]
    followed_back = [_d[1][1] for _d in d]
    follow_graph = {
        'x_axis':map(lambda d:u"%s月%s日"%(d.month,d.day), x_axis),
        'followed':followed,
        'followed_back':followed_back,
        }
    
    result = {}
    result['me'] = user_vo(me)
    result['follow_graph'] = follow_graph
    return make_json_response(request, result)


class CandidatesForm(forms.Form):
    candidates = JsonField()


@apply_form(CandidatesForm)
@rest_login_required
def follow(request, form):
    ids = form.cleaned_data['candidates']    
    for i in ids:
        weiboid, userid = i.split('-')
        c = Candidate.get_by_id(userid, weiboid)
        if c is None: continue
        c.follow()
        c.managed=True
        c.save()
    return make_json_response(request)


@apply_form(CandidatesForm)
@rest_login_required
def unfollow(request, form):
    ids = form.cleaned_data['candidates']    
    for i in ids:
        weiboid, userid = i.split('-')
        c = Candidate.get_by_id(userid, weiboid)
        if c is None: continue
        c.unfollow()
        c.managed=False
        c.save()
    return make_json_response(request)


@apply_form(CandidatesForm)
@rest_login_required
def manage(request, form):
    ids = form.cleaned_data['candidates']    
    for i in ids:
        weiboid, userid = i.split('-')
        c = Candidate.get_by_id(userid, weiboid)
#        if c is None: continue
        c.managed=True
        c.save()
    return make_json_response(request)

@apply_form(CandidatesForm)
@rest_login_required
def unmanage(request, form):
    ids = form.cleaned_data['candidates']    
    for i in ids:
        weiboid, userid = i.split('-')
        c = Candidate.get_by_id(userid, weiboid)
        c.managed=False
        c.save()
    return make_json_response(request)

class KeywordForm(forms.Form):
#    value = forms.CharField(required=False)
    values = JsonField(required=False)

def _add_keyword(user, value):
    kw = Keyword() 
    kw.value = value
    kw.sina = SinaWeibo.get_by_user(user)
    kw.enabled = True
    kw.save()
 

@apply_form(KeywordForm)
@rest_login_required
def add_keyword(request, form):
 #   if form.cleaned_data.get('value', None):
 #       _add_keyword(request.user, form.cleaned_data['value'])
    if form.cleaned_data.get('values',None):
        values = form.cleaned_data['values']
        for v in values:
            _add_keyword(request.user, v)
    return make_json_response(request)


class KeywordIdForm(forms.Form):
    keyword = forms.IntegerField()

@apply_form(KeywordIdForm)
@rest_login_required
def remove_keyword(request, form):
    obj = Keyword.objects.get(pk=form.cleaned_data['keyword'])
    obj.delete()
    return make_json_response(request)


class KeywordIdValueForm(forms.Form):
    keyword = forms.IntegerField()
    value = forms.CharField()
@apply_form(KeywordIdValueForm)
@rest_login_required
def update_keyword(request, form):
    obj = Keyword.objects.get(pk=form.cleaned_data['keyword'])
    obj.value = form.cleaned_data['value']
    obj.save()
    return make_json_response(request)
    


class KeywordListForm(forms.Form):
    values = JsonField(required=True)

@apply_form(KeywordListForm)
@rest_login_required
def wholly_update_keyword(request, form):
    values = form.cleaned_data['values']
    assert type(values) == list
    logger.warn('%s(%s) wholly_update its keywords with %s' % 
        (request.user.username, request.user.id, values))
    

    values = set(values)
    old_keywords = Keyword.objects.filter(sina = SinaWeibo.get_by_user(request.user))
    to_be_deleted = [ kw for kw in old_keywords if kw.value not in values]
    logger.debug('keywords to be deleted: %s' % to_be_deleted)
    for kw in to_be_deleted:
        kw.delete()
    remained_values = [ kw.value for kw in old_keywords if kw.value not in to_be_deleted]
    logger.debug('keywords to be added: %s' % to_be_deleted)
    to_be_added = [v for v in  values if v not in remained_values]
    for v in to_be_added:
        _add_keyword(request.user, v)
    return make_json_response(request)

@rest_login_required
def daily_follow(request):
    user = request.user
    weibo = SinaWeibo.get_by_user(user)
    try:
        weibo.daily_follow()
    except Candidate.OutOfQuota:
        return make_json_response(request, code=419001)
    return make_json_response(request)


class CandidateCommentForm(CandidatesForm):
    text = forms.CharField()
    retweet = forms.BooleanField(required=False)

@rest_login_required
@apply_form(CandidateCommentForm)
def comment(request, form):
    ids = form.cleaned_data['candidates']    
    for i in ids:
        weiboid, userid = i.split('-')
        c = Candidate.get_by_id(userid, weiboid)
        if c is None: continue
        c.comment(form.cleaned_data['text'], form.cleaned_data['retweet'])
        c.managed=True
        c.save()
    return make_json_response(request)
    


