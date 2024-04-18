#!/usr/bin/env ts-node

import { exec, execSync } from "child_process";

// read parameters from cli
const [,, ...args] = process.argv;

switch (args[0]) {
    case "db-init":
        // init db with prisma
        execSync("npm run prisma db push", { stdio: "inherit" });
        break;
    default:
        console.log("Invalid command");
        break;
}
