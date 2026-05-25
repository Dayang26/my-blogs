export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-[var(--border)] mt-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-2 px-6 py-8 text-center text-xs text-[var(--text-muted)] md:flex-row md:gap-1">
        <span>&copy; {currentYear} SnowLine</span>
        <span className="hidden md:inline">·</span>
        <span className="italic">一个关于手势追踪、3D 交互与前端开发的个人博客</span>
        <span className="hidden md:inline">·</span>
        <span>Aaron Hu · flyhsyy@gmail.com</span>
      </div>
    </footer>
  );
}
