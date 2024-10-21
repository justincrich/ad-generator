import { aiOperations } from "@/_server/ai/operations";
import { getWebpageContent } from "@/lib/htmlScraping";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Ad } from "../../../lib/schema";

const MAX_VARIANT_COUNT = 10;

const RequestSchema = z.object({
  url: z.string().url(),
  variants: z.number().min(0).max(MAX_VARIANT_COUNT).default(2).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RequestSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json(result.error.format(), { status: 400 });

    const { url, variants = 2 } = result.data;
    const pageData = await getWebpageContent(url);
    if (!pageData)
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    // Process the request body here
    const products = await aiOperations.extractProductInsights({
      url,
      content: pageData,
    });
    if (!products)
      return NextResponse.json(
        { error: "No product data on page" },
        { status: 400 }
      );
    const adCreative: Ad[] = [];
    const companyName = await aiOperations.extractCompanyName(pageData);
    const targeting = await aiOperations.selectTargeting(pageData, 10);
    if (!companyName)
      return NextResponse.json(
        { error: "Invalid company webpage" },
        { status: 400 }
      );

    console.log("products", targeting);
    for (let variant = 0; variant < variants; variant++) {
      const nextCreative = await aiOperations.generateAdCopy({
        webPageContent: pageData,
        productData: products,
        companyName,
        targeting,
      });
      const cta = await aiOperations.generateAdCTA(nextCreative);
      if (!cta) break;
      const name = await aiOperations.generateAdName(
        nextCreative,
        cta,
        companyName
      );
      if (!name) break;
      adCreative.push({
        ctaText: cta,
        ...nextCreative,
        name,
        destinationUrl: url,
      });
    }

    // Return a response
    return NextResponse.json(
      {
        adCreative,
        targeting,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing page:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
