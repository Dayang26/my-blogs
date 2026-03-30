import Image from 'next/image';
import type { CSSProperties } from 'react';
import { HomeClient } from './home-client';

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
        <div className="absolute bottom-6 left-1/2 h-[1px] w-[1px]">
          <div
            className="sprite absolute bottom-15 left-1/2 origin-bottom-left -translate-x-[100px] scale-[0.3]"
            style={spriteStyle('/rw.png', RWSprite)}
          />
          <div
            className="sprite absolute bottom-0 left-1/2 origin-bottom-right translate-x-[-150px] scale-[0.3]"
            style={spriteStyle('/fire_new.png', fireSprite)}
          />
        </div>

        <HomeClient />
      </div>
    </div>
  );
}