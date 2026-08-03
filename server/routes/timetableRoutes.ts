import { Router } from 'express';
import {
  getTimetableSlots,
  checkConflicts,
  getRoomStats,
  createSlot,
  updateSlot,
  deleteSlot,
} from '../controllers/timetableController.js';

const router = Router();

router.get('/', getTimetableSlots);
router.post('/check-conflicts', checkConflicts);
router.get('/rooms', getRoomStats);
router.post('/', createSlot);
router.put('/:id', updateSlot);
router.delete('/:id', deleteSlot);

export default router;
