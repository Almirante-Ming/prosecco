from flask import Blueprint, request, jsonify, current_app
from flask_login import current_user
from pathlib import Path
from prosecco.config import db
from werkzeug.security import generate_password_hash as hash_pass
from prosecco.models import User, Device
from prosecco.config import User_state, Device_state


adm_route = Blueprint('/adm', __name__)



# -------------------- usuarios -----------------------------------------------------
@adm_route.route('/adm/users', methods=['GET'])
def get_all_users():
    all_users = db.session.query(User).filter(User.u_state != User_state.DELETED).all()
    users_list = [user.to_dict() for user in all_users]
    return jsonify(users_list)

@adm_route.route('/adm/user/new', methods=['POST'])
def create_new_user():
    username = request.form.get('name')
    email = request.form.get('email')
    passphrase = request.form.get('password')
    u_type = request.form.get('u_type')
    
    existing_user = db.session.query(User).filter(User.email == email).first()
    
    if existing_user:
        if existing_user.u_state == User_state.DELETED:
            existing_user.u_state = User_state.ACTIVE
            db.session.commit()
            return jsonify(success=False, error='user reactivated'), 201
        
        return jsonify(success=False, error='user already exists'), 409

    if not passphrase:
        return jsonify(success=False, error='Password is required'), 400

    new_user = User(name=username,email=email,passphrase=hash_pass(passphrase),u_type=u_type,u_state=User_state.ACTIVE)  # type: ignore
        
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify(success=True), 201

@adm_route.route('/adm/user/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    user = db.session.query(User).filter(User.id == user_id, User.u_state != User_state.DELETED).first()
    if not user:
        return jsonify(success=False, error='User not found'), 404

    data = request.json
    if 'name' in data:  # type: ignore
        user.name = data['name']  # type: ignore
    if 'email' in data:  # type: ignore
        user.email = data['email']  # type: ignore
    if 'password' in data:  # type: ignore
        user.passphrase = hash_pass(data['password'])  # type: ignore
    if 'u_type' in data:  # type: ignore
        user.u_type = data['u_type']  # type: ignore

    db.session.commit()
    return jsonify(success=True, message='User updated successfully'), 200


@adm_route.route('/adm/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = db.session.query(User).filter(User.id == user_id, User.u_state != User_state.DELETED).first()
    if not user:
        return jsonify(success=False, error='User not found'), 404

    user.u_state = User_state.DELETED
    db.session.commit()
    return jsonify(success=True, message='User soft-deleted successfully'), 200



# ----------- telas--------------------------------------------
@adm_route.route('/adm/devices', methods=['GET'])
def get_all_devices():
    all_devices = db.session.query(Device).filter(Device.a_state != Device_state.DELETED).all()
    device_list = [device.to_dict() for device in all_devices]
    return jsonify(device_list)    

@adm_route.route('/adm/device/new', methods=['POST'])
def add_new_device():
    ip = request.form.get('ip')
    locale = request.form.get('locale')
    group = request.form.get('group')
    user_id = current_user.id

    if db.session.query(Device).filter(Device.ip == ip).first() is not None:
        return jsonify(success=False, error='This device is already in the system'), 409
    
    static_dir = Path(current_app.root_path) / 'static' / 'show_control'
    show_controler = static_dir / f'{group}.json'

    if not show_controler.exists():
        static_dir.mkdir(parents=True, exist_ok=True)
        show_controler.write_text('[]')

    new_device = Device(user_id=user_id, ip=ip, group=group, locale=locale)  # type: ignore

    db.session.add(new_device)
    db.session.commit()

    return jsonify(success=True, message='Device added successfully'), 201



@adm_route.route('/adm/device/<int:device_id>', methods=['PATCH'])
def update_device(device_id):
    device = db.session.query(Device).filter(Device.id == device_id).first()
    if not device:
        return jsonify(success=False, error='Device not found'), 404

    data = request.json
    if 'ip' in data:  # type: ignore
        device.ip = data['ip']  # type: ignore
    if 'locale' in data:  # type: ignore
        device.locale = data['locale']  # type: ignore
    if 'group' in data:  # type: ignore
        device.group = data['group']  # type: ignore
    if 'user_id' in data:  # type: ignore
        device.user_id = data['user_id']  # type: ignore

    db.session.commit()
    return jsonify(success=True, message='Device updated successfully'), 200


@adm_route.route('/adm/device/<int:device_id>', methods=['DELETE'])
def soft_delete_device(device_id):
    device = db.session.query(Device).filter(Device.id == device_id).first()
    if not device:
        return jsonify(success=False, error='Device not found'), 404

    device.a_state = 'DELETED'
    db.session.commit()
    return jsonify(success=True, message='Device deleted successfully'), 200

