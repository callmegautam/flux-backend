import {
    pgTable,
    uniqueIndex,
    serial,
    text,
    boolean,
    timestamp,
    foreignKey,
    integer,
    pgEnum,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const verificationStatus = pgEnum('VerificationStatus', [
    'PENDING',
    'AUTO_VERIFIED',
    'MANUAL_REVIEW',
    'VERIFIED',
    'REJECTED',
]);

export const jobType = pgEnum('JobType', ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT']);
export const jobMode = pgEnum('JobMode', ['REMOTE', 'ONSITE', 'HYBRID']);
export const jobApplicationStatusEnum = pgEnum('job_application_status', [
    'SHORTLISTED',
    'REJECTED',
    'APPLIED',
    'HIRED',
]);
export const course = pgEnum('Course', ['BCA', 'BSc_CS', 'BTech', 'MCA', 'MTech', 'Diploma_CS', 'Other']);
export const skillsEnum = pgEnum('Skill', [
    'C',
    'C++',
    'Python',
    'JavaScript',
    'TypeScript',
    'NodeJS',
    'ReactJS',
    'NextJS',
    'TailwindCSS',
    'HTML',
    'CSS',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'ExpressJS',
    'Django',
    'Flask',
    'AWS',
    'Docker',
    'Git',
    'Figma',
    'Java',
    'GoLang',
    'Rust',
    'Other',
]);

export const company = pgTable(
    'company',
    {
        id: serial().primaryKey().notNull(),
        email: text().notNull(),
        password: text().notNull(),
        companyName: text().notNull(),
        domain: text().notNull(),
        description: text(),
        website: text(),
        address: text(),
        linkedinUrl: text(),
        logoUrl: text(),
        isVerified: boolean().default(false).notNull(),
        verificationStatus: verificationStatus().default('PENDING').notNull(),
        createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp({ precision: 3, mode: 'string' }),
    },
    (table) => [
        uniqueIndex('Company_domain_key').using('btree', table.domain.asc().nullsLast().op('text_ops')),
        uniqueIndex('Company_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
    ]
);

export const college = pgTable('college', {
    id: serial().primaryKey().notNull(),
    name: text().notNull(),
    location: text().notNull(),
});

export const student = pgTable(
    'student',
    {
        id: serial().primaryKey().notNull(),
        email: text().notNull(),
        password: text().notNull(),
        username: text().notNull(),
        name: text().notNull(),
        course: course(),
        admissionYear: integer(),
        currentYear: integer(),
        gradYear: integer(),
        collegeId: integer(),
        githubUrl: text(),
        resumeUrl: text(),
        avatarUrl: text(),
        createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp({ precision: 3, mode: 'string' }),
    },
    (table) => [
        uniqueIndex('Student_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
        uniqueIndex('Student_username_key').using('btree', table.username.asc().nullsLast().op('text_ops')),
        foreignKey({
            columns: [table.collegeId],
            foreignColumns: [college.id],
            name: 'Student_collegeId_fkey',
        })
            .onUpdate('cascade')
            .onDelete('set null'),
    ]
);

export const job = pgTable(
    'job',
    {
        id: serial().primaryKey().notNull(),
        title: text(),
        description: text(),
        location: text(),
        // salary: text(),
        jobType: jobType(),
        jobMode: jobMode(),
        companyId: integer(),
        requiredSkills: skillsEnum().array().default([]),
        createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
        // createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp({ precision: 3, mode: 'string' }),
    },
    (table) => [
        foreignKey({
            columns: [table.companyId],
            foreignColumns: [company.id],
            name: 'Job_companyId_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ]
);

export const jobApplication = pgTable('job_application', {
    id: serial('id').primaryKey(),
    studentId: integer('student_id')
        .notNull()
        .references(() => student.id, { onDelete: 'cascade' }),
    jobId: integer('job_id')
        .notNull()
        .references(() => job.id, { onDelete: 'cascade' }),
    status: text('status').$type<'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'>().default('APPLIED'),
    createdAt: timestamp('created_at', { mode: 'string', precision: 3 }).defaultNow(),
});

// export const jobSkill = pgTable(
//     'jobSkill',
//     {
//         jobId: integer().notNull(),
//         skill: skillsEnum(),
//     },
//     (table) => ({
//         pk: primaryKey({ columns: [table.jobId, table.skill] }),
//         fk_job: foreignKey({
//             columns: [table.jobId],
//             foreignColumns: [job.id],
//             name: 'jobSkill_jobId_fkey',
//         })
//             .onUpdate('cascade')
//             .onDelete('cascade'),
//     })
// );

export const studentSkill = pgTable(
    'studentSkill',
    {
        studentId: integer().notNull(),
        skill: skillsEnum(),
    },
    (table) => ({
        // pk: primaryKey({ columns: [table.studentId, table.skill] }),
        fk_student: foreignKey({
            columns: [table.studentId],
            foreignColumns: [student.id],
            name: 'studentSkill_studentId_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    })
);

// export const studentRelations = relations(student, ({ one }) => ({
//     college: one(college, {
//         fields: [student.collegeId],
//         references: [college.id],
//     }),
// }));

// export const collegeRelations = relations(college, ({ many }) => ({
//     students: many(student),
// }));
