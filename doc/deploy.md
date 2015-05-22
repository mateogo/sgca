# Setup inicial de un servidor con múltiples instancias

Esta guia se encuentra en la wiki y el repositorio.
De haber discrepancias **prevalece la versión en el repositorio**.

Sistema base: Imagen Ubuntu 14.04 LTS (trusty).

Vamos a usar nginx como reverse proxy y supervisor para monitorear todos los procesos.
Los servicios internos escuchan en estos puertos (*NO* tienen que estar abiertos al exterior):

- cultura: 3000
- cck: 3001
- test: 3002
- webhooks: 5000

Se precisa apuntar cuatro dominios:

- cultura
- cck
- webhooks
- test

Convenciones:

- Comandos de shell comenzados con **#** son ejecutados como root.
- Comandos de shell comenzados con **$** son ejecutados como el usuario del sistema.
- Asumo que todo va a correr bajo el usuario *ubuntu* (cambiar las rutas, permisos y demas según sea necesario).

Los archivos necesarios estan en la carpeta [repo sisplan]/doc/deploy

Pasos realizados:

Agregar claves gpg para verificar paquetes:

```bash
# wget -O - http://nginx.org/keys/nginx_signing.key | apt-key add -
# wget -O- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
# apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
```

crear */etc/apt/sources.list.d/sisplan.list* con:

    deb http://nginx.org/packages/mainline/ubuntu/ trusty nginx
    deb-src http://nginx.org/packages/mainline/ubuntu/ trusty nginx

    deb https://deb.nodesource.com/node_0.12 trusty main
    deb-src https://deb.nodesource.com/node_0.12 trusty main

    deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse

Actualizar repos, instalar paquetes necesarios, requirements.txt esta en sisplan/doc/deploy:

```bash
# apt-get update
# apt-get install nginx nodejs mongodb-org
# apt-get install python-pip
# pip install -U pip
# easy_install supervisor
# pip install -r requirements.txt
# cp deploy/etc/init.d/supervisord /etc/init.d/
# chmod 0755 /etc/init.d/supervisord
# update-rc.d supervisord defaults
```

Crear carpetas, configurar (editar supervisord.conf si hace falta):

```bash
# mkdir -p /etc/supervisor/conf.d
# mkdir -p /var/log/nginx/log/
# mkdir -p /var/log/supervisor
# cp deploy/supervisord.conf /etc
```

Incorporar datos desde un mongodump (arreglar los nombres segun corresponda para cada instancia):
Ver que *cultura* y *cck* usan la misma base **sgcadb_prod**, *test* usa otra.

```bash
$ mongorestore --db sgcadb_prod dump/sgcadb_initial
$ mongorestore --db sgcadb_test dump/sgcadb_initial
```

Copiar todo *deploy/home/ubuntu* al home del usuario.

Clonar sisplan para cada instancia (ajustar como corresponda):

```bash
$ cd /home/ubuntu/instancias-sisplan
$ git clone https://github.com/mateogo/sgca.git cultura
$ git clone https://github.com/mateogo/sgca.git cck
$ git clone https://github.com/mateogo/sgca.git test

$ (cd cultura ; git checkout cultura ; npm install)
$ (cd cck     ; git checkout cck     ; npm install)
$ (cd test    ; git checkout test    ; npm install)
```

Configurarlas:

```bash
cd /home/ubuntu/
cp conf/cultura.js instancias-sisplan/cultura/config/local.js
cp conf/cck.js     instancias-sisplan/cck/config/local.js
cp conf/test.js    instancias-sisplan/test/config/local.js
```


Los archivos estáticos los sirvo usando Nginx, node solo sirve el api.
Copiar todo *deploy/etc/nginx/conf.d/* a */etc/nginx/conf.d* y editar segun sea necesario.
En principio:

- server_name: cada dominio a usar

El resto no hace falta tocar.


Reiniciar nginx y supervisord:

```bash
# service nginx restart
# service supervisord start
```

Agregar webhooks desde github:

Ir a https://github.com/mateogo/sgca/settings/hooks
Click en "Add webhook"
En "Payload URL" poner el dominio de webhooks apuntado.


## Workflow de trabajo

De ahora en mas un push a las branches cultura, cck o test hace un hard reset de la misma y reinicia el servidor node
correspondiente.

No hay cambios locales hechos directamente en el servidor (porque van a ser sobreescritos la próxima vez que corra el
hook.)


