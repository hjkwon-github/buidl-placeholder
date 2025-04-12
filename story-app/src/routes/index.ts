import { Router } from 'express';
import { ipRouter } from './ip.routes';

const router = Router();

router.use('/v1/ip', ipRouter);

export { router as routes };