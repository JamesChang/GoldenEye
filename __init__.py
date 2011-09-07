import logging, sys 



formatter = logging.Formatter("[%(asctime)s|%(levelname)s|%(name)s] %(message)s", "%y-%m-%d %H:%M:%S")
 

service_logger=logging.getLogger("goldeneye")
service_logger.setLevel(logging.DEBUG)

stdout_handler = logging.StreamHandler(sys.stdout)
stdout_handler.setFormatter(formatter)
service_logger.addHandler(stdout_handler)

warning_file = "warning.log"
warning_handler = logging.FileHandler(filename=warning_file, mode='a')
warning_handler.setLevel(logging.WARN)
warning_handler.setFormatter(formatter)
service_logger.addHandler(warning_handler)

debug_file = "debug.log"
debug_handler = logging.FileHandler(filename=debug_file, mode='a')
debug_handler.setLevel(logging.DEBUG)
debug_handler.setFormatter(formatter)
service_logger.addHandler(debug_handler)
