import { relations } from "drizzle-orm";
import { integer, timestamp, text, pgTable, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { User, users } from "./auth";
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
  inquiry: one(inquiries, {
    fields: [comments.inquiryId],
    references: [inquiries.id],
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
    noticeId: z.coerce
      .number({
        required_error: "공지 아이디가 잘못되었습니다.",
      })
      .optional(),
    inquiryId: z.coerce
      .number({
        required_error: "문의 아이디가 잘못되었습니다.",
      })
      .optional(),
  })
  .refine(
    (data) => {
      return data.noticeId || data.inquiryId;
    },
    {
      path: ["noticeId", "inquiryId"],
      message: "공지 또는 문의 아이디를 입력해주세요.",
    }
  );

export type CreateCommentSchemaType = z.infer<typeof CreateCommentSchema>;

export type Comment = typeof comments.$inferSelect;

export type CommentWithAuthor = Comment & {
  author: User;
};
