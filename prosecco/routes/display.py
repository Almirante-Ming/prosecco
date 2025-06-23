from flask import Blueprint, render_template, abort, current_app
import json
import os
from datetime import datetime

display_bp = Blueprint('display_bp', __name__)

@display_bp.route('/<string:group_name>')
def show_group_content(group_name):
    json_filename = f'{group_name}.json'
    json_path = os.path.join(current_app.root_path, 'static', 'show_control', json_filename)
    
    print(f"[{datetime.now()}] Tentando carregar arquivo JSON: {json_path} para o grupo '{group_name}'")

    if not os.path.exists(json_path):
        print(f"[{datetime.now()}] Erro: Arquivo JSON '{json_filename}' não encontrado em {json_path}.")
        abort(404, description=f"Conteúdo para o grupo '{group_name}' não encontrado.")

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            content_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[{datetime.now()}] Erro de JSON inválido em '{json_filename}': {e}")
        abort(500, description=f"Erro de formato no conteúdo do grupo '{group_name}'.")
    except Exception as e:
        print(f"[{datetime.now()}] Erro inesperado ao carregar JSON: {e}")
        abort(500, description=f"Erro ao carregar conteúdo para o grupo '{group_name}'.")

    return render_template('painel_exibicao.html', content=content_data, group=group_name)
