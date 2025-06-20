#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import ora from "ora";
import { execa } from "execa";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateDir = path.join(__dirname, "templateFiles");

const templateFiles = {
    "index.html": await fs.readFile(
        path.join(templateDir, "index.html"),
        "utf-8"
    ),
    "src/index.css": await fs.readFile(
        path.join(templateDir, "src/index.css"),
        "utf-8"
    ),
    "vite.config.ts": await fs.readFile(
        path.join(templateDir, "vite.config.ts"),
        "utf-8"
    ),
    "src/main.tsx": await fs.readFile(
        path.join(templateDir, "src/main.tsx"),
        "utf-8"
    ),
    "src/App.tsx": await fs.readFile(
        path.join(templateDir, "src/App.tsx"),
        "utf-8"
    ),
    "src/pages/Home.tsx": await fs.readFile(
        path.join(templateDir, "src/pages/Home.tsx"),
        "utf-8"
    ),
    "src/pages/index.ts": await fs.readFile(
        path.join(templateDir, "src/pages/index.ts"),
        "utf-8"
    ),
    "src/features/theme/ThemeContext.ts": await fs.readFile(
        path.join(templateDir, "src/features/theme/ThemeContext.ts"),
        "utf-8"
    ),
    "src/features/theme/ThemeProvider.tsx": await fs.readFile(
        path.join(templateDir, "src/features/theme/ThemeProvider.tsx"),
        "utf-8"
    ),
    "src/features/theme/ThemeToggleButton.tsx": await fs.readFile(
        path.join(templateDir, "src/features/theme/ThemeToggleButton.tsx"),
        "utf-8"
    ),
    "src/features/theme/useTheme.ts": await fs.readFile(
        path.join(templateDir, "src/features/theme/useTheme.ts"),
        "utf-8"
    ),
    "src/features/theme/types.ts": await fs.readFile(
        path.join(templateDir, "src/features/theme/types.ts"),
        "utf-8"
    ),
    "src/features/theme/index.ts": await fs.readFile(
        path.join(templateDir, "src/features/theme/index.ts"),
        "utf-8"
    ),
    "src/utils/devUtils.ts": await fs.readFile(
        path.join(templateDir, "src/utils/devUtils.ts"),
        "utf-8"
    ),
    "src/lib/utils.ts": await fs.readFile(
        path.join(templateDir, "src/lib/utils.ts"),
        "utf-8"
    ),
};

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

        const { directory } = await inquirer.prompt({
            type: "input",
            name: "directory",
            message: "Target directory:",
            default: process.cwd(),
        });

        const resolvedDir = path.resolve(directory);
        const defaultName = path.basename(resolvedDir);

        const { projectName } = await inquirer.prompt({
            type: "input",
            name: "projectName",
            message: "Project name:",
            default: defaultName,
        });

        try {
            await fs.ensureDir(resolvedDir);
            process.chdir(path.dirname(resolvedDir));

            await execa(
                pkgManager,
                [
                    "create",
                    "vite",
                    path.basename(resolvedDir),
                    "--template",
                    "react-ts",
                ],
                { stdio: "inherit" }
            );
        } catch (err) {
            console.error(err);
            process.exit(1);
        }

        process.chdir(resolvedDir);

        try {
            await execa(
                pkgManager,
                [
                    "install",
                    "tailwindcss",
                    "@tailwindcss/vite",
                    "tailwind-merge",
                    "clsx",
                    "react-router-dom",
                    "lucide-react",
                ],
                { stdio: "inherit" }
            );
            try {
                await execa(pkgManager, ["install", "-D", "@types/node"], {
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

        const { wantsExtras } = await inquirer.prompt({
            type: "confirm",
            name: "wantsExtras",
            message: "Do you want to install additional packages?",
            default: false,
        });

        if (wantsExtras) {
            const { extraPackages } = await inquirer.prompt({
                type: "input",
                name: "extraPackages",
                message: "Enter additional packages (space-separated):",
            });

            const extras = extraPackages.trim().split(/\s+/);
            if (extras.length) {
                if (extras.includes("shadcn")) {
                    extras.splice(extras.indexOf("shadcn"), 1);
                    await installShadcn();
                }
                try {
                    if (extras.length) {
                        await execa(pkgManager, ["install", ...extras], {
                            stdio: "inherit",
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }

        async function installShadcn() {
            if (pkgManager === "npm") {
                await execa("npx", ["shadcn@latest", "init"], {
                    stdio: "inherit",
                });
                const pkgJsonPath = path.join(resolvedDir, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.scripts["shadcn:add"] = "npx shadcn@latest add";
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
            } else if (pkgManager === "yarn") {
                await execa("yarn", ["add", "shadcn@latest"], {
                    stdio: "inherit",
                });
                const pkgJsonPath = path.join(resolvedDir, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.scripts["shadcn:add"] = "yarn shadcn@latest add";
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
            } else if (pkgManager === "pnpm") {
                await execa("pnpm", ["dlx", "shadcn@latest", "init"], {
                    stdio: "inherit",
                });
                const pkgJsonPath = path.join(resolvedDir, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.scripts["shadcn:add"] = "pnpm dlx shadcn@latest add";
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
            }
            console.log(
                chalk.green(
                    `Shadcn UI installed successfully!\nUse \`${pkgManager} shadcn:add\` to add components to your project.`
                )
            );
        }

        async function createProjectStructure() {
            const editSpinner = ora(
                "Creating project structure and updating files..."
            ).start();
            try {
                await fs.ensureDir("src/pages");
                await fs.ensureDir("src/utils");
                await fs.ensureDir("src/features");
                await fs.ensureDir("src/features/theme");

                for (const [file, content] of Object.entries(templateFiles)) {
                    await fs.outputFile(path.join(resolvedDir, file), content);
                }

                const pkgJsonPath = path.join(resolvedDir, "package.json");
                const pkgJson = await fs.readJson(pkgJsonPath);
                pkgJson.name = projectName;
                await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });

                await fs.remove(path.join(resolvedDir, "src/App.css"));
                await fs.remove(path.join(resolvedDir, "README.md"));

                await fs.outputFile(path.join(resolvedDir, ".env"), "");
                const gitignorePath = path.join(resolvedDir, ".gitignore");
                const gitignoreContent = await fs.readFile(
                    gitignorePath,
                    "utf-8"
                );
                await fs.writeFile(gitignorePath, gitignoreContent + "\n.env");

                const tsConfigAppPath = path.join(
                    resolvedDir,
                    "tsconfig.app.json"
                );

                const tsConfigAppContent = await fs.readFile(
                    tsConfigAppPath,
                    "utf-8"
                );
                const tsConfigAppJsonWithoutComments =
                    tsConfigAppContent.replace(/\/\*[\s\S]*?\*\//g, "");
                const tsConfigApp = JSON.parse(tsConfigAppJsonWithoutComments);

                tsConfigApp.compilerOptions = tsConfigApp.compilerOptions || {};
                tsConfigApp.compilerOptions.baseUrl = ".";
                tsConfigApp.compilerOptions.paths = {
                    "@/*": ["./src/*"],
                };

                await fs.writeJson(tsConfigAppPath, tsConfigApp, { spaces: 2 });

                const tsConfigPath = path.join(resolvedDir, "tsconfig.json");

                const tsConfigContent = await fs.readFile(
                    tsConfigPath,
                    "utf-8"
                );
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

                await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });

                editSpinner.succeed("Project structure and files updated.");
            } catch (err) {
                editSpinner.fail("Failed to update project structure.");
                console.error(err);
                process.exit(1);
            }
        }

        console.log(
            `\n\u2705 Setup complete! Navigate to ${resolvedDir} and start coding.\n`
        );
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
