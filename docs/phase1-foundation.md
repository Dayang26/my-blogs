# Phase 1 · 基础设施清理与设计系统

> 清除旧代码，建立新的设计根基。这是整个重构的地基——所有后续 Phase 都依赖此阶段的数据模型和设计令牌。

---

## 目标

1. **数据模型简化**：去除双语 i18n 嵌套结构，拍平为纯中文字段
2. **依赖清理**：移除 3D 相关依赖和页面
3. **设计系统建立**：定义新包豪斯色彩、排版、间距令牌
4. **确保可编译**：所有组件适配新数据模型（视觉重构留给后续 Phase）

---

## 任务清单

### 1.1 数据模型简化

#### [MODIFY] types/blog.ts

- 移除 `Lang` 类型和 `LANGS` 常量
- 移除 `PostI18nLite` 接口
- `CompositePost` 的 `i18n: { zh, en }` 嵌套结构拍平为直接字段：`title`, `excerpt`, `readMinutes`, `code`
- `SearchIndexItem` 移除 `lang` 字段

变更前：
```ts
export interface CompositePost {
  slug: string;
  // ...
  i18n: {
    zh: PostI18nLite | null;
    en: PostI18nLite | null;
  };
}
```

变更后：
```ts
export interface CompositePost {
  slug: string;
  // ...
  title: string;
  excerpt: string;
  readMinutes: number;
  code: string;
}
```

> [!IMPORTANT]
> 这是破坏性变更的源头，会级联影响 velite.config、lib/blog.ts、所有组件。必须在本阶段一次性处理完毕。

#### [MODIFY] velite.config.mts

- `postI18n` collection 的 pattern 从 `posts/**/{zh,en}.mdx` 改为 `posts/**/zh.mdx`
- 移除 `i18nBySlug` 的双语合并逻辑，简化为单语映射
- 生成的 `compositePosts` 输出拍平结构（直接 `title/excerpt/readMinutes/code`，不含 i18n 嵌套）
- `searchIndex` 移除 `lang` 字段，只生成中文条目

#### [MODIFY] lib/blog-shared.ts

- 移除 `getI18n()` 函数（不再需要多语言选择）
- 移除 `getLanguageLabel()` 函数
- `tagLabels` 从 `Record<string, { zh: string; en: string }>` 简化为 `Record<string, string>`（只保留中文值）
- `getTagLabel()` 移除 `lang` 参数

#### [MODIFY] lib/blog.ts

- 移除对 `getLanguageLabel` 的导出
- `getBlogIndexData` 移除不必要的 featured/series/changelog/labNotes 字段（首页只需要 posts 和 tags）
- 保留所有文章查询函数

#### [DELETE] hooks/useBlogLanguage.ts

不再需要语言切换 hook。

#### [MODIFY] lib/giscus-config.ts

- `theme` 从 `dark_dimmed` 改为 `light`
- 移除 `commentsUiText`（不再需要多语言文案）

---

### 1.2 组件适配

> 本阶段只做**数据模型适配**，让代码能编译通过。视觉重构在 Phase 2/3 中进行。

#### [MODIFY] app/home-client.tsx

- 移除 `useBlogLanguage` 引用
- 移除语言切换 UI
- 移除 `uiText` 双语对象，替换为直接的中文字符串
- 数据访问从 `getI18n(post, lang)` 改为直接 `post.title` / `post.excerpt`

#### [MODIFY] components/blog/BlogIndexClient.tsx

- 移除 `useBlogLanguage` 引用和语言切换 UI
- 移除 `uiText` 双语对象
- 搜索逻辑中移除 `lang` 过滤
- 数据访问从 `getI18n(post, lang)` 改为直接字段访问

#### [MODIFY] components/blog/BlogPostClient.tsx

- 移除 `useBlogLanguage` 引用和语言切换 UI
- 移除 `uiText` 双语对象和 `availableLang` 逻辑
- 移除 `commentsUiText` 引用
- 数据访问从 `getI18n(post, currentLang)` 改为直接字段访问

#### [MODIFY] app/blog/[slug]/page.tsx

- `generateMetadata` 中的 `post?.i18n.zh ?? post?.i18n.en` 改为直接 `post?.title`

---

### 1.3 依赖与文件清理

#### [MODIFY] package.json

移除以下 3D 相关依赖：
- `@mediapipe/camera_utils`
- `@mediapipe/hands`
- `@react-three/drei`
- `@react-three/fiber`
- `@react-three/rapier`
- `three`（dependencies）
- `@types/three`（devDependencies）

#### [DELETE] 无用文件和目录

| 路径 | 说明 |
|------|------|
| `app/logs/` | 重定向页，不再需要 |
| `data/capitals.ts` | 3D 演示数据 |
| `components/home/` | 空目录，清理 |

#### [MODIFY] next.config.ts

- 移除 `/labs/:path*` 的 headers 配置（camera 权限不再需要）
- 保留通用安全 headers 和 `output: 'export'`

---

### 1.4 设计系统建立

#### [MODIFY] app/globals.css — 完全重写

移除所有旧样式（`pixel-*`、`scanlines`、暗色变量），建立新包豪斯设计令牌：

```css
@import "tailwindcss";

:root {
  --bg: #F5F1EB;
  --surface: #FEFCF9;
  --text-primary: #1A1A1A;
  --text-secondary: #6B6B6B;
  --text-muted: #A3A3A3;
  --accent: #B44A2D;
  --accent-hover: #9A3D24;
  --border: #E8E3DC;
  --code-bg: #F0ECE6;
}
```

定义内容：
- Tailwind `@theme` 令牌映射
- 全局 `body` 排版基线
- 通用动画（`animate-fade-in`：淡入 + 微位移）
- MDX 内容排版（`.mdx-content` 下的 h2/h3/p/ul/ol/code/pre/blockquote/a）
- `prefers-reduced-motion` 无障碍适配

#### [MODIFY] app/layout.tsx

- 字体替换：`Geist` → `Space_Grotesk`（标题），`Geist_Mono` → `JetBrains_Mono`（代码），新增 `Inter`（正文）
- CSS 变量：`--font-heading`, `--font-body`, `--font-mono`
- Metadata：`title: "SnowLine"`, `description: "Aaron Hu 的个人博客"`
- `html lang` 从 `en` 改为 `zh-CN`

---

## 验证

```bash
# 1. 安装依赖（移除 3D 包后）
pnpm install

# 2. 重新构建内容（velite 配置已变更）
pnpm build:content

# 3. 类型检查
pnpm exec tsc --noEmit

# 4. 构建验证
pnpm build
```

确认所有页面功能正常（数据正确渲染），视觉效果暂不关注。

---

## 产出物

- [x] 新的数据模型（拍平，无 i18n 嵌套）
- [x] 3D 依赖和页面已清除
- [x] 设计令牌已定义
- [x] 新字体配置完成
- [x] 所有组件可编译、功能正常
