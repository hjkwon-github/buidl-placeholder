import { Router } from 'express';
import { storyRouter } from './story.routes';

const router = Router();

router.use('/stories', storyRouter);

export { router as routes }; 