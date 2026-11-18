
import {
  consultarEstado
} from '../services/health.service.js';

export function obtenerEstado(req, res) {
  const resultado = consultarEstado();

  return res.status(200).json(resultado);
}
