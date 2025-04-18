import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

import { inquiries } from "./inquiries";
import { notices } from "./notices";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  key: text("key").notNull(),
  noticeId: integer("notice_id").references(() => notices.id),
  inquiryId: integer("inquiry_id").references(() => inquiries.id),
});

export const imagesRelations = relations(images, ({ one }) => ({
  notice: one(notices, {
    fields: [images.noticeId],
    references: [notices.id],
  }),
  inquiry: one(inquiries, {
    fields: [images.inquiryId],
    references: [inquiries.id],
  }),
}));
