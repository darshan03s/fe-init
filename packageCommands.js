const packageCommands = {
    'react-ts': {
        npm: ['create', 'vite@latest', '--', '--template', 'react-ts', '-y'],
        pnpm: ['create', 'vite', '--template', 'react-ts'],
        yarn: ['create', 'vite', '--template', 'react-ts'],
    },
    tailwindcss: ['tailwindcss', '@tailwindcss/vite'],
    'tailwind-merge': 'tailwind-merge',
    'react-router-dom': 'react-router-dom',
    'lucide-react': 'lucide-react',
    clsx: 'clsx',
    '@types/node': '@types/node',
    zustand: 'zustand',
    '@tanstack/react-query': '@tanstack/react-query',
    'react-hook-form': 'react-hook-form',
    zod: 'zod',
    axios: 'axios',
    'framer-motion': 'framer-motion',
    'react-scan': 'react-scan@latest',
};

export default packageCommands;
