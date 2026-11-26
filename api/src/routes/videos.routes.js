
import { Router } from 'express';

import { autenticar } from '../middlewares/auth.middleware.js';
import { esNombreVideoSeguro } from '../utils/video.util.js';
import { servirVideoAutorizado } from '../controllers/progreso.controller.js';
import { AppError } from '../utils/app-error.js';

const router = Router();

router.get(
    '/:archivo',
    autenticar,
    (req, res, next) => {
        if (!esNombreVideoSeguro(req.params.archivo)) {
            throw new AppError(
                404,
                'VIDEO_NOT_FOUND',
                'El video solicitado no existe'
            );
        }

        next();
    },
    servirVideoAutorizado
);

export default router;
