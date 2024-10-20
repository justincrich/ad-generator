import revenueData from "./revenue.json";
import verticalsData from "./verticals.json";
import jobTitlesData from "./jobTitles.json";
import { Targeting } from "@/lib/schema";

export enum TargetingType {
  Revenue = "revenue",
  Industry = "industry",
  JobTitle = "jobTitle",
}

export const allTargetingGroups: Targeting[] = [
  ...verticalsData.entityRes.data.elements.map((e) => ({
    ...e,
    category: TargetingType.Industry,
  })),
  ...revenueData.entityRes.data.elements.map((e) => ({
    ...e,
    category: TargetingType.Revenue,
  })),
  ...jobTitlesData.entityRes.data.elements.map((e) => ({
    ...e,
    category: TargetingType.JobTitle,
  })),
];

export const targetingGroupsByUrn: Record<string, Targeting> =
  allTargetingGroups.reduce<Record<string, Targeting>>((acc, group) => {
    acc[group.urn] = group;
    return acc;
  }, {});
