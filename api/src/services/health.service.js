
export function consultarEstado() {
  return {
    estado: 'ok',
    aplicacion: 'MiniAula',
    mensaje: 'API funcionando correctamente',
    fecha: new Date().toISOString()
  };
}
