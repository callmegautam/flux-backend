import db from '@/db';
import { company, skillsEnum, student } from '@/db/schema';
import { and, eq, or, sql } from 'drizzle-orm';

export const isStudentExist = async (email: string, username: string) => {
    const existingStudent = await db
        .select()
        .from(student)
        .where(or(eq(student.email, email), eq(student.username, username)));

    if (existingStudent.length > 0) {
        return existingStudent[0];
    }
    return false;
};

export const isCompanyExist = async (email: string, domain: string) => {
    const existingCompany = await db
        .select()
        .from(company)
        .where(or(eq(company.email, email), eq(company.domain, domain)));

    if (existingCompany.length > 0) {
        return existingCompany[0];
    }
    return false;
};

export const isEmailOrUsernameTaken = async (email: string, username: string, excludeId?: number) => {
    return await db
        .select()
        .from(student)
        .where(
            or(
                and(eq(student.email, email), sql`${student.id} != ${excludeId}`),
                and(eq(student.username, username), sql`${student.id} != ${excludeId}`)
            )
        );
};

export const isEmailOrDomainTaken = async (email: string, domain: string, excludeId?: number) => {
    return await db
        .select()
        .from(company)
        .where(
            or(
                and(eq(company.email, email), sql`${company.id} != ${excludeId}`),
                and(eq(company.domain, domain), sql`${company.id} != ${excludeId}`)
            )
        );
};

export const allSkills = async () => {
    return Array.isArray(skillsEnum.enumValues) ? skillsEnum.enumValues : [];
};
