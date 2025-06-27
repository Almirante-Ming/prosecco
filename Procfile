release: pip install -r requeriments.txt
web: gunicorn --certfile=wine.crt --keyfile=liave.key -w 4 -b 0.0.0.0 -t 180 prosecco.app:prosecco