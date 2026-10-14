'use client';

import { useEffect, useRef, useState } from 'react';
import 'pannellum/build/pannellum.css';

export interface PanoramaViewerProps {
  panorama: string;
  title?: string;
  author?: string;
  autoLoad?: boolean;
  autoRotate?: number;
  compass?: boolean;
  pitch?: number;
  yaw?: number;
  hfov?: number;
  preview?: string;
}

export default function PanoramaViewer({
  panorama,
  title,
  author,
  autoLoad = true,
  autoRotate,
  compass = true,
  pitch = 0,
  yaw = 0,
  hfov = 110,
  preview,
}: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Pannellum.Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      setLoading(true);
      setError(null);

      // Side-effect import: registers window.pannellum (see @types/pannellum)
      await import('pannellum/build/pannellum.js');

      if (cancelled || !containerRef.current) return;

      // Destroy previous instance when panorama/props change (React 19 strict effects)
      try {
        viewerRef.current?.destroy();
      } catch {
        // ignore
      }
      viewerRef.current = null;
      containerRef.current.innerHTML = '';

      try {
        const viewer = window.pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama,
          title,
          author,
          autoLoad,
          compass,
          pitch,
          yaw,
          hfov,
          preview,
          // Only set autoRotate when enabled (> 0). Passing 0 disables rotation.
          ...(typeof autoRotate === 'number' ? { autoRotate } : {}),
          showZoomCtrl: true,
          showFullscreenCtrl: true,
          keyboardZoom: true,
          mouseZoom: true,
          draggable: true,
          disableKeyboardCtrl: false,
        });

        viewerRef.current = viewer;

        viewer.on('load', () => {
          if (!cancelled) setLoading(false);
        });
        viewer.on('error', (msg: string) => {
          if (!cancelled) {
            setError(msg || 'Không tải được panorama');
            setLoading(false);
          }
        });

        // If cached instantly, 'load' may have fired already — clear spinner on next tick
        // when viewer reports loaded.
        setTimeout(() => {
          if (!cancelled && viewerRef.current && viewerRef.current.isLoaded()) {
            setLoading(false);
          }
        }, 800);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Pannellum init failed');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      try {
        viewerRef.current?.destroy();
      } catch {
        // ignore
      }
      viewerRef.current = null;
    };
    // Re-create viewer when source image changes. View angles are initial-only by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panorama, preview]);

  // Live-toggle auto-rotate without re-creating the viewer.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || loading) return;
    try {
      if (typeof autoRotate === 'number' && autoRotate !== 0) {
        viewer.startAutoRotate(autoRotate);
      } else {
        viewer.stopAutoRotate();
      }
    } catch {
      // viewer may not be ready yet
    }
  }, [autoRotate, loading]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-black shadow-sm dark:border-white/10">
      <div ref={containerRef} className="h-[60vh] min-h-[380px] w-full" />

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
          Đang tải panorama 360°…
        </div>
      )}

      {error && (
        <div className="absolute inset-x-0 bottom-0 bg-red-600/90 px-4 py-2 text-sm text-white">
          Lỗi: {error}
        </div>
      )}
    </div>
  );
}
