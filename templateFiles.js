import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const templateDir = path.join(__dirname, 'templateFiles');

const templateFilesObject = {
    'index.html': 'index.html',
    'vite.config.ts': 'vite.config.ts',
    'src/main.tsx': 'src/main.tsx',
    'src/App.tsx': 'src/App.tsx',
    'src/pages/Home.tsx': 'src/pages/Home.tsx',
    'src/components/Layout.tsx': 'src/components/Layout.tsx',
    'src/pages/index.ts': 'src/pages/index.ts',
    'src/features/theme/ThemeContext.ts': 'src/features/theme/ThemeContext.ts',
    'src/features/theme/ThemeProvider.tsx': 'src/features/theme/ThemeProvider.tsx',
    'src/features/theme/ThemeToggleButton.tsx': 'src/features/theme/ThemeToggleButton.tsx',
    'src/features/theme/useTheme.ts': 'src/features/theme/useTheme.ts',
    'src/features/theme/types.ts': 'src/features/theme/types.ts',
    'src/features/theme/index.ts': 'src/features/theme/index.ts',
    'src/utils/devUtils.ts': 'src/utils/devUtils.ts',
    'src/lib/utils.ts': 'src/lib/utils.ts',
};

const templateFiles = {};

for (const [key, value] of Object.entries(templateFilesObject)) {
    templateFiles[key] = await fs.readFile(path.join(templateDir, value), 'utf-8');
}

export default templateFiles;
