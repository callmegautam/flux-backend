import db from '@/db';
import { skillsEnum, student, studentSkill } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import { allSkills } from '@/utils/db';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

export const getSkills = asyncHandler(async (req: Request, res: Response) => {
    const skills = await allSkills();
    return res.status(200).json({
        success: true,
        message: 'Skills fetched successfully',
        data: skills,
    });
});

export const getSkillsByStudentId = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params?.id);
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
