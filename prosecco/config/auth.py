from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import redis

limiter = Limiter(get_remote_address, storage_uri='redis://localhost:6379')