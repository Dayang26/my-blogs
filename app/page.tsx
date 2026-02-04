import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-120px] top-[-80px] h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20">
        <header className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            Gesture Physics Lab
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              HandTrack 3D
            </h1>
            <p className="max-w-2xl text-base text-slate-300 md:text-lg">
              使用普通摄像头实时识别手势，在 3D 物理世界里完成抓取、拖动与抛掷。
              专注于手势稳定性与交互反馈，适合展示与原型验证。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/hand-3d"
              className="rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
            >
              Launch Demo
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-sm font-semibold text-slate-100">核心能力</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>MediaPipe Hands 实时 21 关节点追踪</li>
              <li>React Three Fiber + Rapier 物理交互</li>
              <li>左右手识别、平滑滤波、置信度门限</li>
              <li>可视化 Debug 覆盖层与状态面板</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-sm font-semibold text-slate-100">快速开始</div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-xs">
                pnpm dev
              </div>
              <p>
                访问 <span className="text-slate-100">/hand-3d</span> 进入演示页面，允许摄像头权限即可体验。
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/70 p-6">
          <div className="text-sm font-semibold text-slate-100">交互提示</div>
          <p className="mt-3 text-sm text-slate-300">
            建议在光线充足的环境中使用，手部距离摄像头约 30-60cm。捏合动作越稳定，抓取体验越流畅。
          </p>
        </section>
      </main>
    </div>
  );
}
