import axios from "axios";
import * as cheerio from "cheerio";

export async function getWebpageContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unnecessary elements
    $("script, style, nav, footer, header").remove();

    // Extract main content
    const mainContent = $("body").text();

    // Clean and normalize text
    return mainContent.replace(/\s+/g, " ").trim();
  } catch (error) {
    console.error("Error scraping webpage:", error);
    return "";
  }
}
