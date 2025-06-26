from flask import Blueprint, render_template, abort, current_app
import json
import os

display_bp = Blueprint('display_bp', __name__)

@display_bp.route('/<string:group_name>')
def show_group_content(group_name):
    json_filename = f'{group_name}.json'
    json_path = os.path.join(current_app.root_path, 'static', 'show_control', json_filename)

    if not os.path.exists(json_path):
        abort(404, description=f"Conteúdo para o grupo '{group_name}' não encontrado.")

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            content_data = json.load(f)
    except json.JSONDecodeError as e:
        abort(500, description=f"Erro de formato no conteudo do grupo '{group_name}'.")
    except Exception as e:
        abort(500, description=f"Erro ao carregar conteudo para o grupo '{group_name}'.")

    return render_template('painel_exibicao.html', content=content_data, group=group_name)
