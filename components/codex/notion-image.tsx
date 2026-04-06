"use client";

import { useState, useCallback } from "react";

type Props = {
  src: string;
  imageRefreshToken: string | null;
  alt: string;
  caption?: string;
};

export function NotionImage({ src, imageRefreshToken, alt, caption }: Props) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasRetried, setHasRetried] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(async () => {
    if (hasRetried || !imageRefreshToken) {
      setFailed(true);
      return;
    }
    setHasRetried(true);

    try {
      const params = new URLSearchParams({ token: imageRefreshToken });
      const res = await fetch(`/api/notion-image?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          setImageSrc(data.url);
          return;
        }
      }
    } catch {
      // fall through
    }

    setFailed(true);
  }, [imageRefreshToken, hasRetried]);

  if (failed) return null;

  return (
    <figure className="my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={alt || "Notion image"}
        className="max-w-full lg:max-w-lg h-auto rounded-sm select-none"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onError={handleError}
      />
      {caption ? (
        <figcaption className="mt-2 text-sm text-[rgb(var(--text-secondary))] font-[var(--font-ocr)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
