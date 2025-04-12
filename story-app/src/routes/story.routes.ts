import { Router } from 'express';

const router = Router();

// Create Story
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Story created successfully.' });
});

// Get Story List
router.get('/', (req, res) => {
  res.json({ message: 'Get Story List.' });
});

// Get Story Detail
router.get('/:id', (req, res) => {
  res.json({ message: `Get Story Detail: ${req.params.id}` });
});

// Update Story
router.put('/:id', (req, res) => {
  res.json({ message: `Update Story: ${req.params.id}` });
});

// Delete Story
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete Story: ${req.params.id}` });
});

export { router as storyRouter }; 