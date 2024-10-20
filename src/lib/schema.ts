import { z } from "zod";
import yaml from "yaml";
import zodToJsonSchema, { JsonSchema7Type } from "zod-to-json-schema";
import camelcaseKeys from "camelcase-keys";

export const TargetingSchema = z.object({
  name: z.string(),
  urn: z.string(),
  category: z.string(),
});

export type Targeting = z.infer<typeof TargetingSchema>;

export const WebPageInsightsSchema = z.object({
  companyName: z
    .string()
    .describe("Company Name: The name of the company. (e.g., “Acme Inc.”)"),
  industry: z
    .string()
    .describe(
      "Industry: The industry the company operates in (e.g., “Technology”)"
    ),
  productsServices: z
    .array(z.string())
    .describe(
      "The products or services offered by the company, extracted from the webpage content (e.g., “Software Development”, “Web Design”)"
    ),
  valuePropositions: z
    .array(z.string())
    .describe(
      "The company’s value propositions based on the content (e.g., “Increase sales”, “Improve customer satisfaction”)"
    ),
  targetAudience: z
    .string()
    .describe(
      "The target audience for the products/services (e.g., “Small Businesses”, “Startups”)"
    ),
});

export type WebPageInsights = z.infer<typeof WebPageInsightsSchema>;

export const TargetingRecommendationsSchema = z.object({
  revenueRanges: z.array(TargetingSchema).min(1).max(3),
  industries: z.array(TargetingSchema).min(3).max(5),
  jobTitles: z.array(TargetingSchema).min(5).max(10),
});

export type TargetingRecommendations = z.infer<
  typeof TargetingRecommendationsSchema
>;

export const AdCopySchema = z.object({
  headline: z.string().max(70),
  description: z.string().max(200),
});
export type AdCopy = z.infer<typeof AdCopySchema>;

export const AdSchema = z.object({
  adName: z.string().max(255),
  headline: z.string().max(70),
  description: z.string().max(200),
  destinationUrl: z.string().url(),
  ctaText: z.enum([
    "Apply",
    "Download",
    "View Quote",
    "Learn More",
    "Sign Up",
    "Subscribe",
    "Register",
    "Join",
    "Attend",
    "Request Demo",
  ]),
});

export type Ad = z.infer<typeof AdSchema>;

export function zodToCamelCasedJsonSchema(
  schema: z.ZodType,
  options?: Parameters<typeof zodToJsonSchema>[1]
): JsonSchema7Type {
  const jsonSchema = zodToJsonSchema(schema, options);
  return camelcaseKeys(jsonSchema, { deep: true }) as JsonSchema7Type;
}

export function schemaToYamlDescription(
  schema: z.ZodObject<z.ZodRawShape>
): string {
  const output: Record<string, unknown> = {};
  const shape = schema.shape;

  for (const [key, value] of Object.entries(shape)) {
    const description = (value as z.ZodTypeAny)._def.description;
    if (description) {
      output[key] = description;
    }
  }

  return yaml.stringify(output);
}
