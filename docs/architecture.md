# Project Architecture

## Overview
This project is a personal blog website featuring real-time hand-tracking 3D demos. It combines a blog with bilingual support (Chinese/English) and an interactive 3D hand gesture tracking demo.

## Tech Stack
-   **Frontend Framework:** Next.js 16 (App Router) with static export
-   **Core Libraries:** React 19, TypeScript
-   **Styling:** Tailwind CSS 4
-   **3D Graphics & Physics:** Three.js, @react-three/fiber, @react-three/rapier (3D physics)
-   **Hand Tracking:** MediaPipe Hands (21-point hand landmark detection)
-   **Content Management:** Velite (for blog posts)
-   **Package Manager:** pnpm

## Architecture Details

### Content Structure
-   **Blog Posts:** Stored in `content/posts/`. Each post has:
    -   `meta.json`: Metadata (date, tags, series, status).
    -   `{zh,en}.mdx`: Bilingual content for Chinese and English.
-   **Content Generation:** Velite automatically generates a search index and type definitions from the MDX content.

### Pages
-   `/`: Home page with a pixel-style UI.
-   `/blog`: Blog index page with search functionality.
-   `/blog/[slug]`: Individual blog post pages.
-   `/logs`: Development logs page.
-   `/hand-3d`: Real-time hand tracking 3D demo with a debug overlay.
-   `/labs`: Contains additional experimental features, specifically `hand-tracking`.
-   `/shop`: Placeholder for a shop page.

### Key Modules
-   `lib/hand-tracking/`: Contains the core logic for MediaPipe integration, coordinate mapping, and gesture detection.
-   `components/hand-3d/`: Houses components for the 3D scene, physics world, virtual hand, and interactive objects within the hand tracking demo.
-   `components/blog/`: Includes components for rendering blog listings and individual blog posts.
-   `hooks/`: Custom React hooks for various functionalities like `useBlogLanguage`, `useCamera`, `useGrabbing`, `useHandTracking`.

## Development & Deployment Notes
-   The site uses static export (`output: 'export'`) for production builds, meaning no server-side features are active in production.
-   The hand tracking demo at `/hand-3d` requires camera permissions from the user's browser.
-   Blog posts require both Chinese (`zh.mdx`) and English (`en.mdx`) content files to be present.
-   **Common Commands:**
    -   `pnpm dev`: Starts the development server (Velite + Next.js).
    -   `pnpm build`: Builds for production (Velite content + Next.js static export).
    -   `pnpm start`: Serves the production build.
    -   `pnpm lint`: Runs ESLint for code quality checks.
    -   `pnpm dev:content`: Runs Velite development server only.
    -   `pnpm build:content`: Builds Velite content only.
