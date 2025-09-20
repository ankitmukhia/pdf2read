"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { pdfjs, Document, Page } from "react-pdf";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useTheme } from "next-themes";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfViewer({ file }: { file: File }) {
  const { theme, setTheme } = useTheme();
  const [canvasTheme, setCanvasTheme] = useState(() =>
    theme === "dark" ? "#171717" : "#ffffff",
  );
  const [textColor, setTextColor] = useState(() =>
    theme === "dark" ? "#ffffff" : "",
  );
  const [totalNumPages, setTotalNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setTotalNumPages(numPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  useEffect(() => {
    function handleResize() {
      const screenWidth = window.innerWidth;

      if (screenWidth < 640) {
        setContainerWidth(0.6);
      } else if (screenWidth < 1024) {
        setContainerWidth(0.9);
      } else {
        setContainerWidth(1.1);
      }
    }
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      setCanvasTheme("#171717");
      setTextColor("#ffffff");
    } else {
      setCanvasTheme("#ffffff");
      setTextColor("");
    }
  }, [theme]);

  /*
   * @default #ffffff
   * @black #171717
   * @lime #ecfcca
   * @green #dcfce7
   * @amber #fef3c6
   * The reason we have empty text is because it causes a collision with default color.
   * */

  const themeVariants = [
    { bg: "#ffffff", text: "" },
    { bg: "#171717", text: "#ffffff" },
    { bg: "#ecfcca", text: "" },
    { bg: "#dcfce7", text: "" },
    { bg: "#fef3c6", text: "" },
  ];

  return (
    <div className="min-h-svh">
      <div className="flex h-screen flex-col items-center justify-center">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <div className="border border-neutral-200 dark:border-neutral-800">
            <Page
              pageNumber={pageNumber}
              canvasBackground={canvasTheme}
              scale={containerWidth}
            />
          </div>
        </Document>

        <div className="fixed bottom-4 z-10 flex flex-col space-y-2 text-center">
          <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-500/30 dark:bg-zinc-300/30 bg-clip-padding backdrop-filter backdrop-blur-xs">
            <div className="flex items-center gap-4 px-4 py-1.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-white/90 rounded-lg cursor-pointer"
                  disabled={pageNumber <= 1}
                  onClick={previousPage}
                >
                  <ChevronLeftCircleIcon className="size-7" />
                </button>
                <p className="text-white">
                  {pageNumber || (totalNumPages ? 1 : "--")} /{" "}
                  {totalNumPages || "--"}
                </p>
                <button
                  type="button"
                  className="text-white rounded-lg cursor-pointer"
                  disabled={pageNumber >= totalNumPages!}
                  onClick={nextPage}
                >
                  <ChevronRightCircleIcon className="size-7" />
                </button>
              </div>

              <Separator className="h-6" />

              <div className="flex gap-2">
                {themeVariants.map((customTheme) => (
                  <div
                    key={customTheme.bg}
                    style={{ backgroundColor: customTheme.bg }}
                    className="h-7 w-7 rounded-full cursor-pointer"
                    onClick={() => {
                      setCanvasTheme(customTheme.bg);
                      setTextColor(customTheme.text);
                    }}
                  />
                ))}
              </div>

              <Separator className="h-6" />

              <div
                className="flex items-center justify-center cursor-pointer rounded-full"
                onClick={() =>
                  theme === "dark" ? setTheme("light") : setTheme("dark")
                }
              >
                <SunIcon className="size-7 scale-100 text-white rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <MoonIcon className="absolute size-7 scale-0 text-white rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next work on fonts */}
      <style jsx global>{`
        .react-pdf__Page__textContent span {
          color: ${textColor} !important;
          font-family: "Times New Roman", Times, serif;
        }
      `}</style>
    </div>
  );
}

function Separator({ className }: { className: string }) {
  return (
    <div
      className={cn(
        `bg-zinc-200/70 dark:bg-neutral-400/20 shrink-0 h-full w-px`,
        className,
      )}
    />
  );
}
