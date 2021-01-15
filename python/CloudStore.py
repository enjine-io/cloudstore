
import requests
import threading
import time
import json

# initiates a parallel delayed function call
def setTimeout(cb, delay, args=None, kwargs=None):
    t = threading.Timer(delay, cb, args, kwargs)
    t.start()
    return t

class CloudStore:
    # static to limit across instances

    maxRate = 3 # minimum delay in seconds between requests
    __tlast = 0 # last request timestamp
    rateOff = 0.01 # minimum offset in seconds between requests
    lock = threading.Lock() # main thread lock for synchronizing
    
    def __init__(self, key, server="https://enjine.cloud/cloudstored"):
        self.server = server # host server url
        self.m_apiKey = key  # private api key
        self.m_retry = True  # (unused boolean) for retrying failed requests
        self.m_version = 1   # library version

    @classmethod
    def rateCheck(self):
        res = True
        self.lock.acquire()
        n = time.time()
        if n - self.__tlast < self.maxRate: res = False
        else: self.__tlast = n
        self.lock.release()
        return res

    @classmethod
    def getRemainingRate(self):
        self.lock.acquire()
        res = self.maxRate - (time.time() - self.__tlast)
        self.lock.release()
        return res

    @classmethod
    def sendData(self, url, json=None, cb=None, method="POST", **kwargs):
        t = threading.Thread(target=self.__asyncSendData, args=[url, json, cb, method], kwargs=kwargs)
        t.start()
        return t

    @classmethod
    def __asyncSendData(self, url, data=None, cb=None, method="POST", **kwargs):
        while not self.rateCheck():
            time.sleep(self.getRemainingRate() + self.rateOff)

        r = res = None
        try:
            r = requests.request(method, url, json=data, **kwargs)
            if r.status_code == 200: res = r.json()
            else: res = { "error": "Http error", "message": r.reason, "exception": requests.HTTPError(response=r) }

        except json.JSONDecodeError as e:
            res = { "error": "Error parsing data", "message": e.__doc__, "exception": e }
        except Exception            as e:
            res = { "error": "Error sending data", "message": e.__doc__, "exception": e }

        if cb and res:
            res["response"] = r
            self.lock.acquire()
            cb(res)
            self.lock.release()
        
    def save(self, file, obj, callback=None, password=None):
        data = { "key": self.m_apiKey, "file": file, "options": None, "id": "_data", "value": obj, "password": password }
        self.sendData(self.server + "/store/save", data, callback)

    def merge(self, file, obj, callback=None, password=None):
        data = { "key": self.m_apiKey, "file": file, "options": "merge", "id": "_data", "value": obj, "password": password }
        self.sendData(self.server + "/store/save", data, callback)

    def delete(self, file, callback=None, password=None):
        data = { "key": self.m_apiKey, "file": file, "options": "delete", "id": "_data", "password": password }
        self.sendData(self.server + "/store/save", data, callback)

    def load(self, file, callback=None, password=None):
        data = { "key": self.m_apiKey, "file": file, "options": None, "id": "_data", "password": password }
        self.sendData(self.server + "/store/load", data, callback)

    def list(self, file="", callback=None, password=None):
        data = { "key": self.m_apiKey, "file": file, "options": "list", "id": "_data", "password": password }
        self.sendData(self.server + "/store/load", data, callback)

    def upload(self, data, name, mimetype, callback=None, password=None):
        data = { "key": self.m_apiKey, "password": password }
        self.sendData(self.server + "/upload-2", None, callback, data=data, files=[("file", (name, data, mimetype))])


