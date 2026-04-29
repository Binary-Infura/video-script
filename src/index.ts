#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('vidscript')
  .description('CLI tool to generate highly optimized prompts for Video AI models')
  .version('1.0.0');

program
  .command('generate')
  .description('Interactive prompt to generate a video script')
  .action(async () => {
    console.log(chalk.cyan.bold('\n🎬 Welcome to VideoScript Generator! 🎬\n'));
    console.log(chalk.gray('Let\'s create an amazing prompt for your next AI video.\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: 'Which AI model are you targeting?',
        choices: ['Google Veo', 'Runway Gen-3 Alpha', 'OpenAI Sora', 'Luma Dream Machine', 'General / Other'],
      },
      {
        type: 'input',
        name: 'subject',
        message: 'What is the main subject of your video? (e.g., A golden retriever, A futuristic sports car)',
        validate: (input) => input ? true : 'Subject is required.',
      },
      {
        type: 'input',
        name: 'action',
        message: 'What is the subject doing? (e.g., running through a field, drifting around a corner)',
        validate: (input) => input ? true : 'Action is required.',
      },
      {
        type: 'input',
        name: 'setting',
        message: 'Describe the setting/environment: (e.g., A busy neon-lit street in Tokyo at night)',
      },
      {
        type: 'list',
        name: 'camera',
        message: 'Select a camera movement/angle:',
        choices: [
          'Static / Tripod',
          'Slow Pan',
          'Tracking Shot / Follow',
          'Drone Shot / Aerial',
          'Close-up / Macro',
          'FPV (First Person View)',
          'Cinematic Orbit',
        ],
      },
      {
        type: 'input',
        name: 'lighting',
        message: 'Describe the lighting: (e.g., Cinematic lighting, golden hour, moody low-key)',
      },
      {
        type: 'input',
        name: 'style',
        message: 'Any specific art style or mood? (e.g., Photorealistic, Cyberpunk, 35mm film, Anime)',
      }
    ]);

    // Construct the prompt based on answers
    let prompt = '';

    // Different models sometimes prefer different structures, but generally descriptive works best.
    if (answers.model === 'Runway Gen-3 Alpha') {
      // Runway often likes [Camera Movement] - [Subject] - [Setting] - [Details]
      prompt = `${answers.camera} of ${answers.subject} ${answers.action}, ${answers.setting}. `;
      if (answers.lighting) prompt += `${answers.lighting} lighting. `;
      if (answers.style) prompt += `Style: ${answers.style}.`;
    } else {
      // General highly descriptive structure
      prompt = `A ${answers.style ? answers.style.toLowerCase() : 'high-quality'} video of ${answers.subject} ${answers.action}. `;
      if (answers.setting) prompt += `The scene takes place in ${answers.setting}. `;
      if (answers.camera) prompt += `Shot with a ${answers.camera.toLowerCase()} camera technique. `;
      if (answers.lighting) prompt += `The lighting is ${answers.lighting}.`;
    }

    // Clean up double spaces
    prompt = prompt.replace(/\s+/g, ' ').trim();

    console.log(chalk.green.bold('\n✅ Generated Prompt:\n'));
    console.log(chalk.white.bgBlack.bold(` ${prompt} \n`));

    const { save } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'save',
        message: 'Would you like to save this prompt to a file?',
        default: false,
      }
    ]);

    if (save) {
      const { filename } = await inquirer.prompt([
        {
          type: 'input',
          name: 'filename',
          message: 'Enter filename (e.g., my_prompt.txt):',
          default: 'prompt.txt',
        }
      ]);
      fs.writeFileSync(path.join(process.cwd(), filename), prompt, 'utf-8');
      console.log(chalk.green(`\nSaved to ${filename}`));
    }
  });

program.parse(process.argv);
