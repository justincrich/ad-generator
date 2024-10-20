import {
  WebPageInsights,
  WebPageInsightsSchema,
  zodToCamelCasedJsonSchema,
} from "@/lib/schema";

import { openai } from "./models";

export const aiOperations = {
  extractWebPageInsights: async (args: {
    url: string;
    content: string;
  }): Promise<WebPageInsights | null> => {
    const PROMPT = `
You are a web scraping expert. You will receive URL and WEB_PAGE_CONTENT from the user. Your task is to extract the following information:

	1.	Company Name: The name of the company (e.g., “Acme Inc.”).
	2.	Industry: The industry the company operates in (e.g., “Technology”).
	3.	Products/Services: The products or services offered by the company, extracted from the webpage content (e.g., “Software Development”, “Web Design”).
	4.	Value Propositions: The company’s value propositions based on the content (e.g., “Increase sales”, “Improve customer satisfaction”).
	5.	Target Audience: The target audience for the products/services (e.g., “Small Businesses”, “Startups”).

    Return the information as a JSON object that matches the following schema:
    ${JSON.stringify(zodToCamelCasedJsonSchema(WebPageInsightsSchema))}

    Ensure the output conforms to this schema, filling in the fields based on the webpage content. If certain information is missing, return null for that field.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: PROMPT,
        },
        {
          role: "user",
          content: `
          URL: ${args.url}
          WEB_PAGE_CONTENT: 
          ${args.content}
          `,
        },
      ],
      response_format: { type: "json_object" },
    });
    const jsonResponse = WebPageInsightsSchema.safeParse(
      JSON.parse(response.choices?.[0]?.message?.content || "{}")
    );
    if (jsonResponse.success) {
      return jsonResponse.data;
    }
    return null;
  },
  generateTargeting: () => {},
  generateAdCopy: () => {},
};
