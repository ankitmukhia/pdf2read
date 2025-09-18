"use client";

import { useEffect, useState } from "react";
import { ChevronLeftCircleIcon, ChevronRightCircleIcon } from "lucide-react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useTheme } from "next-themes";
import "./pdf.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function PdfViewer({ file }: { file: File }) {
  const { theme } = useTheme();
  const [canvasTheme, setCanvasTheme] = useState(() => theme === "dark" ? "#171717" : "#ffffff");
  const [textColor, setTextColor] = useState(() => theme === "dark" ? "#ffffff" : "");
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
   * the reason we have empty text is because it causes a collision with default color.
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
      {/* <button onClick={() => theme === "dark" ? setTheme("light") : setTheme("dark")}>Theme</button> */}
      <div className="flex h-screen flex-col items-center justify-center">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <div className="border border-neutral-800">
            <Page
              pageNumber={pageNumber}
              canvasBackground={canvasTheme}
              scale={containerWidth}
            />
          </div>
        </Document>

        <div className="absolute z-10 flex flex-col pb-4 justify-end h-screen space-y-2 text-center">
          <div className="flex items-center gap-2 p-2 rounded-full bg-zinc-100/20 bg-clip-padding backdrop-filter backdrop-blur-sm">
            <div className="flex items-center gap-4 px-4 py-2">
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
