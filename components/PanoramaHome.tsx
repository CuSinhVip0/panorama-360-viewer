"use client";

import { useState } from "react";
import PanoramaViewer from "./PanoramaViewer";

const SAMPLES = [
    {
        id: "sample-1",
        name: "Núi & hồ (mẫu 1)",
        url: "/panoramas/examplepano.jpg",
        author: "Alex Bdnr via Unsplash",
    },
    {
        id: "sample-2",
        name: "Ushaka Dolphin Stadium(mẫu 2)",
        url: "/panoramas/ushaka_dolphin_stadium.jpg",
        author: "Lok Yiu Cheung via Unsplash",
    },
];

export default function PanoramaHome() {
    const [activeId, setActiveId] = useState(SAMPLES[0].id);
    const [customUrl, setCustomUrl] = useState<string | null>(null);
    const [customName, setCustomName] = useState<string>("");
    const [autoRotate, setAutoRotate] = useState<number>(-2);

    const activeSample = SAMPLES.find((s) => s.id === activeId);
    const panorama = customUrl ?? activeSample?.url ?? SAMPLES[0].url;
    const title = customUrl ? customName || "Ảnh upload" : (activeSample?.name ?? "Panorama 360");
    const author = customUrl ? "Local upload" : (activeSample?.author ?? "");

    function handleFile(file: File | undefined) {
        if (!file) return;
        // Revoke old object URL to avoid memory leak
        if (customUrl?.startsWith("blob:")) URL.revokeObjectURL(customUrl);
        setCustomUrl(URL.createObjectURL(file));
        setCustomName(file.name);
        setActiveId("custom");
    }

    function backToSamples(id: string) {
        if (customUrl?.startsWith("blob:")) {
            // keep blob alive while switching? revoke only when new upload replaces it
        }
        setCustomUrl(null);
        setActiveId(id);
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Xem ảnh 360° Panorama bằng Pannellum
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Kéo chuột để xoay, cuộn để zoom. Ảnh equirectangular tỉ lệ ~2:1 cho kết quả tốt
                    nhất.
                </p>
            </header>

            <PanoramaViewer
                key={panorama}
                panorama={panorama}
                title={title}
                author={author}
                autoLoad
                compass
                autoRotate={autoRotate}
            />

            <section className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                    {SAMPLES.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => backToSamples(s.id)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                !customUrl && activeId === s.id
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                    : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                            }`}
                        >
                            {s.name}
                        </button>
                    ))}
                    {customUrl && (
                        <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
                            {customName || "Ảnh upload"}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex-1 text-sm">
                        <span className="mb-1 block font-medium">
                            Upload ảnh 360° từ máy (JPG/PNG)
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                            className="block w-full cursor-pointer rounded-lg border border-black/10 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:text-white dark:border-white/15 dark:bg-black dark:file:bg-white dark:file:text-black"
                        />
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                            type="checkbox"
                            checked={autoRotate !== 0}
                            onChange={(e) => setAutoRotate(e.target.checked ? -2 : 0)}
                            className="h-4 w-4"
                        />
                        Tự động xoay
                    </label>

                    {autoRotate !== 0 && (
                        <label className="flex items-center gap-2 text-sm">
                            Tốc độ
                            <input
                                type="range"
                                min={-8}
                                max={8}
                                step={1}
                                value={autoRotate}
                                onChange={(e) => setAutoRotate(Number(e.target.value) || 0)}
                                className="w-32"
                            />
                            <span className="w-8 tabular-nums">{autoRotate}</span>
                        </label>
                    )}
                </div>
            </section>
        </div>
    );
}
