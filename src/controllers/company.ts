import db from '@/db';
import { company, job, jobApplication, student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { isEmailOrDomainTaken } from '@/utils/db';
import { removePassword } from '@/utils/others';
import { statusSchema } from '@/validators/application';
import { updateCompanySchema } from '@/validators/company.validator';
import { createJobSchema, updateJobSchema } from '@/validators/job.validator';
import { desc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';

// ? COMPANY

export const updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(res.locals.data.id);

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid company ID is required',
            data: null,
        });
    }

    const data = updateCompanySchema.parse(req.body);

    const companies = await db.select().from(company).where(eq(company.id, id));

    if (companies.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    const existingCompany = await isEmailOrDomainTaken(data.email, data.domain, id);

    if (existingCompany.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Email or domain is already used by another company',
            data: null,
        });
    }

    const updatedCompany = await db.update(company).set(data).where(eq(company.id, id)).returning();

    return res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: removePassword(updatedCompany[0]),
    });
});

// ? JOBS

export const createJob = asyncHandler(async (req: Request, res: Response) => {
    const data = createJobSchema.parse(req.body);
    const id = Number(res.locals.data.id);

    const [companyData] = await db.select().from(company).where(eq(company.id, id));
    if (!companyData) {
        return res.status(404).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    const jobDetails = { ...data, companyId: id };

    const [newJob] = await db.insert(job).values(jobDetails).returning();

    return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: newJob,
    });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid job ID is required',
            data: null,
        });
    }

    const jobExists = await db.select().from(job).where(eq(job.id, id));
    if (!jobExists.length) {
        return res.status(404).json({
            success: false,
            message: 'Job not found',
            data: null,
        });
    }

    const updates = updateJobSchema.parse(req.body);

    const [updatedJob] = await db.update(job).set(updates).where(eq(job.id, id)).returning();

    return res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob,
    });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid job ID is required',
            data: null,
        });
    }

    const [oldJob] = await db.select().from(job).where(eq(job.id, id));
    if (!oldJob) {
        return res.status(404).json({
            success: false,
            message: 'Job not found',
            data: null,
        });
    }

    await db.delete(job).where(eq(job.id, id));

    return res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
        data: null,
    });
});

export const getApplicants = asyncHandler(async (req: Request, res: Response) => {
    const jobId = Number(req.params.jobId);

    if (!jobId || isNaN(jobId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid job ID',
            data: null,
        });
    }

    const applicants = await db
        .select({
            application: jobApplication,
            student: student,
        })
        .from(jobApplication)
        .where(eq(jobApplication.jobId, jobId))
        .innerJoin(student, eq(jobApplication.studentId, student.id));

    if (!applicants || applicants.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No applicants found',
            data: null,
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Applicants fetched',
        data: applicants,
    });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const status = statusSchema.parse(req.body).status;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Valid application ID is required',
            data: null,
        });
    }

    const existingApplication = await db.select().from(jobApplication).where(eq(jobApplication.id, id));

    if (!existingApplication || existingApplication.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Application not found',
            data: null,
        });
    }

    const [updated] = await db
        .update(jobApplication)
        .set({ status })
        .where(eq(jobApplication.id, id))
        .returning();

    return res.status(200).json({
        success: true,
        message: 'Application status updated',
        data: updated,
    });
});

export const getJobs = asyncHandler(async (req: Request, res: Response) => {
    const companyId = Number(res.locals.data.id);
    if (!companyId || isNaN(companyId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid company ID',
            data: null,
        });
    }

    const jobs = await db
        .select({
            job: job,
            company: company,
        })
        .from(job)
        .innerJoin(company, eq(job.companyId, company.id))
        .where(eq(job.companyId, companyId))
        .orderBy(desc(job.createdAt));

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
