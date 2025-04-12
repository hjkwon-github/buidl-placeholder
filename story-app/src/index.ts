import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { Logger } from './services/logger.service';
import { setupSwagger } from './config/swagger';

dotenv.config();

const logger = new Logger();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger 설정
setupSwagger(app);

// API 라우트 설정
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Story Protocol API server is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
  logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});