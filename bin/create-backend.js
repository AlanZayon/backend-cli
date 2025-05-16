#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

const layerBasedStructure = {
  controllers: {},
  services: {},
  repositories: {},
  models: {},
  routes: {},
  middlewares: {},
  config: {},
  utils: {},
};

const modularStructure = {
  modules: {
    user: {
      'user.controller.ts': '',
      'user.service.ts': '',
      'user.repository.ts': '',
      'user.routes.ts': '',
    },
    auth: {},
    product: {},
  },
  shared: {
    middlewares: {},
    utils: {},
    config: {},
  },
};

const dddStructure = {
  domain: {
    user: {
      entities: {},
      repositories: {},
      services: {},
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
  },
};

function createFolderRecursive(basePath, structure) {
  for (const key in structure) {
    const newPath = path.join(basePath, key);
    if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
    if (typeof structure[key] === 'object') {
      createFolderRecursive(newPath, structure[key]);
    } else {
      fs.writeFileSync(newPath, structure[key]);
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
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write ."
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@typescript-eslint/eslint-plugin": "^6.5.1",
    "@typescript-eslint/parser": "^6.5.1",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.6"
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
    "skipLibCheck": true
  }
}
`;
}

function appTsContent() {
  return `import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`;
}

function dockerfileContent() {
  return `# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source code
COPY dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/app.js"]
`;
}

function eslintConfigContent() {
  return `{
  "env": {
    "node": true,
    "es2020": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 11,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": "error"
  }
}
`;
}

function prettierConfigContent() {
  return `{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "trailingComma": "all"
}
`;
}

function eslintIgnoreContent() {
  return `node_modules
dist
`;
}

function prettierIgnoreContent() {
  return `node_modules
dist
`;
}

async function main() {
  console.log('🚀 Backend project generator CLI with Docker, ESLint and Prettier\n');

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

  fs.mkdirSync(rootPath);
  fs.mkdirSync(path.join(rootPath, 'src'));

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
  createFileWithContent(path.join(rootPath, 'README.md'), `# ${response.projectName}\n\nGenerated by backend project generator CLI.`);
  createFileWithContent(path.join(rootPath, 'Dockerfile'), dockerfileContent());
  createFileWithContent(path.join(rootPath, '.eslintrc.json'), eslintConfigContent());
  createFileWithContent(path.join(rootPath, '.eslintignore'), eslintIgnoreContent());
  createFileWithContent(path.join(rootPath, '.prettierrc'), prettierConfigContent());
  createFileWithContent(path.join(rootPath, '.prettierignore'), prettierIgnoreContent());

  console.log(`\n✅ Project "${response.projectName}" created successfully!`);
  console.log('To get started:\n');
  console.log(`  cd ${response.projectName}`);
  console.log('  npm install');
  console.log('  npm run dev');
  console.log('  npm run lint');
  console.log('  npm run format');
  console.log('  npm run build');
  console.log('  docker build -t ${response.projectName} .');
  console.log('  docker run -p 3000:3000 ${response.projectName}\n');
}

main();