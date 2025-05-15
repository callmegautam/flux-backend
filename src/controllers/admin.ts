import type { Request, Response } from 'express';
import db from '@/db';
import { company, job, student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { desc, eq } from 'drizzle-orm';
import { removePassword } from '@/utils/others';

// STUDENTS
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
    const students = await db.select().from(student);
    const studentsWithOutPassword = students.map(({ password, ...student }) => student);
    return res
        .status(200)
        .json({ success: true, message: 'Students fetched successfully', data: studentsWithOutPassword });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);

    if (isNaN(id) || !id) {
        return res.status(400).json({ success: false, message: 'Valid student id is required', data: null });
    }

    const existingStudent = await db.select().from(student).where(eq(student.id, id));

    if (existingStudent.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }

    return res.status(200).json({
        success: true,
        message: 'student fetched successfully',
        data: removePassword(existingStudent[0]),
    });
});

export const getStudentByUsername = asyncHandler(async (req: Request, res: Response) => {
    const username = req.params?.username as string;
    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required', data: null });
    }

    const existingStudent = await db.select().from(student).where(eq(student.username, username));

    if (existingStudent.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found', data: null });
    }

    return res.status(200).json({
        success: true,
        message: 'Student fetched successfully',
        data: removePassword(existingStudent[0]),
    });
});

// COMPANY
export const getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const companies = await db.select().from(company);
    const withoutPassword = companies.map(({ password, ...rest }) => rest);
    return res.status(200).json({
        success: true,
        message: 'Companies fetched successfully',
        data: withoutPassword,
    });
});

export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);
    if (isNaN(id) || !id) {
        return res.status(400).json({
            success: false,
            message: 'Valid company id is required',
            data: null,
        });
    }

    const companies = await db.select().from(company).where(eq(company.id, id));

    if (companies.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Company fetched successfully',
        data: removePassword(companies[0]),
    });
});

// JOBS

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const jobs = await db.select().from(job).orderBy(desc(job.createdAt));

    if (!jobs || jobs.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No jobs found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Jobs fetched successfully',
        data: jobs,
    });
});

export const getJobById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid job ID is required',
            data: null,
        });
    }

    const [jobData] = await db.select().from(job).where(eq(job.id, id));

    if (!jobData) {
        return res.status(404).json({
            success: false,
            message: 'Job not found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Job fetched successfully',
        data: jobData,
    });
});
