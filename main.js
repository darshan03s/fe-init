#!/usr/bin/env node
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import { execa } from 'execa';

const templateFiles = {
    'src/index.css': `@import 'tailwindcss';\n`,

    'vite.config.ts': `import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})\n`,

    'src/main.tsx': `import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);\n`,

    'src/App.tsx': `import {Routes, Route} from 'react-router';
import Home from './pages/Home';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default App;\n`,

    'src/pages/Home.tsx': `const Home = () => {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export default Home;\n`,
};

async function main() {
    console.log('\n\u2728 Welcome to the Vite + React + Tailwind + React Router project initializer!\n');

    const { pkgManager } = await inquirer.prompt({
        type: 'list',
        name: 'pkgManager',
        message: 'Select package manager:',
        choices: ['npm', 'yarn', 'pnpm'],
    });

    const { directory } = await inquirer.prompt({
        type: 'input',
        name: 'directory',
        message: 'Target directory:',
        default: process.cwd(),
    });

    const resolvedDir = path.resolve(directory);
    const defaultName = path.basename(resolvedDir);

    const { projectName } = await inquirer.prompt({
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: defaultName,
    });

    const initSpinner = ora('Initializing Vite project...').start();
    try {
        await fs.ensureDir(resolvedDir);
        process.chdir(path.dirname(resolvedDir));

        await execa(
            pkgManager,
            ['create', 'vite', path.basename(resolvedDir), '--template', 'react-ts'],
            { stdio: 'inherit' }
        );

        initSpinner.succeed('Vite project initialized.');
    } catch (err) {
        initSpinner.fail('Failed to initialize Vite project.');
        console.error(err);
        process.exit(1);
    }

    process.chdir(resolvedDir);

    const installSpinner = ora('Installing base packages...').start();
    try {
        await execa(pkgManager, ['install', 'tailwindcss', '@tailwindcss/vite', 'react-router']);
        installSpinner.succeed('Base packages installed.');
    } catch (err) {
        installSpinner.fail('Failed to install base packages.');
        console.error(err);
        process.exit(1);
    }

    const { wantsExtras } = await inquirer.prompt({
        type: 'confirm',
        name: 'wantsExtras',
        message: 'Do you want to install additional packages?',
        default: false,
    });

    if (wantsExtras) {
        const { extraPackages } = await inquirer.prompt({
            type: 'input',
            name: 'extraPackages',
            message: 'Enter additional packages (space-separated):',
        });

        const extras = extraPackages.trim().split(/\s+/);
        if (extras.length) {
            const extraSpinner = ora('Installing additional packages...').start();
            try {
                await execa(pkgManager, ['install', ...extras]);
                extraSpinner.succeed('Additional packages installed.');
            } catch (err) {
                extraSpinner.fail('Failed to install additional packages.');
                console.error(err);
            }
        }
    }

    const editSpinner = ora('Creating project structure and updating files...').start();
    try {
        await fs.ensureDir('src/components');
        await fs.ensureDir('src/pages');
        await fs.ensureDir('src/hooks');
        await fs.ensureDir('src/utils');
        await fs.ensureDir('src/providers');

        for (const [file, content] of Object.entries(templateFiles)) {
            await fs.outputFile(path.join(resolvedDir, file), content);
        }

        const pkgJsonPath = path.join(resolvedDir, 'package.json');
        const pkgJson = await fs.readJson(pkgJsonPath);
        pkgJson.name = projectName;
        await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });

        await fs.remove(path.join(resolvedDir, 'src/App.css'));

        // TODO - create .env file in the root of project directory, append .env to .gitignore
        await fs.outputFile(path.join(resolvedDir, '.env'), '');
        const gitignorePath = path.join(resolvedDir, '.gitignore');
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        await fs.writeFile(gitignorePath, gitignoreContent + '\n.env');

        editSpinner.succeed('Project structure and files updated.');
    } catch (err) {
        editSpinner.fail('Failed to update project structure.');
        console.error(err);
        process.exit(1);
    }

    console.log(`\n\u2705 Setup complete! Navigate to ${resolvedDir} and start coding.\n`);
}

main();
