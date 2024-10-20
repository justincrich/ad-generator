import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { ANTHROPIC_API_KEY } from "../env";
import { OPEN_AI_API_KEY } from "../env";

export const openai = new OpenAI({
  apiKey: OPEN_AI_API_KEY,
});

export const claude = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});
