import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import packageCommands from './packageCommands.js';
import chalk from 'chalk';
import {
    extraPackages,
    pkgManager,
    projectName,
    selectedPackages,
    targetDirectory,
} from './main.js';
import templateFiles, { templateDir } from './templateFiles.js';
import handlebars from 'handlebars';

export async function createViteProject() {
    console.log(chalk.green('Creating Vite project...\n'));
    try {
        await execa(pkgManager, [...packageCommands['react-ts'], path.basename(targetDirectory)], {
            stdio: 'inherit',
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

export async function installBasePackages() {
    console.log(chalk.green('Installing base packages...\n'));
    try {
        await execa(
            pkgManager,
            [
                'install',
                ...packageCommands['tailwindcss'],
                packageCommands['react-router-dom'],
                packageCommands['lucide-react'],
                packageCommands['clsx'],
                packageCommands['tailwind-merge'],
            ],
            { stdio: 'inherit' }
        );
        try {
            await execa(pkgManager, ['install', '-D', packageCommands['@types/node']], {
                stdio: 'inherit',
            });
        } catch (typesError) {
            console.error(typesError);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

export async function installPackages(packages) {
    try {
        await execa(pkgManager, ['install', ...packages], {
            stdio: 'inherit',
        });
    } catch (err) {
        console.error(chalk.red('Error installing package:'), err);
        process.exit(1);
    }
}

export async function installSelectedPackages() {
    await installPackages(selectedPackages);
    if (selectedPackages.includes(packageCommands['react-scan'])) {
        const mainTsxHbsPath = path.join(templateDir, 'src/main.tsx.hbs');
        const mainTsxHbs = await fs.readFile(mainTsxHbsPath, 'utf-8');
        const mainTsxHbsTemplate = handlebars.compile(mainTsxHbs);
        const mainTsxHbsContent = mainTsxHbsTemplate({ addReactScan: true });
        const mainTsxPath = path.join(targetDirectory, 'src/main.tsx');
        await fs.writeFile(mainTsxPath, mainTsxHbsContent);
    }
}

export async function installExtraPackages() {
    await installPackages(extraPackages);
}

export async function installShadcn() {
    if (pkgManager === 'npm') {
        await execa('npx', ['shadcn@latest', 'init'], {
            stdio: 'inherit',
        });
        const pkgJsonPath = path.join(targetDirectory, 'package.json');
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.scripts['shadcn:add'] = 'npx shadcn@latest add';
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
    } else if (pkgManager === 'yarn') {
        await execa('yarn', ['shadcn@latest', 'init'], {
            stdio: 'inherit',
        });
        const pkgJsonPath = path.join(targetDirectory, 'package.json');
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.scripts['shadcn:add'] = 'yarn shadcn@latest add';
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
    } else if (pkgManager === 'pnpm') {
        await execa('pnpm', ['dlx', 'shadcn@latest', 'init'], {
            stdio: 'inherit',
        });
        const pkgJsonPath = path.join(targetDirectory, 'package.json');
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.scripts['shadcn:add'] = 'pnpm dlx shadcn@latest add';
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });
    }
    console.log(
        chalk.green(
            `Shadcn UI installed successfully!\nUse \`${pkgManager} shadcn:add\` to add components to your project.\n`
        )
    );
}

export async function createProjectStructure() {
    console.log(chalk.green('Creating project structure and updating files...\n'));
    try {
        await fs.ensureDir('src/pages');
        await fs.ensureDir('src/utils');
        await fs.ensureDir('src/features');
        await fs.ensureDir('src/features/theme');

        for (const [file, content] of Object.entries(templateFiles)) {
            await fs.outputFile(path.join(targetDirectory, file), content);
        }

        const pkgJsonPath = path.join(targetDirectory, 'package.json');
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.name = projectName;
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 4 });

        await fs.remove(path.join(targetDirectory, 'src/App.css'));
        await fs.remove(path.join(targetDirectory, 'README.md'));

        await fs.outputFile(path.join(targetDirectory, '.env'), '');
        await fs.outputFile(
            path.join(targetDirectory, '.npmrc'),
            'auto-install-peers=true\nenable-pre-post-scripts=true'
        );
        const gitignorePath = path.join(targetDirectory, '.gitignore');
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        await fs.writeFile(gitignorePath, gitignoreContent + '\n.env');

        const tsConfigAppPath = path.join(targetDirectory, 'tsconfig.app.json');

        const tsConfigAppContent = await fs.readFile(tsConfigAppPath, 'utf-8');
        const tsConfigAppJsonWithoutComments = tsConfigAppContent.replace(/\/\*[\s\S]*?\*\//g, '');
        const tsConfigApp = JSON.parse(tsConfigAppJsonWithoutComments);

        tsConfigApp.compilerOptions = tsConfigApp.compilerOptions || {};
        tsConfigApp.compilerOptions.baseUrl = '.';
        tsConfigApp.compilerOptions.paths = {
            '@/*': ['./src/*'],
        };

        await fs.writeJson(tsConfigAppPath, tsConfigApp, { spaces: 4 });

        const tsConfigPath = path.join(targetDirectory, 'tsconfig.json');

        const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
        const tsConfigJsonWithoutComments = tsConfigContent.replace(/\/\*\[\s\S]*?\*\//g, '');
        const tsConfig = JSON.parse(tsConfigJsonWithoutComments);

        tsConfig.compilerOptions = tsConfig.compilerOptions || {};
        tsConfig.compilerOptions.baseUrl = '.';
        tsConfig.compilerOptions.paths = {
            '@/*': ['./src/*'],
        };

        await fs.writeJson(tsConfigPath, tsConfig, { spaces: 4 });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
