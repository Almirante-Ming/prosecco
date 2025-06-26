from flask import Blueprint, jsonify, request, current_app
from prosecco.config import CONTROL_FOLDER, UPLOAD_FOLDER, BASE_DIR
import os
import json

control_bp = Blueprint('control', __name__, url_prefix='/control')

def detectar_tipo(nome_arquivo):
    ext = os.path.splitext(nome_arquivo)[1].lower()
    if ext == '.mp4':
        return 'video'
    elif ext == '.png':
        return 'image'
    return 'unknown'

@control_bp.route('/show', methods=['GET'])
def listar_jsons():
    arquivos = [
        f for f in os.listdir(CONTROL_FOLDER)
        if f.endswith('.json')
    ]
    return jsonify(arquivos)

@control_bp.route('/views', methods=['GET'])
def listar_midias():
    arquivos = [
        f for f in os.listdir(UPLOAD_FOLDER)
        if f.lower().endswith(('.mp4', '.png'))
    ]
    midias = [
        {'file': nome, 'type': detectar_tipo(nome)}
        for nome in arquivos
    ]
    return jsonify(midias)

@control_bp.route('/set', methods=['PUT'])
def atualizar_json():
    filename = request.args.get('file')
    if not filename or not filename.endswith('.json'):
        return jsonify({"error": "Arquivo inválido"}), 400

    file_path = os.path.join(CONTROL_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "Arquivo não encontrado"}), 404

    try:
        data = request.get_json(force=True)

        if not isinstance(data, list):
            return jsonify({"error": "Esperado um array"}), 400

        if len(data) == 1 and isinstance(data[0], dict) and data[0].get('file') == "" and data[0].get('type') == "":
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return jsonify({"message": "JSON limpo com sucesso"}), 200

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                atual = json.load(f)
        except Exception:
            atual = []

        if all(isinstance(item, str) for item in data):
            novo = [item for item in atual if item['file'] not in data]
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(novo, f, indent=2, ensure_ascii=False)
            return jsonify({"message": "Itens removidos"}), 200

        if all(isinstance(item, dict) and 'file' in item and 'type' in item for item in data):
            novo = atual + data
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(novo, f, indent=2, ensure_ascii=False)
            return jsonify({"message": "Itens adicionados"}), 200

        return jsonify({"error": "Formato desconhecido"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@control_bp.route('/delete', methods=['PUT'])
def deletar_arquivos_upload():
    arquivos = request.get_json(force=True)
    if not isinstance(arquivos, list):
        return jsonify({'error': 'Esperado um array de nomes de arquivos'}), 400

    erros = []
    for nome in arquivos:
        caminho = os.path.join(UPLOAD_FOLDER, nome)
        if os.path.exists(caminho):
            try:
                os.remove(caminho)
            except Exception as e:
                erros.append({'file': nome, 'error': str(e)})
        else:
            erros.append({'file': nome, 'error': 'Arquivo não encontrado'})

    if erros:
        return jsonify({'message': 'Alguns arquivos não puderam ser removidos', 'erros': erros}), 207

    return jsonify({'message': 'Arquivos removidos com sucesso'}), 200
