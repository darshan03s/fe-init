#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import ora from "ora";
import { execa } from "execa";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateDir = path.join(__dirname, "templateFiles");

const templateFiles = {
    "src/index.css": await fs.readFile(
        path.join(templateDir, "index.css"),
        "utf-8"
    ),
    "vite.config.ts": await fs.readFile(
        path.join(templateDir, "vite.config.ts"),
        "utf-8"
    ),
    "src/main.tsx": await fs.readFile(
        path.join(templateDir, "main.tsx"),
        "utf-8"
    ),
    "src/App.tsx": await fs.readFile(
        path.join(templateDir, "App.tsx"),
        "utf-8"
    ),
    "src/pages/Home.tsx": await fs.readFile(
        path.join(templateDir, "Home.tsx"),
        "utf-8"
    ),
    "src/components/GoogleLogo.tsx": await fs.readFile(
        path.join(templateDir, "GoogleLogo.tsx"),
        "utf-8"
    ),
    "src/features/dark-mode/DarkModeContext.ts": await fs.readFile(
        path.join(templateDir, "DarkModeContext.ts"),
        "utf-8"
    ),
    "src/features/dark-mode/DarkModeProvider.tsx": await fs.readFile(
        path.join(templateDir, "DarkModeProvider.tsx"),
        "utf-8"
    ),
    "src/features/dark-mode/DarkModeToggleButton.tsx": await fs.readFile(
        path.join(templateDir, "DarkModeToggleButton.tsx"),
        "utf-8"
    ),
    "src/features/dark-mode/useDarkMode.ts": await fs.readFile(
        path.join(templateDir, "useDarkMode.ts"),
        "utf-8"
    ),
    "src/features/auth/SignInWithGoogleButton.tsx": await fs.readFile(
        path.join(templateDir, "SignInWithGoogleButton.tsx"),
        "utf-8"
    ),
};

async function main() {
    console.log(
        "\n\u2728 Welcome to the Vite + React(TS) + Tailwind + React Router project initializer!\n"
    );

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
                "react-router",
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
            try {
                await execa(pkgManager, ["install", ...extras]);
            } catch (err) {
                console.error(err);
            }
        }
    }

    const editSpinner = ora(
        "Creating project structure and updating files..."
    ).start();
    try {
        await fs.ensureDir("src/components");
        await fs.ensureDir("src/pages");
        await fs.ensureDir("src/utils");
        await fs.ensureDir("src/features");
        await fs.ensureDir("src/features/auth");
        await fs.ensureDir("src/features/dark-mode");

        for (const [file, content] of Object.entries(templateFiles)) {
            await fs.outputFile(path.join(resolvedDir, file), content);
        }

        const pkgJsonPath = path.join(resolvedDir, "package.json");
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.name = projectName;
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });

        await fs.remove(path.join(resolvedDir, "src/App.css"));

        await fs.outputFile(path.join(resolvedDir, ".env"), "");
        const gitignorePath = path.join(resolvedDir, ".gitignore");
        const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
        await fs.writeFile(gitignorePath, gitignoreContent + "\n.env");

        const tsConfigAppPath = path.join(resolvedDir, "tsconfig.app.json");

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

        await fs.writeJson(tsConfigAppPath, tsConfigApp, { spaces: 2 });

        const tsConfigPath = path.join(resolvedDir, "tsconfig.json");

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

        await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });

        editSpinner.succeed("Project structure and files updated.");

        await execa(pkgManager, ["lint"], { stdio: "inherit" });
    } catch (err) {
        editSpinner.fail("Failed to update project structure.");
        console.error(err);
        process.exit(1);
    }

    console.log(
        `\n\u2705 Setup complete! Navigate to ${resolvedDir} and start coding.\n`
    );
}

main();
