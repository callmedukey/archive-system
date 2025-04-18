import { relations } from "drizzle-orm";
import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";

import { User, users } from "./auth";
import { comments } from "./comments";
import { files } from "./files";
import { images } from "./images";

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
}));

export type InquiryWithUser = {
  inquiry: Inquiry;
  user: { username: User["username"] } | null; // Allow user to be potentially null due to left join
};
