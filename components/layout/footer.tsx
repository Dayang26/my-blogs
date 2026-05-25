export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-[var(--border)] mt-20">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-2 px-6 py-8 text-center text-xs text-[var(--text-muted)] md:flex-row md:gap-1">
        <span>&copy; {currentYear} SnowLine</span>
        <span className="hidden md:inline">·</span>
        <span className="italic">Personality begins where comparison ends.</span>
        <span className="hidden md:inline">·</span>
        <span>Aaron Hu · flyhsyy@gmail.com</span>
      </div>
    </footer>
  );
}
