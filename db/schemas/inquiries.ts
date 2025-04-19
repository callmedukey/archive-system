import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { User, users } from "./auth";
import { comments, CommentWithAuthor } from "./comments";
import { files } from "./files";
import { images } from "./images";
import { notifications } from "./notifications";

import { Inquiry } from ".";

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: text("user_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inquiriesRelations = relations(inquiries, ({ one, many }) => ({
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
  comments: many(comments),
  files: many(files),
  images: many(images),
  notifications: many(notifications),
}));

export type InquiryWithUser = {
  inquiry: Inquiry;
  user: { username: User["username"] } | null; // Allow user to be potentially null due to left join
};

export const CreateInquirySchema = createInsertSchema(inquiries)
  .omit({
    userId: true,
    createdAt: true,
    id: true,
  })
  .extend({
    images: z.array(
      z.object({
        url: z.string({
          required_error: "이미지 주소가 잘못되었습니다.",
        }),
        key: z.string({
          required_error: "이미지 키가 잘못되었습니다.",
        }),
      })
    ),
    files: z.array(
      z.object({
        name: z.string({
          required_error: "파일 이름이 잘못되었습니다.",
        }),
        url: z.string({
          required_error: "파일 주소가 잘못되었습니다.",
        }),
        key: z.string({
          required_error: "파일 키가 잘못되었습니다.",
        }),
      })
    ),
    title: z
      .string({
        required_error: "제목은 필수 입력 사항입니다.",
      })
      .trim()
      .min(1, {
        message: "제목은 필수 입력 사항입니다.",
      }),
    content: z
      .string({
        required_error: "내용은 필수 입력 사항입니다.",
      })
      .trim()
      .min(1, {
        message: "내용은 필수 입력 사항입니다.",
      }),
  });

export type NewInquiry = z.infer<typeof CreateInquirySchema>;

export const EditInquirySchema = CreateInquirySchema.extend({
  id: z.number({
    required_error: "문의 아이디가 잘못되었습니다.",
  }),
});

export type SingleInquiry = Inquiry & {
  user: User;
  files: {
    name: string;
    url: string;
    key: string;
  }[];
  images: {
    url: string;
    key: string;
  }[];
  comments: CommentWithAuthor[];
};
