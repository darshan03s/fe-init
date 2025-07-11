#!/usr/bin/env node
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import getChoices from './getChoices.js';
import {
    createViteProject,
    installBasePackages,
    installExtraPackages,
    installSelectedPackages,
    installShadcn,
    updateProjectStructure,
} from './utils.js';

export let pkgManager;
export let targetDirectory;
export let projectName;
export let addShadcn;
export let selectedPackages;
export let extraPackages;

async function main() {
    console.log(
        '\n\u2728 Welcome to the Vite + React(TS) + Tailwind + React Router project initializer!\n'
    );

    try {
        ({ pkgManager, targetDirectory, projectName, addShadcn, selectedPackages, extraPackages } =
            await getChoices());
    } catch (error) {
        console.error(chalk.red('\n❌ An error occurred while getting options:'), error.message);
        process.exit(1);
    }

    try {
        await fs.ensureDir(targetDirectory);
        process.chdir(path.dirname(targetDirectory));

        await createViteProject();

        process.chdir(targetDirectory);

        await installBasePackages();

        // Update project structure before shadcn and extra packages
        await updateProjectStructure();

        if (addShadcn) {
            await installShadcn();
        }

        if (selectedPackages.length > 0) {
            await installSelectedPackages();
        }

        const extras = extraPackages.trim().split(/\s+/);
        if (extras.length > 0 && extras[0] !== '') {
            await installExtraPackages(extras);
        }

        console.log(`\n\u2705 Setup complete! Navigate to ${targetDirectory} and start coding.\n`);
    } catch (error) {
        if (error.name === 'ExitPromptError') {
            console.log(chalk.yellow('\n👋 Setup cancelled by user.'));
            process.exit(0);
        } else {
            console.error(chalk.red('\n❌ An error occurred:'), error.message);
            process.exit(1);
        }
    }
}

main();
