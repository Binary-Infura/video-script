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

### Advanced YAML Script Compilation

The CLI tool is fully optimized to follow the 9-layer "Anatomy of a Perfect Video Prompt" from the **AI Video Generation Mastery Guide** by Nikhil Tripathi. 

You can define granular settings for each scene to ensure professional-grade prompts.

**Example `script.yml`:**
```yaml
project:
  name: The Cyberpunk Heist
  aspect_ratio: 21:9
  style: "Cyberpunk, Cinematic, Photorealistic"
  mood: "Tense, mysterious, neon-lit"
  quality: "8k, ultra-detailed, professional grading"

characters:
  koda:
    description: "A rogue hacker wearing a glowing neon mask and a dark trench coat"

scenes:
  - id: intro_scene
    subject: "koda"
    action: "walking slowly down an alleyway, looking over his shoulder cautiously"
    camera: "Over-the-Shoulder (OTS), Steadicam"
    lighting: "Low Key, Chiaroscuro with practical neon blue and pink lighting"
    environment: "A dark, raining cyberpunk city alleyway with towering skyscrapers in the background"
    duration: 5s
```

**Run Compilation:**
```bash
vidscript compile script.yml -o compiled_prompts.md
```

This will automatically format the final prompt sequentially: `Subject + Action + Camera + Lighting + Environment + Style + Mood + Quality + Character Context`, guaranteeing maximum attention weight from models like Runway Gen-3 and Sora!
