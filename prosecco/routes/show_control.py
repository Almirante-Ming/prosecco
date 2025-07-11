from flask import Blueprint, jsonify, request, current_app
from prosecco.config import CONTROL_FOLDER, UPLOAD_FOLDER, BASE_DIR
import os
import json

control_bp = Blueprint('control', __name__, url_prefix='/control')

def detectar_tipo(nome_arquivo):
    ext = os.path.splitext(nome_arquivo)[1].lower()
    if ext in ['.mp4', '.webm', '.mov', '.avi', '.mkv']:
        return 'video'
    elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff']:
        return 'image'
    return 'unknown'

@control_bp.route('/views', methods=['GET'])
def listar_midias():
    arquivos = [
        f for f in os.listdir(UPLOAD_FOLDER)
        if f.lower().endswith((
            '.mp4', '.webm', '.mov', '.avi', '.mkv',
            '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff'
        ))
    ]
    midias = [
        {'file': nome, 'type': detectar_tipo(nome)}
        for nome in arquivos
    ]
    return jsonify(midias)

@control_bp.route('/show', methods=['GET'])
def listar_jsons():
    arquivos = [
        f for f in os.listdir(CONTROL_FOLDER)
        if f.endswith('.json')
    ]
    return jsonify(arquivos)

@control_bp.route('/show/<filename>', methods=['GET']) #
def get_specific_json_content(filename):
    if not filename or not filename.endswith('.json') or '..' in filename:
        return jsonify({"error": "Nome do arquivo de configuracao invalido"}), 400

    file_path = os.path.join(CONTROL_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Arquivo de configuracao da rota nao encontrado"}), 404

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data), 200
    except json.JSONDecodeError:
        current_app.logger.exception(f"Erro ao decodificar JSON: {filename}")
        return jsonify({"error": "Configuracao da rota corrompida ou contem erros de formatacao"}), 500
    except Exception as e:
        current_app.logger.exception(f"Erro ao ler o arquivo JSON: {filename}")
        return jsonify({"error": str(e)}), 500

@control_bp.route('/set', methods=['PUT'])
def atualizar_json():
    filename = request.args.get('file')
    if not filename or not filename.endswith('.json') or '..' in filename:
        return jsonify({"error": "Arquivo de configuracao da rota invalido"}), 400

    file_path = os.path.join(CONTROL_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Configuracao da rota nao encontrada"}), 404

    try:
        data = request.get_json(force=True)

        if not isinstance(data, list):
            return jsonify({"error": "Esperado um array"}), 400

        if data == []:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump([], f, indent=2, ensure_ascii=False)
            return jsonify({"message": "exibicao redefinida"}), 200

        if all(isinstance(item, dict) and 'file' in item and 'type' in item for item in data):
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return jsonify({"message": "grupo atualizado com sucesso"}), 200

        return jsonify({"error": "Formato dos dados de configuracao invalido"}), 400

    except Exception as e:
        current_app.logger.exception("Erro ao atualizar o grupo")
        return jsonify({"error": str(e)}), 500

@control_bp.route('/delete', methods=['PUT'])
def deletar_arquivos_upload():
    arquivos = request.get_json(force=True)
    if not isinstance(arquivos, list):
        return jsonify({'error': 'Nenhum arquivo de midia selecionado para remocao'}), 400

    erros = []
    for nome in arquivos:
        caminho = os.path.join(UPLOAD_FOLDER, nome)
        if os.path.exists(caminho):
            try:
                os.remove(caminho)
            except Exception as e:
                erros.append({'file': nome, 'error': str(e)})
        else:
            erros.append({'file': nome, 'error': 'Arquivo nao encontrado'})

    if erros:
        return jsonify({'message': 'Alguns arquivos nao puderam ser removidos', 'erros': erros}), 207

    return jsonify({'message': 'Arquivos removidos com sucesso'}), 200
