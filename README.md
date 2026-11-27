# Prosecco

Aplicação HTTP (Flask) para exibir imagens e vídeos em telas e painéis.

## Setup

### Requisitos

- **Python 3.12.10 exatamente.** As dependências em `requerements.txt` têm o marcador
  `python_full_version == "3.12.10"`; em outra versão o pip ignora todas elas.
- Redis é **opcional**: o rate limiter tenta `redis://localhost:6379` e, se não houver Redis,
  usa memória.

### Variáveis de ambiente (`.env`)

| Variável | Exemplo | Observação |
|---|---|---|
| `DATABASE_URL` | `sqlite:////caminho/absoluto/prosecco/prosecco/data/prosecco.db` | caminho **absoluto** (quatro barras) |
| `SECRET_KEY` | uma string longa e aleatória | obrigatória para login e sessão |
| `FLASK_APP` | `prosecco.app:prosecco` | |
| `FLASK_ENV` | `production` | |

O `load_dotenv` não sobrescreve variáveis já definidas no ambiente.

### Com Poetry (caminho recomendado)

```bash
pip install poetry taskipy poetry-plugin-shell
poetry install
poetry shell
task init   # migra o banco (cria o admin inicial) e sobe com gunicorn + TLS de teste
task dev    # alternativa: servidor de desenvolvimento do Flask, em HTTP
```

### Com pip, sem Poetry

O `requerements.txt` está desatualizado em relação ao `pyproject.toml`: faltam `redis` e
`flask-talisman`, e o app não sobe sem o `redis`.

```bash
pip install -r requerements.txt "redis>=6.2,<7" "flask-talisman>=1.1,<2"
export PYTHONPATH=$PWD        # o pacote não é instalado fora do Poetry
flask --app prosecco.app:prosecco db upgrade
flask --app prosecco.app:prosecco run --host 0.0.0.0
```

Use `--app prosecco.app:prosecco` (módulo), não `--app prosecco/app` (arquivo): pelo arquivo os
imports `from prosecco...` falham fora do Poetry.

### Com Docker

```dockerfile
FROM python:3.12.10-slim
WORKDIR /app
COPY requerements.txt .
RUN pip install --no-cache-dir -r requerements.txt "redis>=6.2,<7" "flask-talisman>=1.1,<2"
COPY . .
ENV PYTHONPATH=/app DATABASE_URL=sqlite:////app/prosecco/data/prosecco.db SECRET_KEY=troque-isto
RUN mkdir -p prosecco/data prosecco/static/img/uploads
CMD flask --app prosecco.app:prosecco db upgrade && flask --app prosecco.app:prosecco run --host 0.0.0.0 --port 5000
```

### Primeiro acesso

- Login inicial (criado pela migration `fca89f1b9733`): `super@admin.com` / `masterkey`.
  Troque a senha antes de expor o app.
- Painel administrativo: `/adm` (usuários e dispositivos).
- Tela de exibição: `/<grupo>`. Ela lê `prosecco/static/show_control/<grupo>.json`, uma lista
  `[{"file": "arquivo.png", "type": "image"}]` com arquivos em `prosecco/static/img/uploads/`.
- `/` redireciona cada dispositivo para o grupo dele pelo **IP** cadastrado em `/adm`; IP sem
  cadastro vai para o login.

---

Executando o Projeto:

pip install poetry taskipy poetry-plugin-shell

poetry shell

poetry install

task init # primeira execucao, ira criar o banco migrar as tabelas e popular com os dados iniciais

task run # execussoes seguintes, apenas remove a criacao do banco, bem como executa em modo de producao


Observacoes: 
- o template de exibicao foi pensado para ser usado em tela cheia, caso pareca desconfigurado apenas aperte f11 na pagina
- para o painel de exibicao foi usado como referencia a resolucao 1080P, seguindo a proporcao 16:9, sendo assim 1920x1080
midias fora do padrao podem sofrer com erros de exibicao bem como distorcao.
- segue o arquivo .env.example com todas as variaves abertas para edicao, as que devem ser fixas ja estao preenchidas
- o projeto foi feito e testado em ambiente linux, caso seja utilizado dentro de maquinas virtuais ou no windows, certifique
de ter permissoes de acesso direto a rede, sem subrede virtual (modo ponte).
- login inicial da aplicacao (email: 'super@admin.com', senha: 'masterkey')
- os arquivos de certificado e senha nao devem ser usados em producao, estao incluidos para fins de teste, uma vez que o javascript nao aceita salvar em cache de sites que nao sejam https

formatos suportados:
- imagens = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff']
- videos = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv']
