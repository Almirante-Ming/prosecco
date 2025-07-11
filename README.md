Executando o Projeto:

pip install poetry taskipy poetry-plugin-shell

poetry shell

poetry install

task init # primeira execucao, ira criar o banco migrar as tabelas e popular com os dados iniciais

task run # execussoes seguintes, apenas remove a criacao do banco, bem como executa em modo de producao


Obsservacoes: 
- o template de exibicao foi pensado para ser usado em tela cheia, caso pareca desconfigurado apenas aperte f11 na pagina
- para o painel de exibicao foi usado como referencia a resolucao 1080P, seguindo a proporcao 16:9, sendo assim 1920x1080
midias fora do padrao podem sofrer com erros de exibicao bem como distorcao.
- segue o arquivo .env.example com todas as variaves abertas para edicao, as que devem ser fixas ja estao preenchidas
- o projeto foi feito e testado em ambiente linux, caso seja utilizado dentro de maquinas virtuais ou no windows, certifique
de ter permissoes de acesso direto a rede, sem subrede virtual (modo ponte).

formatos suportados:
- imagens = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff']
- videos = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv']