"use client";

import { useEffect, useRef, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";

export default function DrinkPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function renderPdf() {
      setIsLoading(true);
      setError(null);
      try {
        // Provide a dedicated module worker to PDF.js instead of a string URL
        GlobalWorkerOptions.workerPort = new Worker(
          new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
          { type: "module" }
        );
        const loadingTask = getDocument({ url: "/pdfs/drink_card.pdf" });
        const pdf = await loadingTask.promise;

        const pagesToRender = Math.min(2, pdf.numPages);
        const renderScale = 1.6;

        const canvases: HTMLCanvasElement[] = [];
        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: renderScale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          canvases.push(canvas);
        }

        if (!isCancelled && containerRef.current) {
          const container = containerRef.current;
          container.innerHTML = "";
          canvases.forEach((canvas, idx) => {
            const wrapper = document.createElement("div");
            wrapper.className =
              "md:w-1/2 overflow-hidden rounded-lg shadow-2xl ring-1 ring-slate-700 bg-slate-900/40 mb-6";
            wrapper.appendChild(canvas);
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            container.appendChild(wrapper);
          });
        }
      } catch (e) {
        console.error(e);
        if (!isCancelled) setError("Could not render the PDF.");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    renderPdf();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main className="bg-lightgreyBackground text-darkText">
      <section className="mx-auto px-4 py-8 md:py-12">
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Drinks
          </h1>
          <p className="mt-2 text-darkText">
            Dette er en list over drinks du kan vælge imellem i dag
          </p>
        </header>

        <div
          ref={containerRef}
          className="relative flex flex-col items-center justify-center"
        ></div>

        {isLoading && (
          <div className="text-center text-slate-400">Loading…</div>
        )}
        {error && (
          <div className="text-center text-red-300">
            {error} Try{" "}
            <a
              className="underline hover:text-slate-200"
              href="/pdfs/drink_card.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              opening the file
            </a>
            .
          </div>
        )}
      </section>
    </main>
  );
}
