import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { Role, users, Island } from "./auth";
import { comments } from "./comments";
import { files } from "./files";
import { images } from "./images";

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  authorId: text("author_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const noticesRelations = relations(notices, ({ many, one }) => ({
  images: many(images),
  files: many(files),
  comments: many(comments),
  author: one(users, {
    fields: [notices.authorId],
    references: [users.id],
  }),
}));

export type Notice = typeof notices.$inferSelect;

export type NewNotice = Omit<
  Notice,
  "id" | "createdAt" | "updatedAt" | "viewCount" | "authorId"
> & {
  images: {
    url: string;
    key: string;
  }[];
  files: {
    name: string;
    url: string;
    key: string;
  }[];
};

export const CreateNoticeSchema = createInsertSchema(notices)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
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
    isPinned: z.boolean().default(false),
    viewCount: z.number().default(0),
    title: z.string({
      required_error: "제목은 필수 입력 사항입니다.",
    }),
    content: z.string({
      required_error: "내용은 필수 입력 사항입니다.",
    }),
  });

export const EditNoticeSchema = CreateNoticeSchema.extend({
  id: z.number({
    required_error: "공지 아이디가 잘못되었습니다.",
  }),
  viewCount: z.number(),
});

// Define a more detailed type for the fetched notices
export interface FetchedNotice extends Notice {
  author: {
    id: string;
    name: string | null;
    role: Role | null; // Never actually null
    islands?: {
      island: Island;
    }[];
  } | null; // Allow null author based on the second query's simpler fetch
}
