#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import { execSync } from 'child_process';

const layerBasedStructure = {
  controllers: {},
  services: {},
  repositories: {},
  models: {},
  routes: {},
  middlewares: {},
  config: {},
  utils: {},
  tests: {
    unit: {},
    integration: {},
    e2e: {},
  },
};

const modularStructure = {
  modules: {
    user: {
      'user.controller.ts': '',
      'user.service.ts': '',
      'user.repository.ts': '',
      'user.routes.ts': '',
      'user.spec.ts': '',
    },
    auth: {},
    product: {},
  },
  shared: {
    middlewares: {},
    utils: {},
    config: {},
    tests: {
      unit: {},
      integration: {},
      e2e: {},
    },
  },
};

const dddStructure = {
  domain: {
    user: {
      entities: {},
      repositories: {},
      services: {},
      tests: {},
    },
    product: {},
  },
  application: {
    user: {},
    product: {},
  },
  infrastructure: {
    repositories: {},
    orm: {},
    services: {},
  },
  interfaces: {
    controllers: {},
    routes: {},
    middlewares: {},
  },
  shared: {
    utils: {},
    tests: {
      unit: {},
      integration: {},
      e2e: {},
    },
  },
};

function createFolderRecursive(basePath, structure) {
  for (const key in structure) {
    const newPath = path.join(basePath, key);
    if (!fs.existsSync(newPath)) {
      if (key.includes('.')) {
        // It's a file
        fs.writeFileSync(newPath, structure[key]);
      } else {
        // It's a directory
        fs.mkdirSync(newPath);
      }
    }
    if (typeof structure[key] === 'object' && !key.includes('.')) {
      createFolderRecursive(newPath, structure[key]);
    }
  }
}

function createFileWithContent(filePath, content) {
  fs.writeFileSync(filePath, content);
}

function packageJsonContent(projectName) {
  return `{
  "name": "${projectName}",
  "version": "1.0.0",
  "main": "dist/app.js",
  "scripts": {
    "start": "node dist/app.js",
    "build": "tsc",
    "dev": "ts-node src/app.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write .",
    "prepare": "git rev-parse --is-inside-work-tree >/dev/null 2>&1 && husky install || echo 'Skipping husky install (not a Git repository)'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.4",
    "@types/node": "^20.5.7",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^6.5.1",
    "@typescript-eslint/parser": "^6.5.1",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.6.4",
    "prettier": "^3.0.0",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.6",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3"
  }
}
`;
}

function tsconfigContent() {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
`;
}

function appTsContent() {
  return `import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './config/logger';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  logger.info(\`Server running at http://localhost:\${port}\`);
});

export default app;
`;
}

function dockerfileContent() {
  return `# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
`;
}

function dockerComposeContent() {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    restart: unless-stopped
`;
}

function eslintConfigContent() {
  return `{
  "env": {
    "node": true,
    "es2020": true,
    "jest": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  },
  "ignorePatterns": ["dist/**", "node_modules/**", "**/*.spec.ts", "**/*.test.ts"]
}
`;
}

function prettierConfigContent() {
  return `{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always"
}
`;
}

function eslintIgnoreContent() {
  return `node_modules
dist
coverage
.env
`;
}

function prettierIgnoreContent() {
  return `node_modules
dist
coverage
.env
`;
}

function envContent() {
  return `# Server configuration
PORT=3000
NODE_ENV=development

# Database configuration (example)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=myapp

# JWT configuration (example)
# JWT_SECRET=your_jwt_secret
# JWT_EXPIRES_IN=1d

# Logging level (error, warn, info, verbose, debug, silly)
LOG_LEVEL=info
`;
}

function jestConfigContent() {
  return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/app.ts',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true
};
`;
}

function loggerConfigContent() {
  return `import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;
`;
}

function huskyConfigContent() {
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
}

function lintStagedConfigContent() {
  return `{
  "*.ts": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,json,md}": [
    "prettier --write"
  ]
}
`;
}

async function initializeGitRepo(projectPath) {
  try {
    execSync('git init', {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true
    });
    console.log('✅ Git repository initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Git repository:', error.message);
    return false;
  }
}

// Modifique a função installDependencies para:
async function installDependencies(projectPath) {
  console.log('📦 Installing dependencies...');
  
  try {
    // Primeiro inicializa o Git antes de instalar as dependências
    const gitInitialized = await initializeGitRepo(projectPath);
    
    if (!gitInitialized) {
      console.log('⚠️ Husky requires Git to be initialized. Skipping Husky setup.');
      // Instala sem o prepare script para evitar erro do Husky
      execSync('npm install --ignore-scripts', {
        cwd: projectPath,
        stdio: 'inherit',
        shell: true
      });
    } else {
      // Instala normalmente se o Git foi inicializado
      execSync('npm install', {
        cwd: projectPath,
        stdio: 'inherit',
        shell: true
      });
    }
    
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    console.log('You can try installing manually with:');
    console.log(`cd ${projectPath} && git init && npm install`);
  }
}

async function main() {
  console.log('🚀 Backend project generator CLI with complete setup\n');

  const response = await prompts([
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      validate: name => (name ? true : 'Project name is required'),
    },
    {
      type: 'select',
      name: 'structure',
      message: 'Choose the project structure:',
      choices: [
        { title: 'Layer Based', value: 'layer' },
        { title: 'Modular', value: 'modular' },
        { title: 'DDD', value: 'ddd' },
      ],
    },
  ]);

  if (!response.projectName) {
    console.log('Aborted: Project name is required.');
    process.exit(1);
  }

  const rootPath = path.resolve(process.cwd(), response.projectName);

  if (fs.existsSync(rootPath)) {
    console.log(`Folder ${response.projectName} already exists. Choose another name or delete the folder.`);
    process.exit(1);
  }

  // Create root directory and all necessary subdirectories
  fs.mkdirSync(rootPath);
  fs.mkdirSync(path.join(rootPath, 'src'));
  fs.mkdirSync(path.join(rootPath, 'src', 'config'));
  fs.mkdirSync(path.join(rootPath, 'logs'));
  fs.mkdirSync(path.join(rootPath, '.husky'), { recursive: true }); // Create .husky directory

  // Create structure folders and files
  switch (response.structure) {
    case 'layer':
      createFolderRecursive(path.join(rootPath, 'src'), layerBasedStructure);
      break;
    case 'modular':
      createFolderRecursive(path.join(rootPath, 'src'), modularStructure);
      break;
    case 'ddd':
      createFolderRecursive(path.join(rootPath, 'src'), dddStructure);
      break;
    default:
      break;
  }

  // Create common files
  createFileWithContent(path.join(rootPath, 'package.json'), packageJsonContent(response.projectName));
  createFileWithContent(path.join(rootPath, 'tsconfig.json'), tsconfigContent());
  createFileWithContent(path.join(rootPath, 'src', 'app.ts'), appTsContent());
  createFileWithContent(path.join(rootPath, 'src', 'config', 'logger.ts'), loggerConfigContent());
  createFileWithContent(path.join(rootPath, 'README.md'), `# ${response.projectName}\n\nGenerated by backend project generator CLI.`);
  createFileWithContent(path.join(rootPath, 'Dockerfile'), dockerfileContent());
  createFileWithContent(path.join(rootPath, 'docker-compose.yml'), dockerComposeContent());
  createFileWithContent(path.join(rootPath, '.env'), envContent());
  createFileWithContent(path.join(rootPath, '.eslintrc.json'), eslintConfigContent());
  createFileWithContent(path.join(rootPath, '.eslintignore'), eslintIgnoreContent());
  createFileWithContent(path.join(rootPath, '.prettierrc'), prettierConfigContent());
  createFileWithContent(path.join(rootPath, '.prettierignore'), prettierIgnoreContent());
  createFileWithContent(path.join(rootPath, 'jest.config.js'), jestConfigContent());
  createFileWithContent(path.join(rootPath, '.husky', 'pre-commit'), huskyConfigContent());
  createFileWithContent(path.join(rootPath, '.lintstagedrc.json'), lintStagedConfigContent());

  console.log(`\n✅ Project "${response.projectName}" created successfully with complete setup!`);
    // Pergunta se deseja instalar as dependências
 try {
    const { installDeps } = await prompts({
      type: 'confirm',
      name: 'installDeps',
      message: 'Do you want to install dependencies now?',
      initial: true
    });

    if (installDeps) {
      installDependencies(rootPath);
    } else {
      console.log('You can install dependencies later by running:');
      console.log(`cd ${response.projectName} && npm install`);
    }
  } catch (error) {
    console.error('Error during installation prompt:', error);
  }
  console.log('To get started:\n');
  console.log(`  cd ${response.projectName}`);
  console.log('  npm install');
  console.log('  npm run dev');
  console.log('  npm test');
  console.log('  npm run lint');
  console.log('  npm run format');
  console.log('\nFor Docker:\n');
  console.log('  docker-compose build');
  console.log('  docker-compose up\n');
  console.log('The project includes:');
  console.log('- Express with TypeScript');
  console.log('- Environment variables (.env)');
  console.log('- Jest testing setup');
  console.log('- ESLint + Prettier');
  console.log('- Winston logging');
  console.log('- Docker support');
  console.log('- Husky git hooks');
  console.log('- Security middleware (helmet, cors)');
}

main();