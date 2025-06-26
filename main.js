#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import ora from "ora";
import { execa } from "execa";
import chalk from "chalk";
import templateFiles from "./templateFiles.js";
import packageCommands from "./packageCommands.js";

async function main() {
    console.log(
        "\n\u2728 Welcome to the Vite + React(TS) + Tailwind + React Router project initializer!\n"
    );

    try {
        const { pkgManager } = await inquirer.prompt({
            type: "list",
            name: "pkgManager",
            message: "Select package manager:",
            choices: ["npm", "yarn", "pnpm"],
        });

        let { targetDirectory } = await inquirer.prompt({
            type: "input",
            name: "targetDirectory",
            message: "Target directory:",
            default: process.cwd(),
        });

        targetDirectory = path.resolve(targetDirectory);
        const defaultProjectName = path.basename(targetDirectory);

        const { projectName } = await inquirer.prompt({
            type: "input",
            name: "projectName",
            message: "Project name:",
            default: defaultProjectName,
        });

        try {
            await fs.ensureDir(targetDirectory);
            process.chdir(path.dirname(targetDirectory));

            await execa(
                pkgManager,
                [...packageCommands["react-ts"], path.basename(targetDirectory)],
                {
                    stdio: "inherit",
                }
            );
        } catch (err) {
            console.error(err);
            process.exit(1);
        }

        process.chdir(targetDirectory);

        try {
            await execa(
                pkgManager,
                [
                    "install",
                    ...packageCommands["tailwindcss"],
                    packageCommands["react-router-dom"],
                    packageCommands["lucide-react"],
                    packageCommands["clsx"],
                    packageCommands["tailwind-merge"],
                ],
                { stdio: "inherit" }
            );
            try {
                await execa(pkgManager, ["install", "-D", packageCommands["@types/node"]], {
                    stdio: "inherit",
                });
            } catch (typesError) {
                console.error(typesError);
            }
        } catch (err) {
            console.error(err);
            process.exit(1);
        }

        await createProjectStructure();

        const { addShadcn } = await inquirer.prompt({
            type: "confirm",
            name: "addShadcn",
            message: "Do you want to install Shadcn UI?",
            default: false,
        });

        if (addShadcn) {
            await installShadcn();
        }

        const recommendedPackages = [
            { name: "zustand", value: packageCommands.zustand },
            {
                name: "@tanstack/react-query",
                value: packageCommands["@tanstack/react-query"],
            },
            {
                name: "react-hook-form",
                value: packageCommands["react-hook-form"],
            },
            { name: "zod", value: packageCommands.zod },
            { name: "axios", value: packageCommands.axios },
            { name: "framer-motion", value: packageCommands["framer-motion"] },
        ];

        const { selectedPackages } = await inquirer.prompt({
            type: "checkbox",
            name: "selectedPackages",
            message: "Select recommended packages to install:",
            choices: recommendedPackages,
        });

        if (selectedPackages.length > 0) {
            try {
                await execa(pkgManager, ["install", ...selectedPackages], {
                    stdio: "inherit",
                });
                console.log(
                    chalk.green(`Successfully installed: ${selectedPackages.join(", ")}\n`)
                );
            } catch (err) {
                console.error(chalk.red("Error installing packages:"), err);
            }
        }

        const { extraPackages } = await inquirer.prompt({
            type: "input",
            name: "extraPackages",
            message: "Enter additional packages (space-separated):",
        });

        const extras = extraPackages.trim().split(/\s+/);
        if (extras.length) {
            try {
                await execa(pkgManager, ["install", ...extras], {
                    stdio: "inherit",
                });
                console.log(chalk.green(`Successfully installed: ${extras.join(", ")}\n`));
            } catch (err) {
                console.error(err);
            }
        }

        async function installShadcn() {
            if (pkgManager === "npm") {
                await execa("npx", ["shadcn@latest", "init"], {
                    stdio: "inherit",
                });
                const pkgJsonPath = path.join(targetDirectory, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.scripts["shadcn:add"] = "npx shadcn@latest add";
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
            } else if (pkgManager === "yarn") {
                await execa("yarn", ["shadcn@latest", "init"], {
                    stdio: "inherit",
                });
                const pkgJsonPath = path.join(targetDirectory, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.scripts["shadcn:add"] = "yarn shadcn@latest add";
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
            } else if (pkgManager === "pnpm") {
                await execa("pnpm", ["dlx", "shadcn@latest", "init"], {
                    stdio: "inherit",
                });
                const pkgJsonPath = path.join(targetDirectory, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.scripts["shadcn:add"] = "pnpm dlx shadcn@latest add";
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
            }
            console.log(
                chalk.green(
                    `Shadcn UI installed successfully!\nUse \`${pkgManager} shadcn:add\` to add components to your project.\n`
                )
            );
        }

        async function createProjectStructure() {
            const editSpinner = ora("Creating project structure and updating files...").start();
            try {
                await fs.ensureDir("src/pages");
                await fs.ensureDir("src/utils");
                await fs.ensureDir("src/features");
                await fs.ensureDir("src/features/theme");

                for (const [file, content] of Object.entries(templateFiles)) {
                    await fs.outputFile(path.join(targetDirectory, file), content);
                }

                const pkgJsonPath = path.join(targetDirectory, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.name = projectName;
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });

                await fs.remove(path.join(targetDirectory, "src/App.css"));
                await fs.remove(path.join(targetDirectory, "README.md"));

                await fs.outputFile(path.join(targetDirectory, ".env"), "");
                const gitignorePath = path.join(targetDirectory, ".gitignore");
                const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
                await fs.writeFile(gitignorePath, gitignoreContent + "\n.env");

                const tsConfigAppPath = path.join(targetDirectory, "tsconfig.app.json");

                const tsConfigAppContent = await fs.readFile(tsConfigAppPath, "utf-8");
                const tsConfigAppJsonWithoutComments = tsConfigAppContent.replace(
                    /\/\*[\s\S]*?\*\//g,
                    ""
                );
                const tsConfigApp = JSON.parse(tsConfigAppJsonWithoutComments);

                tsConfigApp.compilerOptions = tsConfigApp.compilerOptions || {};
                tsConfigApp.compilerOptions.baseUrl = ".";
                tsConfigApp.compilerOptions.paths = {
                    "@/*": ["./src/*"],
                };

                await fs.writeJson(tsConfigAppPath, tsConfigApp, { spaces: 4 });

                const tsConfigPath = path.join(targetDirectory, "tsconfig.json");

                const tsConfigContent = await fs.readFile(tsConfigPath, "utf-8");
                const tsConfigJsonWithoutComments = tsConfigContent.replace(
                    /\/\*\[\s\S]*?\*\//g,
                    ""
                );
                const tsConfig = JSON.parse(tsConfigJsonWithoutComments);

                tsConfig.compilerOptions = tsConfig.compilerOptions || {};
                tsConfig.compilerOptions.baseUrl = ".";
                tsConfig.compilerOptions.paths = {
                    "@/*": ["./src/*"],
                };

                await fs.writeJson(tsConfigPath, tsConfig, { spaces: 4 });

                editSpinner.succeed("Project structure and files updated.");
            } catch (err) {
                editSpinner.fail("Failed to update project structure.");
                console.error(err);
                process.exit(1);
            }
        }

        console.log(`\n\u2705 Setup complete! Navigate to ${targetDirectory} and start coding.\n`);
    } catch (error) {
        if (error.name === "ExitPromptError") {
            console.log(chalk.yellow("\n👋 Setup cancelled by user."));
            process.exit(0);
        } else {
            console.error(chalk.red("\n❌ An error occurred:"), error.message);
            process.exit(1);
        }
    }
}

main();
