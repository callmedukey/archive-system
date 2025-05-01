import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

import { users } from "./auth";
import { documents } from "./documents";
import { inquiries } from "./inquiries";
import { notices } from "./notices";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  isRead: boolean("is_read").notNull().default(false),
  noticeId: integer("notice_id").references(() => notices.id, {
    onDelete: "cascade",
  }),
  inquiryId: integer("inquiry_id").references(() => inquiries.id, {
    onDelete: "cascade",
  }),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }),
});

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  notice: one(notices, {
    fields: [notifications.noticeId],
    references: [notices.id],
  }),
  inquiry: one(inquiries, {
    fields: [notifications.inquiryId],
    references: [inquiries.id],
  }),
  document: one(documents, {
    fields: [notifications.documentId],
    references: [documents.id],
  }),
}));

export type Notification = typeof notifications.$inferSelect;

export const ReadNotificationSchema = z.object({
  notificationId: z.coerce.number({
    required_error: "알림 ID가 필요합니다.",
  }),
});

export type ReadNotificationSchemaType = z.infer<typeof ReadNotificationSchema>;
