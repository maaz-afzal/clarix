import type { TestProject } from "vitest/node";
import { MongoMemoryServer } from "mongodb-memory-server";

declare module "vitest" {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

export default async function setup(project: TestProject) {
  // CI mein hum ek service container ka URI dete hain, local mein in-memory server
  const external = process.env.TEST_MONGODB_URI;
  if (external) {
    project.provide("mongoUri", external);
    return;
  }

  const mongod = await MongoMemoryServer.create();
  project.provide("mongoUri", mongod.getUri("clarix_test"));

  return async () => {
    await mongod.stop();
  };
}