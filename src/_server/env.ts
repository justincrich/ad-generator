export const loadEnvVar = (key: string): string | never => {
  const value = process.env[key];
  if (!value) {
    console.log(`[ENV]: variable ${key} not loaded`);
    return "";
  }
  return value;
};

export const OPEN_AI_API_KEY = loadEnvVar("OPEN_AI_API_KEY");
export const ANTHROPIC_API_KEY = loadEnvVar("ANTHROPIC_API_KEY");
