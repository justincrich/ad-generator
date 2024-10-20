import { aiOperations } from "@/_server/ai/operations";
import { getWebpageContent } from "@/lib/htmlScraping";
import { NextResponse } from "next/server";
import { z } from "zod";

const RequestSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RequestSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json(result.error.format(), { status: 400 });

    const { url } = result.data;
    const pageData = await getWebpageContent(url);
    if (!pageData)
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    // Process the request body here
    const insights = await aiOperations.extractWebPageInsights({
      url,
      content: pageData,
    });
    console.log(insights);
    // Return a response
    return NextResponse.json(
      { message: "Page processed successfully" },
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
