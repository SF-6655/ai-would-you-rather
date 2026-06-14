# AI Would You Rather? 😈

An AI-powered "Would You Rather" game with no good options.

🔗 **Live Demo:** https://ai-would-you-rather-nine.vercel.app/

## What it does

- Pick a theme: Career, Food, Money, Social Life, Survival, or Random Chaos
- AI generates two absurd, uncomfortable dilemmas in real time
- Pick your poison — AI then roasts your choice and reveals what it says about you
- Share your dilemma with friends via clipboard copy
- Round counter tracks how many dilemmas you've survived

## Tech Stack

- React + Vite
- Groq API (Llama 3.1) for real-time question and reaction generation
- CSS animations for game feel
- Deployed on Vercel

## Running locally

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file and add your Groq API key:
4. Run `npm run dev`

## What I learned

- Structured JSON prompting with LLMs
- Handling unpredictable AI responses safely with regex extraction
- Building a stateful game loop in React
- CSS keyframe animations for interactive feedback
- Chaining multiple AI calls per user interaction