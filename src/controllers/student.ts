import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { job, jobApplication, skillsEnum, student, studentSkill } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { generateToken } from '@/utils/jwt';
import { loginUserSchema, registerUserSchema, updateUserSchema } from '@/validators/user.validator';
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { isEmailOrUsernameTaken, isStudentExist } from '@/utils/db';
import { removePassword } from '@/utils/others';
import { skillsSchema } from '@/validators/skills';

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(res.locals.data.id);

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid student id is required',
            data: null,
        });
    }

    const data = updateUserSchema.parse(req.body);

    const students = await db.select().from(student).where(eq(student.id, id));

    if (!students) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
            data: null,
        });
    }

    const existingStudent = await isEmailOrUsernameTaken(data.email, data.username, id);
    if (existingStudent.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email or username is already taken by another student',
            data: null,
        });
    }
    const updatedStudent = await db.update(student).set(data).where(eq(student.id, id)).returning();

    return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: removePassword(updatedStudent[0]),
    });
});

export const getMatchingJobs = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(res.locals.data.id);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid student ID is required',
            data: null,
        });
    }

    const [user] = await db.select().from(student).where(eq(student.id, studentId));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
            data: null,
        });
    }

    const userSkills = await db.select().from(studentSkill).where(eq(studentSkill.studentId, studentId));
    const skillSet = new Set(userSkills.map((s) => s.skill));

    const allJobs = await db.select().from(job);

    const matchingJobs = allJobs
        .map((job) => {
            const jobSkills = job.requiredSkills || []; // ensure schema supports this
            const matches = jobSkills.filter((skill) =>
                skillSet.has(skill as typeof skillSet extends Set<infer T> ? T : never)
            );
            return {
                ...job,
                matchScore: matches.length,
            };
        })
        .filter((job) => job.matchScore > 0)
        .sort((a, b) => {
            if (b.matchScore === a.matchScore) {
                return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
            }
            return b.matchScore - a.matchScore;
        });

    if (!matchingJobs || matchingJobs.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No matching jobs found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Matching jobs fetched successfully',
        data: matchingJobs,
    });
});

export const getStudentApplications = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(res.locals.data.id);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({ success: false, message: 'Invalid student ID', data: null });
    }

    const applications = await db
        .select({
            application: jobApplication,
            job: job,
        })
        .from(jobApplication)
        .where(eq(jobApplication.studentId, studentId))
        .innerJoin(job, eq(jobApplication.jobId, job.id))
        .orderBy(desc(jobApplication.createdAt));

    return res.status(200).json({
        success: true,
        message: 'Applications fetched',
        data: applications,
    });
});

export const applyToJob = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(res.locals.data.id);
    const jobId = Number(req.params?.jobId);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({ success: false, message: 'Invalid student ID', data: null });
    }

    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid job ID', data: null });
    }

    const isStudent = await db.select().from(student).where(eq(student.id, studentId));
    if (!isStudent || isStudent.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }

    const existingJob = await db.select().from(job).where(eq(job.id, jobId));
    if (!existingJob || existingJob.length === 0) {
        return res.status(404).json({ success: false, message: 'Job not found', data: null });
    }

    const existing = await db
        .select()
        .from(jobApplication)
        .where(and(eq(jobApplication.studentId, studentId), eq(jobApplication.jobId, jobId)));

    if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Already applied', data: null });
    }

    const [applied] = await db.insert(jobApplication).values({ studentId, jobId }).returning();

    return res.status(200).json({
        success: true,
        message: 'Application submitted',
        data: applied,
    });
});

export const addSkillsToStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId = Number(res.locals.data.id);
    const { skills } = skillsSchema.parse(req.body);

    if (!studentId || isNaN(studentId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid student ID',
            data: null,
        });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Skills array is required',
            data: null,
        });
    }

    const [studentExists] = await db.select().from(student).where(eq(student.id, studentId));
    if (!studentExists) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
            data: null,
        });
    }

    const validSkills = skillsEnum.enumValues;
    const validInputSkills = skills.filter((skill) => validSkills.includes(skill));
    if (validInputSkills.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No valid skills provided',
            data: null,
        });
    }

    await db.delete(studentSkill).where(eq(studentSkill.studentId, studentId));

    await db.insert(studentSkill).values(
        validInputSkills.map((skill) => ({
            studentId,
            skill,
        }))
    );

    return res.status(200).json({
        success: true,
        message: 'Skills added to student successfully',
        data: validInputSkills,
    });
});

export const getStudentSkills = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(res.locals.data.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid student id is required',
            data: null,
        });
    }

    const existingStudent = await db.select().from(student).where(eq(student.id, id));

    if (existingStudent.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
            data: null,
        });
    }

    const studentSkills = await db.select().from(studentSkill).where(eq(studentSkill.studentId, id));

    if (!studentSkills || studentSkills.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Skill not found',
            data: null,
        });
    }

    const skills = studentSkills.map((skillTable) => skillTable.skill);

    return res.status(200).json({
        success: true,
        message: 'Skill fetched successfully',
        data: skills,
    });
});
