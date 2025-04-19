export * from "./auth";
export * from "./notices";
export * from "./inquiries";
export * from "./comments";
export * from "./files";
export * from "./images";
export * from "./notifications";

// Add type export for Inquiry
import { inquiries } from "./inquiries";
export type Inquiry = typeof inquiries.$inferSelect;
