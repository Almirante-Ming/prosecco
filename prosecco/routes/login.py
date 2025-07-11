from flask import request, Blueprint, jsonify, url_for, session, redirect
from flask_login import login_required
from prosecco.config import db, limiter, User_type
from werkzeug.security import check_password_hash
from prosecco.models import User
from flask_login import login_user, logout_user

login_auth = Blueprint('login_auth', __name__)

@login_auth.route('/login/auth', methods=['POST'])
@limiter.limit("5 per hour")
def auth():
    email_do_formulario = request.form.get('id') 
    passphrase_do_formulario = request.form.get('passphrase')

    if not email_do_formulario or not passphrase_do_formulario:
        return jsonify(success=False, error="Email e senha sao obrigatorios"), 400

    user = db.session.query(User).filter(User.email == email_do_formulario).first()

    if not user:
        return jsonify(success=False, error="Usuario nao encontrado"), 404

    if not user.is_active_account():
        return jsonify(success=False, error="Conta de usuario inativa ou bloqueada"), 403

    if not check_password_hash(user.passphrase, passphrase_do_formulario):
        return jsonify(success=False, error="Dados de login invalidos"), 401


    login_user(user)
    session.permanent = True

    if user.u_type == User_type.ADMIN:
        redirect_url = url_for('adm')
    elif user.u_type == User_type.USER:
        redirect_url = url_for('usr')
    else:
        return jsonify(success=False, error="Usuario nao encontrado"), 403

    return jsonify(success=True, redirect_url=redirect_url), 200


@login_auth.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))