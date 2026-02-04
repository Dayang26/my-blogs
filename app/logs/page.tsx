import Image from 'next/image';
import Link from 'next/link';

export default function LogsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Image
        src="/img.png"
        alt="Pixel background"
        fill
        priority
        className="pixelated object-cover opacity-85"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/90" />

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-16 pt-20">
        <div className="inline-flex items-center gap-2 border-2 border-slate-200/70 bg-slate-900/70 px-3 py-1 text-xs font-mono uppercase tracking-[0.3em] text-slate-100 shadow-[4px_4px_0px_rgba(15,23,42,0.9)]">
          Logs
        </div>

        <h1 className="text-3xl font-bold uppercase tracking-[0.12em] text-slate-100 md:text-4xl">
          日志区域
        </h1>
        <p className="max-w-2xl text-sm font-mono leading-relaxed text-slate-200/90 md:text-base">
          这里用于记录试验过程、手势识别表现、环境变化等信息。
          你可以根据实际需求扩展为日志列表或上传系统。
        </p>

        <div className="rounded-xl border-2 border-slate-200/60 bg-slate-900/70 p-4 font-mono text-xs text-slate-200 shadow-[4px_4px_0px_rgba(15,23,42,0.9)]">
          示例：
          <div className="mt-2 space-y-2">
            <div>2026-02-04 19:02 试验区启动，FPS 平均 31。</div>
            <div>2026-02-04 19:05 右手捏合识别稳定，抛掷速度偏快。</div>
            <div>2026-02-04 19:08 低光环境下丢失手部 3 次。</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="border-2 border-slate-200/80 bg-slate-900/80 px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-100 shadow-[6px_6px_0px_rgba(30,41,59,0.9)] transition hover:bg-slate-800/80 active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_rgba(30,41,59,0.9)]"
          >
            返回主页
          </Link>
          <Link
            href="/hand-3d"
            className="border-2 border-cyan-200/80 bg-cyan-400/90 px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[6px_6px_0px_rgba(14,116,144,0.8)] transition active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_rgba(14,116,144,0.8)]"
          >
            进入试验区
          </Link>
        </div>
      </main>
    </div>
  );
}
