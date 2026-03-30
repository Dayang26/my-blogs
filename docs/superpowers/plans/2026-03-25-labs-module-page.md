# Labs Module Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a lab module selection page (`/labs`) with pixel style, move existing hand-tracking 3D experiment to `/labs/hand-tracking`, and handle the old `/hand-3d` path.

**Architecture:** New `/labs` page with module card grid layout. Data-driven module configuration for easy extension. Hand tracking content moved to nested route. Redirect old `/hand-3d` to new location.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4

---

## File Structure

```
app/
├── labs/
│   ├── page.tsx              # NEW: Lab selection page (pixel style)
│   └── hand-tracking/
│       └── page.tsx          # MOVED: From app/hand-3d/page.tsx
├── hand-3d/
│   └── page.tsx              # MODIFIED: Redirect to /labs/hand-tracking
└── page.tsx                  # MODIFIED: Update nav link

lib/
├── config/
│   └── labs.config.ts        # NEW: Lab modules configuration

components/
└── labs/
    └── LabCard.tsx           # NEW: Lab module card component

types/
└── lab.ts                    # NEW: Lab module type definitions

docs/superpowers/specs/
└── 2026-03-25-labs-design.md # Design doc (this will be created after spec review)
```

---

## Task 1: Create Lab Module Type Definitions

**Files:**
- Create: `types/lab.ts`
- Test: N/A (type definitions)

- [ ] **Step 1: Create type definitions**

```typescript
// types/lab.ts

export type LabModuleStatus = 'ready' | 'coming-soon' | 'deprecated';

export interface LabModuleTranslations {
  zh: string;
  en: string;
}

export interface LabModule {
  id: string;
  title: LabModuleTranslations;
  description: LabModuleTranslations;
  path: string;
  icon: string;
  status: LabModuleStatus;
  badge?: LabModuleTranslations;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/lab.ts
git commit -m "feat(labs): add lab module type definitions"
```

---

## Task 2: Create Lab Module Configuration

**Files:**
- Create: `lib/config/labs.config.ts`
- Modify: N/A
- Test: N/A

- [ ] **Step 1: Create lab config**

> **Note:** If the `lib/config/` directory doesn't exist, Next.js will create it automatically when you save the file.

```typescript
// lib/config/labs.config.ts
import { LabModule } from '@/types/lab';

export const labModules: LabModule[] = [
  {
    id: 'hand-tracking',
    title: {
      zh: '手势追踪 3D',
      en: 'Hand Tracking 3D',
    },
    description: {
      zh: '使用 MediaPipe 进行实时手势检测，在 3D 场景中与虚拟物体交互',
      en: 'Real-time hand gesture detection using MediaPipe, interact with virtual objects in 3D scene',
    },
    path: '/labs/hand-tracking',
    icon: '🖐️',
    status: 'ready',
  },
  // Future modules can be added here
  // {
  //   id: 'face-detection',
  //   title: { zh: '面部检测', en: 'Face Detection' },
  //   ...
  // },
];

export function getLabModule(id: string): LabModule | undefined {
  return labModules.find((module) => module.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/config/labs.config.ts
git commit -m "feat(labs): add lab module configuration"
```

---

## Task 3: Create Lab Card Component

**Files:**
- Create: `components/labs/LabCard.tsx`
- Modify: N/A
- Test: N/A (UI component)

- [ ] **Step 1: Create LabCard component**

> **Note:** The `components/labs/` directory will be created automatically.

```tsx
// components/labs/LabCard.tsx
'use client';

import Link from 'next/link';
import { LabModule } from '@/types/lab';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';

interface LabCardProps {
  module: LabModule;
}

export function LabCard({ module }: LabCardProps) {
  const { lang } = useBlogLanguage('en');
  const isZh = lang === 'zh';
  const title = module.title[lang];
  const description = module.description[lang];
  const isReady = module.status === 'ready';

  return (
    <Link
      href={isReady ? module.path : '#'}
      className={`group relative block border-2 p-4 transition active:translate-x-1 active:translate-y-1 ${
        isReady
          ? 'border-cyan-200/90 bg-cyan-400/90 text-slate-950 hover:border-cyan-200 cursor-pointer'
          : 'border-slate-200/60 bg-slate-900/80 text-slate-400 cursor-not-allowed'
      }`}
    >
      {/* Status Badge */}
      {!isReady && (
        <span className="absolute right-2 top-2 rounded bg-slate-700 px-2 py-0.5 text-xs font-bold uppercase text-slate-300">
          {isZh ? '即将推出' : 'Coming Soon'}
        </span>
      )}

      {/* Icon */}
      <div className="mb-3 text-4xl">{module.icon}</div>

      {/* Title */}
      <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.15em]">{title}</h3>

      {/* Description */}
      <p className="text-xs opacity-80">{description}</p>
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/labs/LabCard.tsx
git commit -m "feat(labs): add LabCard component"
```

---

## Task 4: Create Labs Selection Page

**Files:**
- Create: `app/labs/page.tsx`
- Modify: N/A
- Test: N/A (page)

> **Note:** `lib/config/` and `components/labs/` directories don't exist yet. Next.js will create them automatically when you save the new files. If you encounter issues, run: `mkdir -p lib/config components/labs app/labs/hand-tracking`

- [ ] **Step 1: Create labs page (with 'use client' directive)]**

```tsx
// app/labs/page.tsx
'use client';

import Link from 'next/link';
import { labModules } from '@/lib/config/labs.config';
import { LabCard } from '@/components/labs/LabCard';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';

export default function LabsPage() {
  const { lang } = useBlogLanguage('en');
  const isZh = lang === 'zh';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      {/* Background - pixel style */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <h1 className="text-lg font-bold uppercase tracking-[0.2em]">
            {isZh ? '实验区域' : 'Labs'}
          </h1>
          <Link
            href="/"
            className="border-2 border-slate-200/60 bg-slate-900/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-300 hover:border-slate-200/90"
          >
            {isZh ? '返回首页' : 'Back to Home'}
          </Link>
        </header>

        {/* Module Grid */}
        <main className="flex flex-1 items-center justify-center px-8 pb-8">
          <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {labModules.map((module) => (
              <LabCard key={module.id} module={module} />
            ))}

            {/* Placeholder cards for future expansion */}
            {labModules.length < 3 &&
              Array.from({ length: 3 - labModules.length }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="flex min-h-[160px] items-center justify-center border-2 border-dashed border-slate-700 bg-slate-900/40"
                >
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-600">
                    {isZh ? '即将推出' : 'Coming Soon'}
                  </span>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/labs/page.tsx
git commit -m "feat(labs): create labs selection page"
```

---

## Task 5: Move Hand Tracking to New Path

**Files:**
- Create: `app/labs/hand-tracking/page.tsx`
- Modify: N/A (keep original for now)
- Test: N/A

- [ ] **Step 1: Copy hand-3d page to new location**

```bash
# Copy the entire file content
cp app/hand-3d/page.tsx app/labs/hand-tracking/page.tsx
```

- [ ] **Step 2: Modify the header in the new page to add Back to Labs link**

Open `app/labs/hand-tracking/page.tsx`, find the header section (around line 90-135), and add the Back to Labs link:

```tsx
<Link
  href="/labs"
  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:border-white/30"
>
  ← Back to Labs
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add app/labs/hand-tracking/page.tsx
git commit -m "feat(labs): move hand tracking to /labs/hand-tracking"
```

---

## Task 6: Handle Old /hand-3d Path (Redirect)

**Files:**
- Modify: `app/hand-3d/page.tsx`
- Test: N/A

> **Note:** This project uses static export (`output: 'export'` in next.config.ts), so `next/navigation` redirect won't work. Must use client-side redirect.

- [ ] **Step 1: Replace hand-3d page with client-side redirect]

```tsx
// app/hand-3d/page.tsx
'use client';

import { useEffect } from 'react';

export default function Hand3DRedirect() {
  useEffect(() => {
    window.location.href = '/labs/hand-tracking';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-sm">Redirecting...</p>
      <meta httpEquiv="refresh" content="0;url=/labs/hand-tracking" />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hand-3d/page.tsx
git commit -m "fix(labs): redirect /hand-3d to /labs/hand-tracking"
```

---

## Task 7: Update Navigation in Home

**Files:**
- Modify: `app/home-client.tsx`
- Test: N/A

- [ ] **Step 1: Update nav link]

Change:
```typescript
{ href: '/hand-3d', en: 'Enter Lab', zh: '进入试验区', primary: true },
```

To:
```typescript
{ href: '/labs', en: 'Enter Lab', zh: '进入试验区', primary: true },
```

- [ ] **Step 2: Commit**

```bash
git add app/home-client.tsx
git commit -m "feat(labs): update home navigation to /labs"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Type definitions | `types/lab.ts` |
| 2 | Lab config | `lib/config/labs.config.ts` |
| 3 | LabCard component | `components/labs/LabCard.tsx` |
| 4 | Labs selection page | `app/labs/page.tsx` |
| 5 | Hand tracking new path | `app/labs/hand-tracking/page.tsx` |
| 6 | Redirect old path | `app/hand-3d/page.tsx` |
| 7 | Update navigation | `app/home-client.tsx` |

**Branching Strategy:** Feature branch `feat/labs-module-page`

**Testing:** Manual verification of:
- [ ] `/labs` shows pixel-style module selection
- [ ] Hand tracking module card is clickable
- [ ] Clicking card navigates to `/labs/hand-tracking`
- [ ] Old `/hand-3d` redirects to `/labs/hand-tracking`
- [ ] Home "Enter Lab" goes to `/labs`
- [ ] Pixel style matches homepage aesthetic