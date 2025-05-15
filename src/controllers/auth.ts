import { cookieOptions } from '@/config/cookies';
import type { Request, Response } from 'express';
import db from '@/db';
import { company, student } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { generateToken } from '@/utils/jwt';
import { loginUserSchema, registerUserSchema } from '@/validators/user.validator';
import { isCompanyExist, isStudentExist } from '@/utils/db';
import { removePassword } from '@/utils/others';
import { loginCompanySchema, registerCompanySchema } from '@/validators/company.validator';

export const registerStudent = asyncHandler(async (req: Request, res: Response) => {
    const data = registerUserSchema.parse(req.body);
    const existingStudent = await isStudentExist(data.email, data.username);

    if (existingStudent) {
        return res.status(400).json({ success: false, message: 'Student already exists', data: null });
    }

    const newStudent = await db.insert(student).values(data).returning();

    return res.status(200).json({
        success: true,
        message: 'Student created successfully',
        data: removePassword(newStudent[0]),
    });
});

export const loginStudent = asyncHandler(async (req: Request, res: Response) => {
    const data = loginUserSchema.parse(req.body);

    const existingStudent = await isStudentExist(data.email, '');

    if (!existingStudent) {
        return res.status(400).json({ success: false, message: 'Student not found', data: null });
    }

    if (existingStudent.password !== data.password) {
        return res.status(400).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const token = generateToken({ id: existingStudent.id, role: 'STUDENT' });

    return res
        .status(200)
        .cookie('authorization', token, cookieOptions)
        .json({
            success: true,
            message: 'Student logged in successfully',
            data: removePassword(existingStudent),
            token,
        });
});

export const logoutStudent = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('authorization');
    return res.status(200).json({ success: true, message: 'Student logged out successfully', data: null });
});

export const registerCompany = asyncHandler(async (req: Request, res: Response) => {
    const data = registerCompanySchema.parse(req.body);

    const existingCompany = await isCompanyExist(data.email, data.domain);

    if (existingCompany) {
        return res.status(409).json({
            success: false,
            message: 'Email or domain is already used by another company',
            data: null,
        });
    }

    const newCompany = await db.insert(company).values(data).returning();

    return res.status(200).json({
        success: true,
        message: 'Company registered successfully',
        data: removePassword(newCompany[0]),
    });
});

export const loginCompany = asyncHandler(async (req: Request, res: Response) => {
    const data = loginCompanySchema.parse(req.body);

    const existingCompany = await isCompanyExist(data.email, '');

    if (!existingCompany) {
        return res.status(400).json({
            success: false,
            message: 'Company not found',
            data: null,
        });
    }

    if (existingCompany.password !== data.password) {
        return res.status(400).json({
            success: false,
            message: 'Invalid credentials',
            data: null,
        });
    }

    const token = generateToken({ id: existingCompany.id, role: 'COMPANY' });

    return res
        .status(200)
        .cookie('authorization', token, cookieOptions)
        .json({
            success: true,
            message: 'Company logged in successfully',
            data: removePassword(existingCompany),
            token,
        });
});

export const logoutCompany = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('authorization');
    return res.status(200).json({
        success: true,
        message: 'Company logged out successfully',
        data: null,
    });
});
