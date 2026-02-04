import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

type SpriteConfig = {
  cols: number;
  rows: number;
  sheetW: number;
  sheetH: number;
  fps: number;
  row: number;
  frameW?: number;
  frameH?: number;
};

const fireSprite: SpriteConfig = {
  cols: 4,
  rows: 1,
  sheetW: 964,
  sheetH: 736,
  fps: 6,
  row: 0,
  frameW: 241,
};

const RWSprite: SpriteConfig = {
    cols: 4,
    rows: 2,
    sheetW: 1408,
    sheetH: 736,
    fps: 6,
    row: 0,
    frameW: 352,
};

function spriteStyle(src: string, config: SpriteConfig) {
  const frameW = config.frameW ?? config.sheetW / config.cols;
  const frameH = config.frameH ?? config.sheetH / config.rows;
  const xDuration = config.cols / config.fps;
  const offsetY = config.row * frameH;

  return {
    width: `${frameW}px`,
    height: `${frameH}px`,
    backgroundImage: `url(${src})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${config.sheetW}px ${config.sheetH}px`,
    backgroundPositionX: '0px',
    backgroundPositionY: `-${offsetY}px`,
    animation: `sprite-x ${xDuration}s steps(${config.cols}) infinite`,
    ['--sprite-sheet-w' as const]: `${config.sheetW}px`,
    ['--sprite-frame-w' as const]: `${frameW}px`,
    ['--sprite-frame-h' as const]: `${frameH}px`,
  } as CSSProperties;
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-slate-100">
      <Image
        src="/img_new.png"
        alt="Pixel background"
        fill
        priority
        className="pixelated object-cover"
      />

      <div className="relative z-10 min-h-screen">
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-end">
          <div className="sprite origin-bottom-right scale-[0.3]" style={spriteStyle('/fire_new.png', fireSprite)} />
          <div className="sprite origin-bottom-left scale-[0.3]" style={spriteStyle('/rw.png', RWSprite)} />
        </div>

        <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-4">
          <Link
            href="/hand-3d"
            className="border-2 border-cyan-200/90 bg-cyan-400/90 px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-950 shadow-[6px_6px_0px_rgba(14,116,144,0.8)] transition active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_rgba(14,116,144,0.8)]"
          >
            进入试验区
          </Link>
          <Link
            href="/logs"
            className="border-2 border-slate-200/90 bg-slate-900/90 px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-100 shadow-[6px_6px_0px_rgba(30,41,59,0.9)] transition active:translate-x-1 active:translate-y-1 active:shadow-[3px_3px_0px_rgba(30,41,59,0.9)]"
          >
            日志区域
          </Link>
        </div>
      </div>
    </div>
  );
}
