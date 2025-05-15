import { Router } from 'express';

import * as Admin from '@/controllers/admin';

const router = Router();

// ? companies
router.get('/companies', Admin.getCompanies);
router.get('/companies/id/:id', Admin.getCompanyById);

// ? students
router.get('/students', Admin.getStudents);
router.get('/students/id/:id', Admin.getStudentById);
router.get('/students/username/:username', Admin.getStudentByUsername);

// ? jobs
router.get('/jobs', Admin.getJobs);
router.get('/jobs/id/:id', Admin.getJobById);

export default router;
