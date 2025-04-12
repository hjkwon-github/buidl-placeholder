import { Router } from 'express';

const router = Router();

// 스토리 생성
router.post('/', (req, res) => {
  res.status(201).json({ message: '스토리가 생성되었습니다.' });
});

// 스토리 목록 조회
router.get('/', (req, res) => {
  res.json({ message: '스토리 목록을 조회합니다.' });
});

// 스토리 상세 조회
router.get('/:id', (req, res) => {
  res.json({ message: `ID: ${req.params.id}의 스토리를 조회합니다.` });
});

// 스토리 수정
router.put('/:id', (req, res) => {
  res.json({ message: `ID: ${req.params.id}의 스토리를 수정합니다.` });
});

// 스토리 삭제
router.delete('/:id', (req, res) => {
  res.json({ message: `ID: ${req.params.id}의 스토리를 삭제합니다.` });
});

export { router as storyRouter }; 