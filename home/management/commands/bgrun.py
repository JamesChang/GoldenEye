import threading,time
from django.core.management.base import BaseCommand, CommandError
from home.models import *
from home.unfollow import run as unforun
from home.update import run as updaterun
from home.collect import CollectionService as collection_service

class Command(BaseCommand):

  class UnfoThread(threading.Thread):
    def __init__(self):
      super(Command.UnfoThread, self).__init__()
      self.daemon=True
    def run(self):
      unforun()

  class UpdateThread(threading.Thread):
    def __init__(self):
      super(Command.UpdateThread, self).__init__()
      self.daemon=True
    def run(self):
      updaterun()

  class CollectThread(threading.Thread):
    def __init__(self):
      super(Command.CollectThread, self).__init__()
      self.daemon=True
      self.service = collection_service()
    def run(self):
      self.service.start()

  def handle(self, *args, **kwargs):
  
    update_thread = self.UpdateThread()
    update_thread.start()
    unfo_thread = self.UnfoThread()
    unfo_thread.start()
    collect_thread = self.CollectThread()
    collect_thread.start()

    while(True):
      time.sleep(60)

