import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";

const timestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
};

export const packages = pgTable("packages", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    // fileUrl: varchar("file_url", { length: 255 }),
    latestVersion: varchar("latest_version", { length: 50 }).notNull(),
    license: varchar("license", { length: 50 }),
    description: text("description"),
    readme: text("readme"),
    ...timestamps,
});

export const versions = pgTable("versions", {
    id: serial("id").primaryKey(),
    packageId: integer("package_id")
        .notNull()
        .references(() => packages.id, { onDelete: "cascade" }),
    version: varchar("version", { length: 50 }).notNull(),
    fileUrl: varchar("tarball_url", { length: 255 }),
    ...timestamps,
});

// export const packageVersions = pgTable(
//     "package_versions",
//     {
//         packageId: integer("package_id")
//             .notNull()
//             .references(() => packages.id, { onDelete: "cascade" }),
//         versionId: integer("version_id")
//             .notNull()
//             .references(() => versions.id, { onDelete: "cascade" }),
//         ...timestamps,
//     },
//     (table) => ({
//         pk: [table.packageId, table.versionId],
//     })
// );

export const authors = pgTable("authors", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }),
    ...timestamps,
});

export const packageAuthors = pgTable(
    "package_authors",
    {
        packageId: integer("package_id")
            .notNull()
            .references(() => packages.id, { onDelete: "cascade" }),
        authorId: integer("author_id")
            .notNull()
            .references(() => authors.id, { onDelete: "cascade" }),
        ...timestamps,
    },
    (table) => ({
        pk: [table.packageId, table.authorId],
    })
);

export const keywords = pgTable("keywords", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    ...timestamps,
});

export const keywordsPackages = pgTable(
    "keywords_packages",
    {
        keywordId: integer("keyword_id")
            .notNull()
            .references(() => keywords.id, { onDelete: "cascade" }),
        packageId: integer("package_id")
            .notNull()
            .references(() => packages.id, { onDelete: "cascade" }),
        ...timestamps,
    },
    (table) => ({
        pk: [table.keywordId, table.packageId],
    })
);
