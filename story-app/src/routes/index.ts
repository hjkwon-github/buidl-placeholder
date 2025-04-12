import { Router } from 'express';
import { storyRouter } from './story.routes';

const router = Router();

// 라우터 등록
router.use('/stories', storyRouter);

export { router as routes }; 