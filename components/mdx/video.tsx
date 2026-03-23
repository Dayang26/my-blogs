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
      const match = parsed.pathname.match(/\/video\/(BV\w+|av\d+)/);
      if (match) return `https://player.bilibili.com/player.html?bvid=${match[1]}&high_quality=1`;
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
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg border-2 border-slate-600 bg-slate-900`}>
          <iframe
            src={embedUrl}
            title={title ?? 'Embedded video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
        {title && <figcaption className="mt-2 text-center text-xs text-slate-400">{title}</figcaption>}
      </figure>
    );
  }

  if (isFile) {
    return (
      <figure className="my-6">
        <div className={`relative w-full ${aspectClass} overflow-hidden rounded-lg border-2 border-slate-600 bg-slate-900`}>
          <video
            src={src}
            poster={poster}
            controls
            playsInline
            className="h-full w-full object-contain"
          >
            <track kind="captions" />
          </video>
        </div>
        {title && <figcaption className="mt-2 text-center text-xs text-slate-400">{title}</figcaption>}
      </figure>
    );
  }

  return (
    <div className="my-6 rounded-lg border-2 border-red-600 bg-red-900/20 p-4 text-center text-sm text-red-300">
      Unsupported video source: {src}
    </div>
  );
}
