from flask import abort, request, redirect, url_for
from datetime import datetime #apenas para teste
from flask_login import current_user, login_manager
from functools  import wraps
from prosecco.config import User_type, Device_state, db
from prosecco.models import Device


def access_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(401)
            
            if current_user.u_type == User_type.ADMIN:
                return f(*args, **kwargs)
            
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

def redirect_by_ip_group(default_redirect_endpoint='login_bp.login'):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            client_ip = request.remote_addr
            print(f"[{datetime.now()}] Tentativa de acesso de IP: {client_ip}")

            device = db.session.query(Device).filter(
                Device.ip == client_ip, 
                Device.a_state == Device_state.ACTIVE
            ).first()

            if not device:
                print(f"[{datetime.now()}] IP {client_ip} não é um dispositivo ativo. Redirecionando para {default_redirect_endpoint}")
                return redirect(url_for(default_redirect_endpoint))
            
            group_name = device.group
            print(f"[{datetime.now()}] IP {client_ip} pertence ao grupo: '{group_name}'")

            target_path = f'/{group_name}'
            current_path = request.path

            if current_path.startswith(target_path):
                print(f"[{datetime.now()}] Já está no caminho do grupo '{group_name}' ({current_path}). Prosseguindo.")
                return f(*args, **kwargs)
            
            print(f"[{datetime.now()}] Redirecionando de '{current_path}' para '{target_path}' (grupo: '{group_name}')")
            return redirect(target_path)
        
        return decorated_function
    return decorator