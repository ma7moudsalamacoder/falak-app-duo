#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import prompts from "prompts";
import chalk from "chalk";
import { Command } from "commander";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, "..", "templates", "default");

const program = new Command();
program
  .name("falak-app")
  .description("Scaffold a Vue 3 app with Ably, Brevo, AES-256 and a Laravel API client baked in.")
  .argument("[project-name]", "Directory to create the project in")
  .option("-y, --yes", "Skip prompts and use defaults (all services enabled)")
  .parse(process.argv);

const [argProjectName] = program.args;
const opts = program.opts();

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
}

async function main() {
  console.log(chalk.cyanBright("\n  falak-app \u2014 Vue 3 scaffolder\n"));

  const answers = opts.yes
    ? {
        projectName: argProjectName || "falak-app-duo",
        services: ["ably", "brevo"],
        apiBaseUrl: "http://localhost:8000/api",
      }
    : await prompts(
        [
          {
            type: argProjectName ? null : "text",
            name: "projectName",
            message: "Project name / folder:",
            initial: "falak-app-duo",
          },
          {
            type: "multiselect",
            name: "services",
            message: "Which services do you want wired up?",
            choices: [
              { title: "Ably (realtime, via Laravel Echo)", value: "ably", selected: true },
              { title: "Brevo (email/SMS, via backend)", value: "brevo", selected: true },
            ],
            hint: "Space to toggle, Enter to confirm",
          },
          {
            type: "text",
            name: "apiBaseUrl",
            message: "Laravel API base URL:",
            initial: "http://localhost:8000/api",
          },
        ],
        { onCancel: () => process.exit(1) }
      );

  const projectName = argProjectName || answers.projectName;
  const services = answers.services || [];
  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      console.log(chalk.red(`\n  Directory "${projectName}" already exists and is not empty.\n`));
      process.exit(1);
    }
  }

  console.log(chalk.gray(`\n  Scaffolding into ./${projectName} ...\n`));
  await fs.copy(TEMPLATE_DIR, targetDir);

  // Rename the app's package.json placeholder and set the real project name
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = await fs.readJson(pkgPath);
  pkg.name = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  // Remove service files the user didn't select
  const serviceFiles = {
    ably: "src/services/ably.js",
    brevo: "src/services/brevo.js",
  };
  for (const [key, relPath] of Object.entries(serviceFiles)) {
    if (!services.includes(key)) {
      await fs.remove(path.join(targetDir, relPath));
    }
  }

  // Generate a real .env from .env.example with a fresh encryption key
  const envExamplePath = path.join(targetDir, ".env.example");
  let envContent = await fs.readFile(envExamplePath, "utf-8");
  envContent = envContent
    .replace("__API_BASE_URL__", answers.apiBaseUrl || "http://localhost:8000/api")
    .replace("__AES_KEY__", randomHex(32)) // 256-bit key, hex-encoded
    .replace("__AES_IV__", randomHex(16)); // 128-bit IV, hex-encoded
  await fs.writeFile(path.join(targetDir, ".env"), envContent);

  console.log(chalk.green("  Done! Next steps:\n"));
  console.log(chalk.white(`    cd ${projectName}`));
  console.log(chalk.white("    npm install"));
  console.log(chalk.white("    npm run dev\n"));
  console.log(
    chalk.gray(
      "  Fill in VITE_API_KEY, VITE_ABLY_PUBLIC_KEY, Brevo backend routes, and review .env before shipping.\n"
    )
  );
}

main().catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});
