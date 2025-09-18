import express, { type Request } from "express";
import multer from "multer";
import { spawn } from "child_process";
import { parsePdfHtml } from "./utils/pdfParser";
import cors from "cors";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors());

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (
    _: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filePath: string) => void,
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = ["application/pdf"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

if (!fs.existsSync("outputs")) fs.mkdirSync("outputs");

// make outputs static files reachable via url for example outputs/xyz.pdf will be rechable via https://localhost:PORT/outputs/xyz.pdf
app.use("/outputs", express.static(path.resolve("outputs")));

app.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).send("No PDF uploaded");
  const filePath = req.file.path;

  try {
    const outputHtml = path.join("outputs", `${req.file.filename}.html`);

    // run binary via spawn
    await runPdf2Html(filePath, outputHtml);

    // parse and clean HTML
    const blocks = parsePdfHtml(outputHtml);

    fs.unlinkSync(filePath);

    res.json({ blocks });
  } catch (err) {
    console.error(err);
    res.status(500).send("Conversion failed");
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);

function runPdf2Html(pdfPath: string, htmlPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdf2html = spawn("./bin/pdf2htmlEX", [
      "--zoom",
      "1.3", // optional scaling
      "1024", // fit HTML width
      pdfPath,
      htmlPath,
    ]);

    pdf2html.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    pdf2html.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    pdf2html.on("close", (code) => {
      if (code === 0) {
        resolve(htmlPath);
      } else {
        reject(new Error(`pdf2htmlEX exited with code ${code}`));
      }
    });
  });
}
