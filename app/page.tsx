import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Image
        src="/img.png"
        alt="Pixel background"
        fill
        priority
        className="pixelated object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/90" />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-20 lg:flex-row lg:items-end lg:justify-between">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 border-2 border-slate-200/70 bg-slate-900/70 px-3 py-1 text-xs font-mono uppercase tracking-[0.3em] text-slate-100 shadow-[4px_4px_0px_rgba(15,23,42,0.9)]">
            Pixel Mode
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold uppercase tracking-[0.12em] text-slate-100 md:text-5xl">
              HandTrack 3D
            </h1>
            <p className="max-w-xl text-sm font-mono leading-relaxed text-slate-200/90 md:text-base">
              用普通摄像头驱动像素世界的 3D 物理试验区。实时手势识别、抓取与抛掷，
              以游戏化方式展示交互能力。
            </p>
          </div>

          <div className="flex items-end gap-4">
            <div className="rounded-xl border-2 border-slate-200/60 bg-slate-900/70 p-3 shadow-[4px_4px_0px_rgba(15,23,42,0.9)]">
              <Image
                src="/rw.png"
                alt="Pixel hero"
                width={110}
                height={140}
                className="pixelated"
              />
            </div>
            <div className="rounded-xl border-2 border-amber-200/70 bg-amber-500/10 p-2 shadow-[4px_4px_0px_rgba(120,53,15,0.9)]">
              <Image
                src="/fire.png"
                alt="Pixel fire"
                width={72}
                height={72}
                className="pixelated"
              />
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300/80">
            Tip: 光线越稳定，手势识别越稳。
          </div>
        </section>

        <section className="flex w-full flex-col gap-4 sm:w-72 lg:self-end">
          <Link
            href="/hand-3d"
            className="group w-full border-2 border-cyan-200/80 bg-cyan-400/90 px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[6px_6px_0px_rgba(14,116,144,0.8)] transition active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_rgba(14,116,144,0.8)]"
          >
            进入试验区
          </Link>
          <Link
            href="/logs"
            className="group w-full border-2 border-slate-200/80 bg-slate-900/80 px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-100 shadow-[6px_6px_0px_rgba(30,41,59,0.9)] transition hover:bg-slate-800/80 active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_rgba(30,41,59,0.9)]"
          >
            日志区域
          </Link>
          <div className="rounded-xl border-2 border-slate-200/40 bg-slate-900/70 px-4 py-3 text-xs font-mono text-slate-200/80 shadow-[4px_4px_0px_rgba(15,23,42,0.9)]">
            试验区用于手势与 3D 物理验证。
            日志区域用于记录观察与数据。
          </div>
        </section>
      </main>
    </div>
  );
}
