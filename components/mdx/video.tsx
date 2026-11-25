'use client';

type VideoProps = {
  src: string;
  title?: string;
  poster?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1';
};

const getEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (parsed.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname === 'www.bilibili.com' || parsed.hostname === 'bilibili.com') {
      const bv = parsed.pathname.match(/\/video\/(BV\w+)/);
      if (bv) return `https://player.bilibili.com/player.html?bvid=${bv[1]}&high_quality=1`;
      const av = parsed.pathname.match(/\/video\/av(\d+)/);
      if (av) return `https://player.bilibili.com/player.html?aid=${av[1]}&high_quality=1`;
    }
    if (parsed.hostname === 'vimeo.com') {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
};

const isVideoFile = (src: string): boolean => {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
};

export function Video({ src, title, poster, aspectRatio = '16/9' }: VideoProps) {
  const embedUrl = getEmbedUrl(src);
  const isFile = isVideoFile(src);

  const aspectClass = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }[aspectRatio];

  if (embedUrl) {
    return (
      <figure className="my-6">
        <div className="rounded-3xl glass-card p-1.5">
          <div className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-[var(--code-bg)]`}>
            <iframe
              src={embedUrl}
              title={title ?? 'Embedded video'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
        {title && <figcaption className="mt-2.5 text-center text-xs text-[var(--text-muted)]">{title}</figcaption>}
      </figure>
    );
  }

  if (isFile) {
    return (
      <figure className="my-6">
        <div className="rounded-3xl glass-card p-1.5">
          <div className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-[var(--code-bg)]`}>
            <video
              src={src}
              poster={poster}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        {title && <figcaption className="mt-2.5 text-center text-xs text-[var(--text-muted)]">{title}</figcaption>}
      </figure>
    );
  }

  return (
    <div className="my-6 rounded-2xl glass-card p-4 text-center text-sm text-[var(--text-secondary)]">
      不支持的视频源: {src}
    </div>
  );
}
