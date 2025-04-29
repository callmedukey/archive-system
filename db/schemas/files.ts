import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

import { documents } from "./documents";
import { inquiries } from "./inquiries";
import { notices } from "./notices";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  key: text("key").notNull(),

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

export const filesRelations = relations(files, ({ one }) => ({
  notice: one(notices, {
    fields: [files.noticeId],
    references: [notices.id],
  }),
  inquiry: one(inquiries, {
    fields: [files.inquiryId],
    references: [inquiries.id],
  }),
  document: one(documents, {
    fields: [files.documentId],
    references: [documents.id],
  }),
}));
