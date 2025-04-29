import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

import { documents } from "./documents";
import { inquiries } from "./inquiries";
import { notices } from "./notices";

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  key: text("key").notNull(),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }),
  noticeId: integer("notice_id").references(() => notices.id, {
    onDelete: "cascade",
  }),
  inquiryId: integer("inquiry_id").references(() => inquiries.id, {
    onDelete: "cascade",
  }),
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
  document: one(documents, {
    fields: [images.documentId],
    references: [documents.id],
  }),
}));
