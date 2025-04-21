"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  Island,
  islands,
  regions,
  Role,
  User,
  users,
  usersToIslands,
  usersToRegions,
} from "@/db/schemas";

export async function getIslandsByRegion(
  _: Island[] | null,
  regionId: string,
  searchRole?: Role
): Promise<Island[]> {
  if (!regionId) {
    return [];
  }
  const results = await db
    .selectDistinct({ island: islands })
    .from(islands)
    .innerJoin(usersToIslands, eq(islands.id, usersToIslands.islandId))
    .innerJoin(users, eq(usersToIslands.userId, users.id))
    .where(
      and(
        eq(islands.regionId, regionId),
        eq(users.role, searchRole || Role.USER)
      )
    );

  const foundIslands = results.map((result) => result.island);
  return foundIslands;
}

export async function getUsersByIsland(islandId: string): Promise<User[]> {
  const foundUsers = await db
    .select({
      id: users.id,
      username: users.username,
      verified: users.verified,
      level: users.level,
      phone: users.phone,
      email: users.email,
      company: users.company,
      companyPhone: users.companyPhone,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(usersToIslands, eq(users.id, usersToIslands.userId))
    .innerJoin(islands, eq(usersToIslands.islandId, islands.id))
    .where(and(eq(islands.id, islandId), eq(users.role, Role.USER)));
  return foundUsers as User[];
}

export async function getUsersByRegion(
  regionId: string
): Promise<(User & { region: string })[]> {
  const query = await db
    .select({
      user: {
        id: users.id,
        username: users.username,
        verified: users.verified,
        level: users.level,
        phone: users.phone,
        email: users.email,
        company: users.company,
        companyPhone: users.companyPhone,
        createdAt: users.createdAt,
      },
      region: regions,
    })
    .from(users)
    .innerJoin(usersToRegions, eq(users.id, usersToRegions.userId))
    .innerJoin(regions, eq(usersToRegions.regionId, regions.id))
    .where(and(eq(regions.id, regionId), eq(users.role, Role.USER)));
  const foundUsers = query.map(({ user, region }) => ({
    ...user,
    region: region.name,
  }));

  return foundUsers as (User & { region: string })[];
}

export async function getAdminsByRegion(
  regionId: string
): Promise<(User & { region: string })[]> {
  const query = await db
    .select({
      user: {
        id: users.id,
        name: users.name,
        verified: users.verified,
        phone: users.phone,
        email: users.email,
        createdAt: users.createdAt,
      },
      region: regions,
    })
    .from(users)
    .innerJoin(usersToRegions, eq(users.id, usersToRegions.userId))
    .innerJoin(regions, eq(usersToRegions.regionId, regions.id))
    .where(and(eq(regions.id, regionId), eq(users.role, Role.ADMIN)));

  const foundUsers = query.map(({ user, region }) => ({
    ...user,
    region: region.name,
  }));
  return foundUsers as (User & { region: string })[];
}
