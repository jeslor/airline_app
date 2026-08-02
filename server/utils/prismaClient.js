import { PrismaClient } from "../generated/prisma/index.js";

// A single shared client, reused across the app instead of creating a new
// connection pool per request/controller.
const prisma = new PrismaClient();

export default prisma;
