import inquirer from 'inquirer';
import path from 'path';
import packageCommands from './packageCommands.js';

async function getChoices() {
    const { pkgManager } = await inquirer.prompt({
        type: 'list',
        name: 'pkgManager',
        message: 'Select package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
    });

    let { targetDirectory } = await inquirer.prompt({
        type: 'input',
        name: 'targetDirectory',
        message: 'Target directory:',
        default: process.cwd(),
    });

    targetDirectory = path.resolve(targetDirectory);
    const defaultProjectName = path.basename(targetDirectory);

    const { projectName } = await inquirer.prompt({
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: defaultProjectName,
    });

    const { addShadcn } = await inquirer.prompt({
        type: 'confirm',
        name: 'addShadcn',
        message: 'Do you want to install Shadcn UI?',
        default: false,
    });

    const recommendedPackages = [
        { name: 'zustand', value: packageCommands.zustand },
        {
            name: '@tanstack/react-query',
            value: packageCommands['@tanstack/react-query'],
        },
        {
            name: 'react-hook-form',
            value: packageCommands['react-hook-form'],
        },
        { name: 'zod', value: packageCommands.zod },
        { name: 'axios', value: packageCommands.axios },
        { name: 'framer-motion', value: packageCommands['framer-motion'] },
        { name: 'react-scan', value: packageCommands['react-scan'] },
    ];

    const { selectedPackages } = await inquirer.prompt({
        type: 'checkbox',
        name: 'selectedPackages',
        message: 'Select recommended packages to install:',
        choices: recommendedPackages,
    });

    const { extraPackages } = await inquirer.prompt({
        type: 'input',
        name: 'extraPackages',
        message: 'Enter additional packages (space-separated):',
    });

    return { pkgManager, targetDirectory, projectName, addShadcn, selectedPackages, extraPackages };
}

export default getChoices;
