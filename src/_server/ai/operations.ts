import {
  zodToCamelCasedJsonSchema,
  AdSchema,
  AdCopySchema,
  AdCopy,
  Targeting,
} from "@/lib/schema";
import yaml from "yaml";

import { claude, openai } from "./models";
import { extractTagContents } from "./extractTagContents";
import {
  allTargetingGroups,
  targetingGroupsByUrn,
} from "@/lib/linkedin/targeting";

export const aiOperations = {
  extractCompanyName: async (content: string): Promise<string> => {
    const PROMPT = `
        You are a marketing specialist. Your task is to extract the company name from the following content:
        ${content}

        Your output should be in the JSON format:
        {
            "companyName": "string"
        }
            example:
            {
                "companyName": "Acme Inc."
            }
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: PROMPT,
        },
      ],
      max_tokens: 1000,
      temperature: 0,
      response_format: { type: "json_object" },
    });
    const message = response?.choices?.[0]?.message?.content ?? "{}";
    try {
      const data = JSON.parse(message);
      if ("companyName" in data) {
        return data.companyName;
      }
      return "";
    } catch (e) {
      console.log("Error parsing JSON", e);
      return "";
    }
  },
  extractProductInsights: async (args: {
    url: string;
    content: string;
  }): Promise<string> => {
    const PROMPT = `
You are a marketing expert who needs to classify products from a company's website. Using the CONTENT below list the company's products with a vrief description of each product seperated by a new line character (\\n). For example, for Apple Computer the content could be the following:
    iPhone: The iPhone is a line of smartphones designed and marketed by Apple Inc.
    MacBook: The MacBook is a brand of laptop computers designed and marketed by Apple Inc.

    Return all product data in the following JSON format:
    {
     products:"YOUR_PRODUCT_DATA"
    }

    for example:
    {
     products: "iPhone: The iPhone is a line of smartphones designed and marketed by Apple Inc.\nMacBook: The MacBook is a brand of laptop computers designed and marketed by Apple Inc."
    }

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
    try {
      const data = JSON.parse(response.choices?.[0]?.message?.content || "{}");
      if ("products" in data) {
        return data.products;
      }
      return "";
    } catch (e) {
      console.log("Error parsing JSON", e);
      return "";
    }
  },
  generateAdName: async (
    adCopy: AdCopy,
    cta: string,
    company: string
  ): Promise<string> => {
    const PROMPT = `
        Please create a name for this ad based on its content:
        - Headline: ${adCopy.headline}
        - Description: ${adCopy.description}
        - CTA: ${cta}
        - Company: ${company}

        - Output: 
         - names should be in this format: company_product_cta
         - wrap your output in tags <output></output>
    `;

    const result = await claude.messages.create({
      model: "claude-3-haiku-20240307",
      messages: [
        {
          role: "user",
          content: PROMPT,
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    });
    const content =
      result.content[0].type === "text" ? result.content[0].text : "";
    const [output] = extractTagContents(content, "output");
    if (!output) return "";
    if (typeof output !== "string") return "";
    return output;
  },
  generateAdCTA: async (adCopy: AdCopy) => {
    const PROMPT = `
        You are a marketing copywriter specializing in B2B advertising. Your task is to choose the most appropriate Call-To-Action (CTA) for a digital ad based on the provided information:

        1. Headline: ${adCopy.headline}
        2. Description: ${adCopy.description}

        OUTPUT RULES:
        - You must choose one of the following CTAs: ${Object.values(
          AdSchema.shape.ctaText.enum
        ).join(", ")}
        - You will return the above JSON object wrapped in XML tags <output></output>. Example: <output>Buy Now</output>
    `;

    const result = await claude.messages.create({
      model: "claude-3-sonnet-20240229",
      messages: [
        {
          role: "user",
          content: PROMPT,
        },
      ],
      max_tokens: 1000,
      temperature: 0,
    });

    const content =
      result.content[0].type === "text" ? result.content[0].text : "";
    const [output] = extractTagContents(content, "output");
    if (!output) return null;
    if (typeof output !== "string") return null;
    return output;
  },
  generateAdCopy: async (args: {
    companyName: string;
    productData: string;
    webPageContent: string;
    targeting: Targeting[];
  }) => {
    const PROMPT = `
    You are a marketing copywriter specializing in B2B advertising. Your task is to generate compelling ad copy for a digital ad campaign based on the provided company information.

    You will output will be in JSON format in the following shape:
    ${JSON.stringify(zodToCamelCasedJsonSchema(AdCopySchema))}

    You will return the above JSON object wrapped in XML tags <output></output>. Example: <output>{"headline": "Soda is good", "description": "You should buy soda"}</output>

    HEADLINE CREATION GUIDLINES:
    Follow these guidelines when creating the headline:
     - MAX 70 characters in length
     - Highlight key value proposition or pain point
     - Use action words and include company name if possible
     - Add numbers/stats for impact

    DESCRIPTION GUIDELINES:
    Follow these guidelines when creating the description:
      - max 200 chars in length
      - Expand on headline
      - List 2-3 key benefits
      - Include social proof or urgency (if avaliable/appropriate)
      - Soft call to action (if appropriate)

    To form your headline/description you will use the provided resources
    - COMPANY_NAME: ${args.companyName}
    - PRODUCT_DETAILS:
    ${yaml.stringify(args.productData)}
    - PRODUCT_WEB_PAGE_CONTENT
    ${args.webPageContent}
    - AD_TARGETING_GROUPS: ${args.targeting.map((t) => t.name).join(", ")}
    `;

    const result = await claude.messages.create({
      model: "claude-3-haiku-20240307",
      messages: [
        {
          role: "user",
          content: PROMPT,
        },
      ],
      max_tokens: 1000,
      temperature: 1,
    });

    const content =
      result.content[0].type === "text" ? result.content[0].text : "";

    const [output] = extractTagContents(content, "output");
    if (!output) return null;
    try {
      const data = JSON.parse(output);
      return data;
    } catch (e) {
      console.log("Error parsing JSON", e);
      return null;
    }
  },
  selectTargeting: async (content: string, numberOfSets = 10) => {
    async function processTargetingBatch(
      batch: Targeting[],
      content: string
    ): Promise<string[]> {
      const prompt = `
          Based on the following content, select the most relevant targeting groups:
          ${content}
      
          Available targeting groups:
          ${JSON.stringify(batch)}
      
          Return the URNs of the most relevant groups in JSON format:
          { "relevantGroups": ["urn1", "urn2", ...] }
        `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      try {
        const result = JSON.parse(
          response.choices[0]?.message?.content ?? "{}"
        );
        return result.relevantGroups;
      } catch (e) {
        console.log("Error parsing JSON", e);
        return [];
      }
    }
    const BATCH_SIZE = 150;
    const batches = [];
    for (let i = 0; i < allTargetingGroups.length; i += BATCH_SIZE) {
      batches.push(allTargetingGroups.slice(i, i + BATCH_SIZE));
    }

    const relevantUrns = new Set<string>();

    for (const batch of batches) {
      if (relevantUrns.size >= numberOfSets) {
        break;
      }
      const batchResults = await processTargetingBatch(batch, content);
      batchResults.forEach((urn) => relevantUrns.add(urn));
    }

    const targetedUrns = Array.from(relevantUrns).map(
      (urn) => targetingGroupsByUrn[urn]
    );

    return targetedUrns.slice(0, numberOfSets);
  },
};
