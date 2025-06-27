from flask import abort, request, redirect, url_for
from flask_login import current_user
from functools  import wraps
from prosecco.config import  Device_state, db
from prosecco.models import Device


def access_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(401)

            if current_user.u_type not in allowed_roles:
                abort(403)

            return f(*args, **kwargs)

        return decorated_function
    return decorator


def ip_authorized_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = request.remote_addr

        device = db.session.query(Device).filter(Device.ip==client_ip, Device.a_state==Device_state.ACTIVE).first()

        if not device:
            abort(403)
        
        return f(*args, **kwargs)
    
    return decorated_function

def redirect_by_ip_group(default_redirect_endpoint='login'):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr

            device = db.session.query(Device).filter(
                Device.ip == client_ip, 
                Device.a_state == Device_state.ACTIVE
            ).first()

            if not device:
                return redirect(url_for(default_redirect_endpoint))
            
            group_name = device.group

            target_path = f'/{group_name}'
            current_path = request.path

            if current_path.startswith(target_path):
                return f(*args, **kwargs)
            
            return redirect(target_path)
        
        return decorated_function
    return decorator