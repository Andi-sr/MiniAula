
import { Router } from 'express';

import {
    consultarMiPerfil,
    editarMiPerfil
} from '../controllers/usuario.controller.js';

import { autenticar } from '../middlewares/auth.middleware.js';
import { validarBody } from '../middlewares/validar.middleware.js';
import { actualizarPerfilSchema } from '../validators/usuario.schemas.js';

const router = Router();

router.get(
    '/me',
    autenticar,
    consultarMiPerfil
);

router.put(
    '/me',
    autenticar,
    validarBody(actualizarPerfilSchema),
    editarMiPerfil
);

export default router;
