"use server";

import { inArray } from "drizzle-orm";

import { db } from "@/db";
import { files, images } from "@/db/schemas";
import { utapi } from "@/lib/utils/server/uploadthing";

export async function deleteFiles(keys: string[], type: "image" | "file") {
  const response = await utapi.deleteFiles(keys);
  const result = response.success;

  if (result) {
    if (type === "image") {
      await db.delete(images).where(inArray(images.key, keys));
    } else if (type === "file") {
      await db.delete(files).where(inArray(files.key, keys));
    }
  }

  return result;
}
