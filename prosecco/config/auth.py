from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis

try:
    limiter = Limiter(get_remote_address, storage_uri='redis://localhost:6379')
    redis.StrictRedis.from_url('redis://localhost:6379').ping()
except Exception:
    limiter = Limiter(get_remote_address)