import { Router } from 'express';
import { storyRouter } from './story.routes';
import { ipRouter } from './ip.routes';

const router = Router();

// 라우트 등록
router.use('/stories', storyRouter);
router.use('/v1/ip', ipRouter);

export { router as routes };