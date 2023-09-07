const caducidadTiempo = 60;

const fechaActual = () => {
  const date = new Date();
  const año = date.getFullYear();
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const dia = date.getDate().toString().padStart(2, '0');
  const horas = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  const segundos = date.getSeconds().toString().padStart(2, '0');
  const fechaFormateada = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  return fechaFormateada;
};

const generarToken = () => {
  const longitud = 6;
  const caracteres = '0123456789';
  let token = '';
  for (let i = 0; i < longitud; i++) {
    const random = Math.floor(Math.random() * caracteres.length);
    token += caracteres.charAt(random);
  }
  return token;
};

const errorResponse = (response, code, message) => {
  return response.status(code).send({ success: false, data:[], message: message });
};

const validarCaducidadToken = (fecha) => {
  let diferencia = diferenciaTiempo(fecha);
  return (diferencia >= caducidadTiempo) ? true : false;
};

const tiempoRestanteCaducidadToken = (fecha) => {
  let diferencia = diferenciaTiempo(fecha);
  const tiempoRestante = caducidadTiempo - diferencia;
  return tiempoRestante;
};

const diferenciaTiempo = (fecha) => {
  const unidadTiempo = 's';
  const fechaAnterior = new Date(fecha);
  const fechaActualTmp = new Date(fechaActual());
  let diferenciaTiempo = 0;

  if (unidadTiempo === 's') {
    diferenciaTiempo = (fechaActualTmp - fechaAnterior) / 1000;
  }
  else if (unidadTiempo === 'm') {
    diferenciaTiempo = (fechaActualTmp - fechaAnterior) / (1000 * 60);
  }
  else if (unidadTiempo === 'h') {
    diferenciaTiempo = (fechaActualTmp - fechaAnterior) / (1000 * 60 * 60);
  }

  return diferenciaTiempo;
};

module.exports = {
  fechaActual,
  generarToken,
  errorResponse,
  validarCaducidadToken,
  tiempoRestanteCaducidadToken
}