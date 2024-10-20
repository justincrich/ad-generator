import { z } from "zod";
import zodToJsonSchema, { JsonSchema7Type } from "zod-to-json-schema";
import camelcaseKeys from "camelcase-keys";

export const TargetingSchema = z.object({
  name: z.string(),
  urn: z.string(),
});

export type Targeting = z.infer<typeof TargetingSchema>;

export const WebPageInsightsSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  productsServices: z.array(z.string()),
  valuePropositions: z.array(z.string()),
  targetAudience: z.string(),
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

export type AdCopy = z.infer<typeof AdCopySchema>;

export function zodToCamelCasedJsonSchema(
  schema: z.ZodType,
  options?: Parameters<typeof zodToJsonSchema>[1]
): JsonSchema7Type {
  const jsonSchema = zodToJsonSchema(schema, options);
  return camelcaseKeys(jsonSchema, { deep: true }) as JsonSchema7Type;
}
