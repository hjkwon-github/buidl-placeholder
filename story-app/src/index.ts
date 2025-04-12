import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { routes } from './routes';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 설정
app.use('/api', routes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'Story Protocol API server is running' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 