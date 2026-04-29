#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { pipeline } from 'stream/promises';

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

function buildPrompt(scene: any, script: ScriptYaml): string {
  let finalPrompt = '';

  if (scene.subject || scene.action) {
    const elements: string[] = [];
    if (scene.subject) elements.push(scene.subject);
    if (scene.action) elements.push(scene.action);
    finalPrompt += elements.join(' ') + '. ';
    
    if (scene.camera) finalPrompt += `Shot with ${scene.camera}. `;
    if (scene.lighting) finalPrompt += `${scene.lighting} lighting. `;
    if (scene.environment) finalPrompt += `Set in ${scene.environment}. `;
  } else if (scene.prompt) {
    if (scene.camera) {
      finalPrompt += `[${scene.camera.toUpperCase()}] `;
    }
    finalPrompt += scene.prompt;
    if (!finalPrompt.endsWith('.')) finalPrompt += '.';
  }

  const globalTags = [];
  if (script.project?.style) globalTags.push(`Style: ${script.project.style}`);
  if (script.project?.mood) globalTags.push(`Mood: ${script.project.mood}`);
  if (script.project?.quality) globalTags.push(`Quality: ${script.project.quality}`);

  if (globalTags.length > 0) {
    finalPrompt += ' ' + globalTags.join('. ') + '.';
  }

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
  
  return finalPrompt.replace(/\s+/g, ' ').trim();
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
        const finalPrompt = buildPrompt(scene, script);

        console.log(chalk.yellow(`Scene ${index + 1}: ${scene.id}`));
        if (scene.duration) console.log(chalk.gray(`Duration: ${scene.duration}`));
        console.log(chalk.white(`Prompt: ${finalPrompt}\n`));

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

program
  .command('generate <file>')
  .description('Generate actual videos for the compiled scenes using Luma AI API')
  .option('-o, --out-dir <directory>', 'Directory to save the generated mp4 files', './output')
  .option('--api-key <key>', 'Luma Dream Machine API Key (or set LUMA_API_KEY env var)')
  .action(async (file, options) => {
    try {
      const apiKey = options.apiKey || process.env.LUMA_API_KEY;
      if (!apiKey) {
        console.error(chalk.red('\nError: Luma API Key is required. Pass --api-key <key> or set LUMA_API_KEY env var.'));
        process.exit(1);
      }

      const filePath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`Error: File not found at ${filePath}`));
        process.exit(1);
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      const script = yaml.load(fileContents) as ScriptYaml;

      console.log(chalk.cyan.bold(`\n🎥 Generating Videos for: ${script.project?.name || 'Untitled'} 🎥\n`));

      const outDir = path.resolve(process.cwd(), options.outDir);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      for (let index = 0; index < script.scenes.length; index++) {
        const scene = script.scenes[index];
        const finalPrompt = buildPrompt(scene, script);
        
        console.log(chalk.yellow(`\nScene ${index + 1}: ${scene.id}`));
        console.log(chalk.gray(`Prompt: ${finalPrompt}`));
        console.log(chalk.blue('Calling Luma AI API...'));

        const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ prompt: finalPrompt })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(chalk.red(`API Error: ${response.status} ${response.statusText}`));
          console.error(chalk.red(errorText));
          continue;
        }

        const data = await response.json();
        const generationId = data.id;
        
        let isCompleted = false;
        let videoUrl = null;

        process.stdout.write(chalk.cyan('Generating video (this may take a few minutes)...'));
        
        while (!isCompleted) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const statusRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          
          if (!statusRes.ok) {
            console.error(chalk.red(`\nError fetching status: ${statusRes.status}`));
            break;
          }
          
          const statusData = await statusRes.json();
          const state = statusData.state;
          
          if (state === 'completed') {
            isCompleted = true;
            videoUrl = statusData.assets?.video;
            console.log(chalk.green('\n✅ Generation completed!'));
          } else if (state === 'failed') {
            isCompleted = true;
            console.log(chalk.red('\n❌ Generation failed.'));
            console.log(chalk.red(statusData.failure_reason || 'Unknown error'));
          } else {
            process.stdout.write(chalk.cyan('.'));
          }
        }

        if (videoUrl) {
          console.log(chalk.blue(`Downloading video...`));
          const videoRes = await fetch(videoUrl);
          if (!videoRes.ok) {
            console.error(chalk.red(`Failed to download video: ${videoRes.statusText}`));
            continue;
          }
          const fileName = `scene_${index + 1}_${scene.id}.mp4`;
          const savePath = path.join(outDir, fileName);
          
          // Use Node's built in arrayBuffer to write file since pipeline and fetch stream don't mix perfectly in some TS configs
          const arrayBuffer = await videoRes.arrayBuffer();
          fs.writeFileSync(savePath, Buffer.from(arrayBuffer));
          
          console.log(chalk.green(`✅ Saved video to ${savePath}`));
        }
      }
      
      console.log(chalk.cyan.bold(`\n🎉 All video generation complete! 🎉\n`));

    } catch (e: any) {
      console.error(chalk.red(`\nGeneration failed: ${e.message}`));
    }
  });

program.parse(process.argv);
