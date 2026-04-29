#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const program = new Command();

program
  .name('vidscript')
  .description('CLI tool to generate highly optimized cinematic prompts for AI Video models')
  .version('2.0.0');

interface ScriptYaml {
  project: {
    name: string;
    aspect_ratio?: string;
    style?: string;
    mood?: string;
    quality?: string;
  };
  characters?: Record<string, { description: string }>;
  scenes: Array<{
    id: string;
    prompt?: string;
    subject?: string;
    action?: string;
    camera?: string;
    lighting?: string;
    environment?: string;
    duration?: string;
  }>;
  output?: {
    format?: string;
    resolution?: string;
  };
}

program
  .command('compile <file>')
  .description('Compile a YAML script into professional AI Video Prompts based on the Mastery Guide')
  .option('-o, --output <outputFile>', 'Output file to save the compiled prompts')
  .action((file, options) => {
    try {
      const filePath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found at ${filePath}`));
        process.exit(1);
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const script = yaml.load(fileContents) as ScriptYaml;

      console.log(chalk.cyan.bold(`\n🎬 Compiling Professional Video Script: ${script.project?.name || 'Untitled'} 🎬\n`));

      const compiledScenes: string[] = [];
      let outputText = `# ${script.project?.name || 'Video Prompts'}\n\n`;

      if (script.project?.style) outputText += `**Style**: ${script.project.style}\n`;
      if (script.project?.mood) outputText += `**Mood**: ${script.project.mood}\n`;
      if (script.project?.quality) outputText += `**Quality**: ${script.project.quality}\n`;
      if (script.project?.aspect_ratio) outputText += `**Aspect Ratio**: ${script.project.aspect_ratio}\n`;
      outputText += `\n---\n\n`;

      script.scenes.forEach((scene, index) => {
        let finalPrompt = '';

        // Follow the Master Guide Anatomy: Subject + Action + Camera + Lighting + Environment + Style
        
        // Use structured fields if provided
        if (scene.subject || scene.action) {
          const elements: string[] = [];
          if (scene.subject) elements.push(scene.subject);
          if (scene.action) elements.push(scene.action);
          finalPrompt += elements.join(' ') + '. ';
          
          if (scene.camera) finalPrompt += `Shot with ${scene.camera}. `;
          if (scene.lighting) finalPrompt += `${scene.lighting} lighting. `;
          if (scene.environment) finalPrompt += `Set in ${scene.environment}. `;
        } 
        // Fallback to legacy 'prompt' string
        else if (scene.prompt) {
          if (scene.camera) {
            finalPrompt += `[${scene.camera.toUpperCase()}] `;
          }
          finalPrompt += scene.prompt;
          if (!finalPrompt.endsWith('.')) finalPrompt += '.';
        }

        // Global attributes
        const globalTags = [];
        if (script.project?.style) globalTags.push(`Style: ${script.project.style}`);
        if (script.project?.mood) globalTags.push(`Mood: ${script.project.mood}`);
        if (script.project?.quality) globalTags.push(`Quality: ${script.project.quality}`);

        if (globalTags.length > 0) {
          finalPrompt += ' ' + globalTags.join('. ') + '.';
        }

        // Auto-inject Character Descriptions
        if (script.characters) {
          const combinedStr = `${scene.prompt || ''} ${scene.subject || ''} ${scene.action || ''}`.toLowerCase();
          const mentionedCharacters = Object.keys(script.characters).filter(charName =>
            combinedStr.includes(charName.toLowerCase())
          );

          if (mentionedCharacters.length > 0) {
            finalPrompt += ` Characters: `;
            const charDescriptions = mentionedCharacters.map(char => 
              `${char} (${script.characters![char].description})`
            );
            finalPrompt += charDescriptions.join(', ') + '.';
          }
        }
        
        finalPrompt = finalPrompt.replace(/\s+/g, ' ').trim();

        // Build CLI display text
        console.log(chalk.yellow(`Scene ${index + 1}: ${scene.id}`));
        if (scene.duration) console.log(chalk.gray(`Duration: ${scene.duration}`));
        console.log(chalk.white(`Prompt: ${finalPrompt}\n`));

        // Build file output text
        outputText += `### Scene ${index + 1} (${scene.id})\n`;
        if (scene.duration) outputText += `- **Duration**: ${scene.duration}\n`;
        outputText += `- **Prompt**: \`${finalPrompt}\`\n\n`;

        compiledScenes.push(finalPrompt);
      });

      if (options.output) {
        const outPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outPath, outputText, 'utf-8');
        console.log(chalk.green(`\n✅ Successfully compiled ${script.scenes.length} scenes to ${options.output}`));
      } else {
        console.log(chalk.cyan(`\nRun with --output <filename.md> to save these prompts to a file.`));
      }

    } catch (e: any) {
      console.error(chalk.red(`\nFailed to compile YAML file: ${e.message}`));
    }
  });

program.parse(process.argv);
