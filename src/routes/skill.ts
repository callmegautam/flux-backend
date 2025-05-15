import { Router } from 'express';
import * as Skill from '@/controllers/skill';

const router = Router();

router.get('/', Skill.getSkills);
export default router;
