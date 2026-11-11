
export function notFoundHandler(req, res) {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'La ruta solicitada no existe',
      details: null
    }
  });
}

export function errorHandler(err, req, res, next) {
  const status = (
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status <= 599
  ) ? err.status : 500;

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({
    error: {
      code: status === 500
        ? 'INTERNAL_ERROR'
        : (err.code || 'BAD_REQUEST'),
      message: status === 500
        ? 'Error interno del servidor'
        : err.message,
      details: null
    }
  });
}
