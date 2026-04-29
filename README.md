# VideoScript

VideoScript is a command-line tool designed for prompt engineering specifically for Video AI models like Google Veo 3, Runway Gen-3 Alpha, OpenAI Sora, and more. It provides an interactive script-writing process that automatically generates highly optimized, detailed prompts tailored for these advanced models.

## Features

- **Interactive Questionnaire**: Prompts you step-by-step for the subject, action, setting, camera movement, lighting, and style.
- **Model-Specific Optimization**: Tailors the structure of the final prompt based on the target AI model (e.g., Runway Gen-3 vs. general models).
- **Save to File**: Easily save your generated prompts to text files for future use.

## Installation

To use VideoScript globally on your machine, clone this repository and run:

```bash
npm install
npm run build
npm link
```

Or run it directly without global installation:

```bash
npm start -- generate
```

## Usage

Start the interactive generator:

```bash
vidscript generate
```

### Example Walkthrough

1. **Target Model**: Runway Gen-3 Alpha
2. **Subject**: A futuristic sports car
3. **Action**: drifting around a wet neon-lit corner
4. **Setting**: A cyberpunk city street at midnight
5. **Camera**: Drone Shot / Aerial
6. **Lighting**: Cinematic lighting with neon reflections
7. **Style**: Photorealistic, 8k resolution

**Generated Prompt:**
> Drone Shot / Aerial of A futuristic sports car drifting around a wet neon-lit corner, A cyberpunk city street at midnight. Cinematic lighting with neon reflections lighting. Style: Photorealistic, 8k resolution.
