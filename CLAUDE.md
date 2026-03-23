# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal blog website with real-time hand-tracking 3D demos. The main features are:
- Blog with bilingual support (Chinese/English) using MDX content
- Hand gesture tracking demo at `/hand-3d` using MediaPipe + React Three Fiber + Rapier physics

## Tech Stack

- Next.js 16 (App Router) with static export
- React 19, TypeScript
- Tailwind CSS 4
- Three.js + @react-three/fiber + @react-three/rapier (3D physics)
- MediaPipe Hands (21-point hand landmark detection)
- Velite (content management for blog posts)
- pnpm (package manager)

## Common Commands

```bash
pnpm dev          # Start dev server (runs Velite + Next.js in parallel)
pnpm build        # Build for production (Velite content + Next.js static export)
pnpm start        # Serve production build
pnpm lint         # Run ESLint
pnpm dev:content  # Run Velite dev server only
pnpm build:content # Build Velite content only
```

## Architecture

### Content Structure
- `content/posts/*/meta.json` - Post metadata (date, tags, series, status)
- `content/posts/*/{zh,en}.mdx` - Bilingual post content
- Velite generates search index and type definitions automatically

### Pages
- `/` - Home page (pixel-style UI)
- `/blog` - Blog index with search
- `/blog/[slug]` - Individual blog post
- `/logs` - Development logs
- `/hand-3d` - Hand tracking 3D demo with debug overlay

### Key Modules
- `lib/hand-tracking/` - MediaPipe integration, coordinate mapping, gesture detection
- `components/hand-3d/` - 3D scene, physics world, virtual hand, interactive objects
- `components/blog/` - Blog listing and post rendering components

## Notes

- The site uses static export (`output: 'export'`), so no server-side features work in production
- Hand tracking requires camera permissions at `/hand-3d`
- Blog posts require both `zh.mdx` and `en.mdx` files