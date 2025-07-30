export const cleanAIJsonResponse = (rawText) => {
  return rawText
    .replace(/^```json\s*/i, "") // Remove ```json with optional whitespace
    .replace(/^```\s*/i, "") // Or just ```
    .replace(/\s*```$/, "") // Remove ending ```
    .trim(); // Trim whitespace
};
