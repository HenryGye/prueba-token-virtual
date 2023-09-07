const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { connection } = require("../config.db");
const { fechaActual, generarToken, errorResponse, validarCaducidadToken, tiempoRestanteCaducidadToken } = require("../helpers/utils");

dotenv.config();

app.get("/test", (req, res) => {
  res.json({ message: "ok", token: generarToken(), fechaActual: fechaActual() });
});

app.route("/listar-tokens").get((request, response) => {
  connection.query("SELECT * FROM tokens", (error, results) => {
    if (error) {
      return errorResponse(response, 500, error.sqlMessage);
    }
    response.status(200).json(results);
  });
});

app.route("/buscar-usuario-por-email").get((request, response) => {
  const body = request.query;
  let sql = '';

  if (!body) return errorResponse(response, 400, 'Cuerpo de la solicitud vacio');
  if (!body.email) return errorResponse(response, 400, 'Campo usuario_id es requerido');

  sql = `SELECT usuarios.id, usuarios.nombre, usuarios.email, usuarios.direccion, usuarios.token_id, tokens.token, tokens.expiracion 
  FROM usuarios INNER JOIN tokens ON usuarios.token_id = tokens.id WHERE lower(usuarios.email) = lower(?)`;
  connection.query(sql, [body.email.trim()], (error, result) => {
    if (error) return errorResponse(response, 500, error.sqlMessage);
    if (result.length === 0) return errorResponse(response, 200, 'Usuario no existe');
    response.status(200).json({ success: true, data: result, message: 'Consulta exitosa' });
  });
});

app.route("/listar-usuarios").get((request, response) => {
  const body = request.query;
  let sql = `SELECT usuarios.id, usuarios.nombre, usuarios.email, usuarios.direccion, usuarios.token_id, tokens.token, tokens.expiracion 
  FROM usuarios INNER JOIN tokens ON usuarios.token_id = tokens.id`;

  if (body.filtro) {
    sql += ` WHERE lower(usuarios.nombre) like lower(?) OR lower(usuarios.email) like lower(?)`;
  }

  const params = [body.filtro ? `%${body.filtro.trim()}%` : '', body.filtro ? `%${body.filtro.trim()}%` : ''];

  connection.query(sql, params, (error, results) => {
    if (error) {
      return errorResponse(response, 500, error.sqlMessage);
    }
    response.status(200).json({ success: true, data: results, message: 'Consulta exitosa' });
  });
});

app.route("/crear-usuario").post((request, response) => {
  const body = request.body;
  const token = generarToken();
  const fecha = fechaActual();
  let sql = '';

  if (!body) return errorResponse(response, 400, 'Cuerpo de la solicitud vacio');
  if (!body.nombre) return errorResponse(response, 400, 'Campo nombre es requerido');
  if (!body.email) return errorResponse(response, 400, 'Campo email es requerido');
  if (!body.direccion) return errorResponse(response, 400, 'Campo email es requerido');

  // crear token
  sql = "INSERT INTO tokens(token, expiracion) VALUES (?,?)";
  connection.query(sql, [token, fecha], (error1, result1) => {
    if (error1) return errorResponse(response, 500, error1.sqlMessage);

    // crear usuario con token
    sql = "INSERT INTO usuarios(nombre, email, direccion, token_id) VALUES (?,?,?,?)";
    connection.query(sql, [body.nombre.trim(), body.email.trim(), body.direccion.trim(), result1.insertId], (error2, result2) => {
      if (error2) return errorResponse(response, 500, error2.sqlMessage);
      
      // consultar usuario y devolver respuesta
      sql = `SELECT usuarios.id, usuarios.nombre, usuarios.email, usuarios.direccion, tokens.token, tokens.expiracion 
      FROM usuarios INNER JOIN tokens ON usuarios.token_id = tokens.id WHERE usuarios.token_id = ?`;
      connection.query(sql, [result1.insertId], (error3, result3) => {
        if (error3) return errorResponse(response, 500, error3.sqlMessage);
        response.status(200).json({ success: true, data: result3, message: 'Registro exitoso' });
      });
    });
  });
});

app.route("/generar-token-usuario").get((request, response) => {
  const body = request.query;
  const token = generarToken();
  const fecha = fechaActual();
  let sql = '';

  if (!body) return errorResponse(response, 400, 'Cuerpo de la solicitud vacio');
  if (!body.usuario_id) return errorResponse(response, 400, 'Campo usuario_id es requerido');

  // consultar expiracion token de usuario
  sql = `SELECT usuarios.id, usuarios.nombre, usuarios.email, usuarios.direccion, usuarios.token_id, tokens.token, tokens.expiracion 
  FROM usuarios INNER JOIN tokens ON usuarios.token_id = tokens.id WHERE usuarios.id = ?`;
  connection.query(sql, [body.usuario_id], (error, result) => {
    if (error) return errorResponse(response, 500, error.sqlMessage);
    if (result.length === 0) return errorResponse(response, 200, 'Usuario no existe');

    // si token no esta caducado
    if (!validarCaducidadToken(result[0].expiracion)) {
      let tiempoRestante = tiempoRestanteCaducidadToken(result[0].expiracion);
      result[0] = {...result[0], ...{tiempoCaducidadRestante:tiempoRestante}};
      return response.status(200).json({ success: true, data: result, message: 'Consulta exitosa' });
    }

    // si token esta caducado se regenra
    sql = "INSERT INTO tokens(token, expiracion) VALUES (?,?)";
    connection.query(sql, [token, fecha], (error2, result2) => {
      if (error2) return errorResponse(response, 500, error2.sqlMessage);
      
      // se modifica usuario con el nuevo token
      sql = "UPDATE usuarios SET token_id = ? WHERE id = ?";
      connection.query(sql, [result2.insertId, result[0].id], (error3, result3) => {
        if (error3) return errorResponse(response, 500, error3.sqlMessage);
        
        // se guarda token usados
        sql = "INSERT INTO tokens_usados(usuario_id, token_id, fecha) VALUES (?,?,?)";
        connection.query(sql, [result[0].id, result[0].token_id, result[0].expiracion], (error4, result4) => {
          if (error4) return errorResponse(response, 500, error4.sqlMessage);

          result[0].token_id = result2.insertId;
          result[0].token = token;
          result[0].expiracion = new Date(fecha);
          let tiempoRestante = tiempoRestanteCaducidadToken(fecha);
          result[0] = {...result[0], ...{tiempoCaducidadRestante:tiempoRestante}};
          response.status(200).json({ success: true, data: result, message: 'Consulta exitosa' });
        });
      });
    });
  });
});

app.route("/usar-token").get((request, response) => {
  const body = request.query;
  const token = generarToken();
  const fecha = fechaActual();
  let sql = '';

  if (!body) return errorResponse(response, 400, 'Cuerpo de la solicitud vacio');
  if (!body.usuario_id) return errorResponse(response, 400, 'Campo usuario_id es requerido');
  if (!body.token) return errorResponse(response, 400, 'Campo token es requerido');

  // consultar usuario y devolver respuesta
  sql = `SELECT usuarios.id, usuarios.nombre, usuarios.email, usuarios.direccion, usuarios.token_id, tokens.token, tokens.expiracion 
  FROM usuarios INNER JOIN tokens ON usuarios.token_id = tokens.id WHERE usuarios.id = ? AND tokens.token = ?`;
  connection.query(sql, [body.usuario_id, body.token], (error, result) => {
    if (error) return errorResponse(response, 500, error.sqlMessage);
    if (result.length === 0) return errorResponse(response, 200, 'Usuario no existe');

    // si token esta caducado
    if (validarCaducidadToken(result[0].expiracion)) return errorResponse(response, 200, 'No autenticado');

    let tiempoRestante = tiempoRestanteCaducidadToken(result[0].expiracion);
    result[0] = {...result[0], ...{tiempoCaducidadRestante:tiempoRestante}};
    response.status(200).json({ success: true, data: result, message: 'Autenticado exitosamente' });
  });
});

app.route("/listar-tokens-usados").get((request, response) => {
  const body = request.query;
  let sql = '';

  if (!body) return errorResponse(response, 400, 'Cuerpo de la solicitud vacio');
  if (!body.usuario_id) return errorResponse(response, 400, 'Campo usuario_id es requerido');

  sql = `SELECT tokens.token, tokens_usados.fecha 
  FROM tokens_usados 
  INNER JOIN usuarios ON usuarios.id = tokens_usados.usuario_id
  INNER JOIN tokens ON tokens.id = tokens_usados.token_id
  WHERE usuarios.id = ?
  ORDER BY tokens_usados.fecha DESC`;

  connection.query(sql, [body.usuario_id], (error, results) => {
    if (error) return errorResponse(response, 500, error.sqlMessage);
    response.status(200).json({ success: true, data: results, message: 'Consulta exitosa' });
  });
});

module.exports = app;