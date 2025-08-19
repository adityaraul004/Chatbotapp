#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SUBSPACE CHATBOT - ENVIRONMENT SETUP\n');

console.log('This script will help you create your .env file with all required API keys.\n');

// Check if .env already exists
if (fs.existsSync('.env')) {
  console.log('⚠️  .env file already exists!');
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createEnvFile();
    } else {
      console.log('Setup cancelled. Your existing .env file is preserved.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('Please provide the following information:\n');

  const questions = [
    {
      name: 'NHOST_SUBDOMAIN',
      question: '1. Nhost Subdomain (e.g., myproject): ',
      description: 'Get this from your Nhost project dashboard'
    },
    {
      name: 'NHOST_REGION',
      question: '2. Nhost Region (usually us-east-1): ',
      description: 'Default: us-east-1'
    },
    {
      name: 'HASURA_ADMIN_SECRET',
      question: '3. Hasura Admin Secret: ',
      description: 'Get this from Nhost → Settings → API → GraphQL'
    },
    {
      name: 'OPENROUTER_API_KEY',
      question: '4. OpenRouter API Key: ',
      description: 'Get this from openrouter.ai'
    },
    {
      name: 'N8N_INSTANCE',
      question: '5. n8n Instance URL (e.g., https://myname.n8n.cloud): ',
      description: 'Your n8n cloud instance URL'
    }
  ];

  const answers = {};

  function askQuestion(index) {
    if (index >= questions.length) {
      generateEnvFile(answers);
      rl.close();
      return;
    }

    const q = questions[index];
    console.log(`\n${q.description}`);
    rl.question(q.question, (answer) => {
      if (answer.trim()) {
        answers[q.name] = answer.trim();
      } else if (q.name === 'NHOST_REGION') {
        answers[q.name] = 'us-east-1';
      }
      askQuestion(index + 1);
    });
  }

  askQuestion(0);
}

function generateEnvFile(answers) {
  const envContent = `# ========================================
# SUBSPACE CHATBOT - ENVIRONMENT VARIABLES
# ========================================
# Generated automatically - DO NOT EDIT MANUALLY

# NHOST CONFIGURATION
VITE_NHOST_SUBDOMAIN=${answers.NHOST_SUBDOMAIN}
VITE_NHOST_REGION=${answers.NHOST_REGION}

# HASURA GRAPHQL ENDPOINTS
VITE_HASURA_ENDPOINT=https://${answers.NHOST_SUBDOMAIN}.nhost.run/v1/graphql
VITE_HASURA_WS_ENDPOINT=wss://${answers.NHOST_SUBDOMAIN}.nhost.run/v1/graphql

# N8N WEBHOOK URL
VITE_N8N_WEBHOOK_URL=${answers.N8N_INSTANCE}/webhook/chatbot

# ========================================
# N8N WORKFLOW ENVIRONMENT VARIABLES
# ========================================
# Add these in your n8n workflow environment variables

# HASURA CONFIGURATION FOR N8N
HASURA_ENDPOINT=https://${answers.NHOST_SUBDOMAIN}.nhost.run/v1/graphql
HASURA_ADMIN_SECRET=${answers.HASURA_ADMIN_SECRET}

# OPENROUTER API CONFIGURATION
OPENROUTER_API_KEY=${answers.OPENROUTER_API_KEY}
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# APP URL (optional - add your Netlify URL after deployment)
APP_URL=https://your-app.netlify.app
`;

  fs.writeFileSync('.env', envContent);
  
  console.log('\n✅ .env file created successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the .env file to ensure all values are correct');
  console.log('2. Follow the IMMEDIATE_SETUP.md guide for database setup');
  console.log('3. Import the n8n workflow from n8n-workflow.json');
  console.log('4. Test your application with: npm run dev');
  console.log('\n🚀 You\'re ready to continue with the setup!');
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n\nSetup cancelled. Goodbye!');
  process.exit(0);
});
