import { Router } from 'express';
import * as Student from '@/controllers/student';
import { authMiddleware, authMiddlewareWithRole } from '@/middlewares/auth.middleware';

const router = Router();

// ? crud
router.put('/', authMiddlewareWithRole('STUDENT'), Student.updateStudent);

// ? skill
router.get('/skills', authMiddlewareWithRole('STUDENT'), Student.getStudentSkills);
router.post('/skills', authMiddlewareWithRole('STUDENT'), Student.addSkillsToStudent);

// ? jobs
router.get('/matching-jobs', authMiddlewareWithRole('STUDENT'), Student.getMatchingJobs);
router.post('/apply/:jobId', authMiddlewareWithRole('STUDENT'), Student.applyToJob);

// ? applications
router.get('/applications', authMiddlewareWithRole('STUDENT'), Student.getStudentApplications);

export default router;
