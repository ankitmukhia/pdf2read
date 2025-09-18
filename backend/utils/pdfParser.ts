import fs from "fs";
import * as cheerio from "cheerio";

interface BlocksTypes {
  type?: string;
  text?: string;
  src?: string;
  html?: string;
}

export function parsePdfHtml(filePath: string) {
  const rawHtml = fs.readFileSync(filePath, "utf-8");
  const $ = cheerio.load(rawHtml);

  // Remove junk
  $("style, link, script").remove();
  $("*").removeAttr("style").removeAttr("class");

  const blocks: BlocksTypes[] = [];

  $("body *").each((_, el) => {
    const tag = $(el).prop("tagName")?.toLowerCase();
    const text = $(el).text().trim();

    if (!text && tag !== "img") return;

    if (tag === "p" || tag === "div" || tag === "span") {
      blocks.push({ type: "paragraph", text });
    } else if (tag === "img") {
      blocks.push({ type: "image", src: $(el).attr("src") });
    } else if (tag === "table") {
      blocks.push({ type: "table", html: $.html(el) });
    }
  });

  return blocks;
}
