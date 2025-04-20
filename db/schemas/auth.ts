import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

import { enumToPgEnum } from "@/lib/utils/db/enum-to-pg-enum";

import { notices } from "./notices";
import { notifications } from "./notifications";

export enum Role {
  USER = "user",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
}
export enum VerificationStatus {
  VERIFIED = "verified",
  UNVERIFIED = "unverified",
  VERIFICATION_PENDING = "verification_pending",
}

export const roleEnum = pgEnum("role", enumToPgEnum(Role));
export const verificationStatusEnum = pgEnum(
  "verification_status",
  enumToPgEnum(VerificationStatus)
);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").unique().notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  company: text("company"),
  companyPhone: text("company_phone"),
  password: text("password").notNull(),
  verified: verificationStatusEnum("verified").default(
    VerificationStatus.UNVERIFIED
  ),
  level: integer("level").default(0),
  salt: text("salt").notNull(),
  role: roleEnum("role").default(Role.USER),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  islands: many(usersToIslands),
  regions: many(usersToRegions),
  notices: many(notices),
  notifications: many(notifications),
}));

export const islands = pgTable("island", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  regionId: text("regionId")
    .notNull()
    .references(() => regions.id),
});

export type Island = typeof islands.$inferSelect;

export const islandsRelations = relations(islands, ({ many, one }) => ({
  users: many(usersToIslands),
  region: one(regions, {
    fields: [islands.regionId],
    references: [regions.id],
  }),
}));

export const usersToIslands = pgTable("usersToIslands", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  islandId: text("islandId")
    .notNull()
    .references(() => islands.id, { onDelete: "cascade" }),
});

export const usersToIslandsRelations = relations(usersToIslands, ({ one }) => ({
  user: one(users, {
    fields: [usersToIslands.userId],
    references: [users.id],
  }),
  island: one(islands, {
    fields: [usersToIslands.islandId],
    references: [islands.id],
  }),
}));

export const regions = pgTable("region", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
});

export type Region = typeof regions.$inferSelect;

export const regionsRelations = relations(regions, ({ many }) => ({
  users: many(usersToRegions),
  islands: many(islands),
}));

export const usersToRegions = pgTable("usersToRegions", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  regionId: text("regionId")
    .notNull()
    .references(() => regions.id, { onDelete: "cascade" }),
});

export const usersToRegionsRelations = relations(usersToRegions, ({ one }) => ({
  user: one(users, {
    fields: [usersToRegions.userId],
    references: [users.id],
  }),
  region: one(regions, {
    fields: [usersToRegions.regionId],
    references: [regions.id],
  }),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);
