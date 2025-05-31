import {
    pgTable,
    serial,
    varchar,
    text,
    integer,
    timestamp,
    primaryKey,
} from "drizzle-orm/pg-core";

const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const authors = pgTable("authors", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    url: text("url"),
    ...timestamps,
});

export const packages = pgTable("packages", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description"),
    license: varchar("license", { length: 50 }),
    authorId: integer("author_id").references(() => authors.id),
    readme: text("readme"),
    ...timestamps,
});

export const maintainers = pgTable("maintainers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    ...timestamps,
});

export const packageMaintainers = pgTable(
    "package_maintainers",
    {
        packageId: integer("package_id")
            .references(() => packages.id)
            .notNull(),
        maintainerId: integer("maintainer_id")
            .references(() => maintainers.id)
            .notNull(),
        ...timestamps,
    },
    (table) => ({
        pk: primaryKey(table.packageId, table.maintainerId),
    })
);

export const versions = pgTable("versions", {
    id: serial("id").primaryKey(),
    packageId: integer("package_id")
        .references(() => packages.id)
        .notNull(),
    version: varchar("version", { length: 50 }).notNull(),
    main: varchar("main", { length: 255 }),
    type: varchar("type", { length: 50 }),
    license: varchar("license", { length: 50 }),
    gitHead: varchar("git_head", { length: 255 }),
    ...timestamps,
});

export const dist = pgTable("dist", {
    id: serial("id").primaryKey(),
    versionId: integer("version_id")
        .references(() => versions.id)
        .notNull(),
    shasum: varchar("shasum", { length: 255 }),
    tarball: text("tarball"),
    fileCount: integer("file_count"),
    integrity: text("integrity"),
    ...timestamps,
});

export const signatures = pgTable("signatures", {
    id: serial("id").primaryKey(),
    distId: integer("dist_id")
        .references(() => dist.id)
        .notNull(),
    sig: text("sig"),
    keyid: varchar("keyid", { length: 255 }),
    ...timestamps,
});

export const distTags = pgTable("dist_tags", {
    id: serial("id").primaryKey(),
    packageId: integer("package_id")
        .references(() => packages.id)
        .notNull(),
    tag: varchar("tag", { length: 50 }).notNull(),
    version: varchar("version", { length: 50 }).notNull(),
    ...timestamps,
});

export const dependencies = pgTable("dependencies", {
    id: serial("id").primaryKey(),
    versionId: integer("version_id")
        .references(() => versions.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    versionRange: varchar("version_range", { length: 255 }),
    ...timestamps,
});

export const scripts = pgTable("scripts", {
    id: serial("id").primaryKey(),
    versionId: integer("version_id")
        .references(() => versions.id)
        .notNull(),
    scriptName: varchar("script_name", { length: 255 }).notNull(),
    command: text("command"),
    ...timestamps,
});

export const bin = pgTable("bin", {
    id: serial("id").primaryKey(),
    versionId: integer("version_id")
        .references(() => versions.id)
        .notNull(),
    binName: varchar("bin_name", { length: 255 }).notNull(),
    path: text("path"),
    ...timestamps,
});
