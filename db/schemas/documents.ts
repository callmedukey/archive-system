import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "./auth";
import { comments } from "./comments";
import { files } from "./files";
import { images } from "./images";

export const documentFormats = pgTable("document_formats", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  content: text("content").notNull(),

  applyActivity: boolean("apply_activity").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const documentFormatsRelations = relations(
  documentFormats,
  ({ many }) => ({
    documents: many(documents),
  })
);

export const documentActivityTypes = pgTable("document_activity_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  textCode: text("text_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityType = typeof documentActivityTypes.$inferSelect;

export const ActivityTypeSchema = createInsertSchema(documentActivityTypes)
  .pick({
    name: true,
    textCode: true,
  })
  .extend({
    name: z
      .string({ required_error: "활동 분류 이름을 입력해주세요." })
      .min(1, { message: "활동 분류 이름을 입력해주세요." }),
    textCode: z
      .string({ required_error: "활동 분류 코드를 입력해주세요." })
      .min(1, { message: "활동 분류 코드를 입력해주세요." }),
  });

export const documentActivityRelations = relations(
  documentActivityTypes,
  ({ many }) => ({
    contents: many(documentActivityContents),
  })
);

export const documentActivityContents = pgTable(
  "document_activity_contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    numericalCode: integer("numerical_code").notNull(),
    activityTypeId: uuid("activity_type_id"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.activityTypeId],
      foreignColumns: [documentActivityTypes.id],
      name: "doc_activity_contents_type_fk",
    }).onDelete("cascade"),
  ]
);

export type ActivityContent = typeof documentActivityContents.$inferSelect;

export const ActivityContentSchema = createInsertSchema(
  documentActivityContents
)
  .pick({
    name: true,
    numericalCode: true,
    activityTypeId: true,
  })
  .extend({
    name: z
      .string({ required_error: "활동 내용을 입력해주세요." })
      .min(1, { message: "활동 내용을 입력해주세요." }),
    numericalCode: z.coerce
      .number({ required_error: "활동 내용 순서를 입력해주세요." })
      .min(0, { message: "활동 내용 코드를 입력해주세요." }),
    activityTypeId: z
      .string({ required_error: "활동 분류를 선택해주세요." })
      .min(1, { message: "활동 분류를 선택해주세요." }),
  });

export const documentActivityContentsRelations = relations(
  documentActivityContents,
  ({ one }) => ({
    activityType: one(documentActivityTypes, {
      fields: [documentActivityContents.activityTypeId],
      references: [documentActivityTypes.id],
    }),
  })
);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),

  islandName: text("island_name").notNull(),
  regionName: text("region_name").notNull(),

  reportDate: timestamp("report_date", { mode: "date" }).notNull(),

  reportMonth: integer("report_month").notNull(),
  reportYear: integer("report_year").notNull(),

  reporter: text("reporter").notNull(),
  contractPeriodStart: timestamp("contract_period_start", {
    mode: "date",
  }).notNull(),
  contractPeriodEnd: timestamp("contract_period_end", {
    mode: "date",
  }).notNull(),
  reportingCompany: text("reporting_company").notNull(),
  level: integer("level").notNull(),
  status: text("status").notNull(),

  typeName: text("type_name").notNull(),
  typeContent: text("type_content").notNull(),

  approvedDate: timestamp("approved_date", { mode: "date" }),
  editRequestDate: timestamp("edit_request_date", { mode: "date" }),
  editRequestReason: text("edit_request_reason"),

  activityPeriodStart: timestamp("activity_period_start", { mode: "date" }),
  activityPeriodEnd: timestamp("activity_period_end", { mode: "date" }),
  activityLocation: text("activity_location").notNull(),
  innerActivityParticipantsNumber: integer(
    "inner_activity_participants_number"
  ),
  outerActivityParticipantsNumber: integer(
    "outer_activity_participants_number"
  ),

  formatId: uuid("format_id").references(() => documentFormats.id, {
    onDelete: "set null",
  }),

  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  format: one(documentFormats, {
    fields: [documents.formatId],
    references: [documentFormats.id],
  }),
  comments: many(comments),
  files: many(files),
  images: many(images),
}));
