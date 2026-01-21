# 我的博客 ✨

一个现代化的个人博客网站，使用纯 HTML/CSS/JavaScript 构建，部署在 Cloudflare Pages 上。

## 特性

- 🎨 **现代暗色主题** - 优雅的深色设计
- ✨ **玻璃拟态效果** - Glassmorphism 风格
- 🌈 **渐变动画** - 流动的背景效果
- 📱 **响应式布局** - 完美适配移动端
- ⚡ **零依赖** - 纯静态文件，极速加载
- 🔒 **安全配置** - 内置安全响应头

## 本地开发

```bash
# 使用 Python 内置服务器
python3 -m http.server 8080

# 或使用 npx serve
npx serve .

# 然后访问 http://localhost:8080
```

## 部署到 Cloudflare Pages

### 方式一：通过 GitHub 连接

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/my-blog.git
   git push -u origin main
   ```

2. **连接 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 **Pages** → **Create a project**
   - 选择 **Connect to Git**
   - 授权并选择你的仓库

3. **配置构建**
   - Build command: 留空
   - Build output directory: 留空或 `/`
   - 点击 **Save and Deploy**

4. **完成！** 你的博客将在 `https://your-project.pages.dev` 上线

### 方式二：直接上传

1. 在 Cloudflare Pages 中选择 **Upload assets**
2. 上传整个项目文件夹
3. 等待部署完成

## 项目结构

```
my-blogs/
├── index.html          # 首页
├── styles.css          # 样式文件
├── script.js           # 交互脚本
├── posts/              # 博客文章
│   ├── hello-world.html
│   └── getting-started.html
├── _headers            # Cloudflare 响应头配置
├── _redirects          # URL 重定向规则
└── README.md           # 说明文档
```

## 添加新文章

1. 在 `posts/` 目录创建新的 HTML 文件
2. 复制现有文章模板
3. 修改内容
4. 在 `index.html` 中添加文章卡片

## 自定义

- **修改颜色**: 编辑 `styles.css` 中的 CSS 变量
- **修改字体**: 在 `index.html` 中更换 Google Fonts 链接
- **添加评论**: 集成 Giscus 或 Utterances

## License

MIT
