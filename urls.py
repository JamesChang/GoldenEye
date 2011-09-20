from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    #(r'^$', 'home.views.homepage'),
    #(r'^login/$', 'home.views.login'),
    (r'^p/logout/$', 'home.views.logout'),
    (r'^p/auth_sina/$','home.views.oauth_sina'),
    (r'^p/mock/$','home.views.mock'),
    (r'^p/oauth_sina_callback/$','home.views.oauth_callback'),


    #(r'^work/$', 'home.views.work'),
    
    #Pages
    (r'^api/page.pool/$', 'home.views.page_pool'),
    (r'^api/page.analysis/$', 'home.views.page_analysis'),
    #Operation
    (r'^api/candidate.follow/$', 'home.views.follow'),
    (r'^api/candidate.unfollow/$', 'home.views.unfollow'),
    (r'^api/candidate.manage/$', 'home.views.manage'),
    (r'^api/candidate.unmanage/$', 'home.views.unmanage'),
    (r'^api/candidate.bad/$', 'home.views.bad'),
    (r'^api/candidate.daily_follow/$', 'home.views.daily_follow'),
    (r'^api/candidate.comment/$', 'home.views.comment'),
    (r'^api/keyword.new/$', 'home.views.add_keyword'),
    (r'^api/keyword.remove/$', 'home.views.remove_keyword'),
    (r'^api/keyword.update/$', 'home.views.update_keyword'),
    (r'^api/keyword.wholly_update/$', 'home.views.wholly_update_keyword'),
    
    # Example:
    # (r'^weibo/', include('weibo.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
     (r'^admin/', include(admin.site.urls)),
)
