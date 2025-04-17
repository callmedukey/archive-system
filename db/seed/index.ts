import createSalt from "@/lib/utils/createSalt";
import { hashPassword } from "@/lib/utils/hashPassword";

import { db } from "..";
import {
  regions,
  Role,
  users,
  usersToRegions,
  VerificationStatus,
} from "../schemas/auth";

async function seed() {
  const salt = createSalt();
  const hashed = await hashPassword("admin2025@", salt);

  const existing = await db.query.users.findFirst();

  if (!existing) {
    const newAdmin = await db
      .insert(users)
      .values([
        {
          email: "iamdevduke@gmail.com",
          password: hashed.hash,
          salt: hashed.salt,
          role: Role.SUPERADMIN,
          name: "총괄관리자",
          username: "admin",
          verified: VerificationStatus.UNVERIFIED,
        },
      ])
      .returning();
    console.log("Admin user created");

    const testRegion = await db
      .insert(regions)
      .values([
        {
          name: "test-region",
        },
      ])
      .returning();
    console.log("Test region created");

    // const testIsland = await db
    //   .insert(islands)
    //   .values([
    //     {
    //       name: "test-island",
    //       regionId: testRegion[0].id,
    //     },
    //   ])
    //   .returning();
    // // console.log("Test island created and connected to test region");

    // await db
    //   .insert(usersToIslands)
    //   .values([
    //     {
    //       userId: newAdmin[0].id,
    //       islandId: testIsland[0].id,
    //     },
    //   ])
    //   .returning();
    // console.log("many to many relation between user and island created");

    await db.insert(usersToRegions).values([
      {
        userId: newAdmin[0].id,
        regionId: testRegion[0].id,
      },
    ]);
    console.log("many to many relation between user and region created");
  }
  process.exit(0);
}

seed();
