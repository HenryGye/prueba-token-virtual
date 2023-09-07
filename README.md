# prueba_token_virtual
* contiene dos carpetas, backend y frontend, en el backend hay un proyecto de una api realizada en nodejs y en el frontend un proyecto de una vista en angular que consume esas apis.

* descargar/clonar proyectos de git

## backend
* [node]: Version 18.17.1
* [MySQL]

### instalacion
* crear la base de datos token_virtual en MySQL

* ejecutar el archivo sql_scripts.sql para la crearcion de las tablas del proyecto

* instalar dependencias del proyecto en el backend
  - npm install

* ejecutar
  - npm start

* se ejecuta en el puerto 3000 o en el puerto 3300, en caso de estar ocupados alguno de los puertos se puede cambiar en el archivo .env

### prueba de endpoints api
* apis adicionales
  - post: http://localhost:3000/api/crear-usuario
    - request: { "nombre": "user1", "email": "user1@gmail.com", "direccion": "calle1" }

  - get: http://localhost:3000/api/listar-usuarios?filtro='user1' (filtra por nombre o email)

  - get: http://localhost:3000/api/buscar-usuario-por-email?email=user1@gmail.com

* apis del proyecto
  - get: http://localhost:3000/api/generar-token-usuario?usuario_id=1

  - get: http://localhost:3000/api/usar-token?usuario_id=1&token=809679

  - get: http://localhost:3000/api/listar-tokens-usados?usuario_id=1

## frontend
* [angular]: Version 16.2.0

### instalacion
* instalar dependencias
  - npm install

* ejecutar proyecto
  - ng serve