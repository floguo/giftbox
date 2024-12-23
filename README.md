# Giftbox

A playful web application for creating digital letters with various interactive elements. Built with Next.js and TypeScript.

## Features

- 📝 Add sticky notes with customizable colors
- 📷 Upload and add photos with captions
- 🎤 Record and add voice messages
- 🎵 Embed Spotify tracks
- ✏️ Draw doodles and sketches
- 🖱️ Drag and drop interface
- 🔄 Rotate and position items freely
- [NEW] Ability to save and share letters to people

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Web Audio API
- Canvas API
- shadcn/ui
- Upstash Redis and Vercel Blob Storage for storing letters

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

You also need to set up redis storage and blob storage for saving the letters and their assets. Here is a setup process if you deploy this on Vercel:

1. Create a new project on Vercel
2. Create a new Redis database and Blob storage on Vercel
3. Connect the Redis database and Blob storage to your project
4. Pull the environment variables from your connected Vercel project
5. Allow displaying assets from your Blob storage domain in your app by modifying the `next.config.ts` file

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'my-blob-store.public.blob.vercel-storage.com',
        port: '',
      },
    ],
  },
};

module.exports = nextConfig;
```

## Usage

- Click on toolbar items to add different elements to your letter
- Drag elements to position them
- Hover over elements to reveal controls
- Click the delete button to remove elements
- Use the color picker to customize note colors
- Record voice messages directly in the browser
- Draw doodles with the pencil tool
- Add Spotify tracks via embed URLs

## License

MIT
