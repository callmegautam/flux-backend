import { course, jobType, jobMode, skillsEnum } from '@/db/schema';

export type CourseType = (typeof course.enumValues)[number];
export type JobType = (typeof jobType.enumValues)[number];
export type JobMode = (typeof jobMode.enumValues)[number];
export type Skill = (typeof skillsEnum.enumValues)[number];

export const COURSE_OPTIONS = course.enumValues;
export const JOB_TYPE_OPTIONS = jobType.enumValues;
export const JOB_MODE_OPTIONS = jobMode.enumValues;
export const SKILL_OPTIONS = skillsEnum.enumValues;
