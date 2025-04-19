import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { inquiries } from "./inquiries";
import { notices } from "./notices";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  isRead: boolean("is_read").notNull().default(false),
  noticeId: integer("notice_id").references(() => notices.id),
  inquiryId: integer("inquiry_id").references(() => inquiries.id),
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
}));
