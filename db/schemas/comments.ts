import { relations } from "drizzle-orm";
import { integer, timestamp, text, pgTable, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "./auth";
import { inquiries } from "./inquiries";
import { notices } from "./notices";

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  noticeId: integer("notice_id").references(() => notices.id, {
    onDelete: "cascade",
  }),
  inquiryId: integer("inquiry_id").references(() => inquiries.id, {
    onDelete: "cascade",
  }),
  authorId: text("author_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Define relations for comments
export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  notice: one(notices, {
    // Also define the relation back to the notice
    fields: [comments.noticeId],
    references: [notices.id],
  }),
}));

export const CreateCommentSchema = createInsertSchema(comments)
  .omit({
    id: true,
    createdAt: true,
    authorId: true,
  })
  .extend({
    content: z.string({
      required_error: "댓글 내용은 필수 입력 사항입니다.",
    }),
    noticeId: z.coerce.number({
      required_error: "공지 아이디가 잘못되었습니다.",
    }),
  });

export type CreateCommentSchemaType = z.infer<typeof CreateCommentSchema>;
