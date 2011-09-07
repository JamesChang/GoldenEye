
# Copyright 2009-2010 Joshua Roesslein
# See LICENSE for details.

class WeibopError(Exception):
    """Weibopy exception"""

    def __init__(self, reason, e=None):
        self.reason = reason.encode('utf-8')
        if e is not None:
          codes = e.split(':')
          self.code = codes[0]
      

    def __str__(self):
        return self.reason

