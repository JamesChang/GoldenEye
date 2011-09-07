from django.contrib import admin
from home.models import SinaWeibo, Keyword, Candidate

class SinaWeiboAdmin(admin.ModelAdmin):
  pass
admin.site.register(SinaWeibo, SinaWeiboAdmin)

class KeywordAdmin(admin.ModelAdmin):
    list_display = ('value', 'sina', 'enabled')
    list_filter = ('sina',)


admin.site.register(Keyword, KeywordAdmin)


class CandidateAdmin(admin.ModelAdmin):
  
  list_display = ('name', 'user', 'following', 'followed_back', 'managed', 'priority', 'follow_date', 'unfollow_date', 'text')
  list_filter = ('user', 'follow_date', 'following', 'followed_back', 'managed')
  search_fields = ['name', 'text']

  def follow(self, request, queryset):
    for obj in queryset:
      obj.managed=True
      obj.follow(check_quota=False)

  def unfollow(self, request, queryset):
    for obj in queryset:
      obj.unfollow()

  def update(self, request, queryset):
    for obj in queryset:
      obj.update()

  actions = [follow, unfollow, update]
  

admin.site.register(Candidate, CandidateAdmin)
