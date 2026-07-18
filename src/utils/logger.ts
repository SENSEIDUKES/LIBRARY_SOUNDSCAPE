/**
 * Logger Utility
 *
 * This module provides standardized logging functions to meet the application's
 * tracking and debugging requirements. It logs function calls with their parameters
 * and GenAI calls with their specific configurations, ensuring that large inline
 * data (like base64 strings) is stripped to prevent console spam.
 *
 * Use Cases:
 * - Tracing execution flow through the application.
 * - Debugging GenAI prompts, models, and configurations.
 * - Auditing function inputs and outputs.
 */

/**
 * Strips large inline data from objects for cleaner logging.
 * @param obj The object to sanitize.
 * @returns A sanitized copy of the object.
 */
const stripInlineData = (obj: any): any => {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripInlineData);

  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (key === 'inlineData' && sanitized[key]?.data) {
      sanitized[key] = { ...sanitized[key], data: '[STRIPPED_BASE64_DATA]' };
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = stripInlineData(sanitized[key]);
    }
  }
  return sanitized;
};

/**
 * Logs a standard function call with its parameters.
 * @param functionName The name of the function being called.
 * @param params An object containing the parameters passed to the function.
 */
export const logFunctionCall = (functionName: string, params: Record<string, any> = {}) => {
  console.info(`[CALL] ${functionName}`, stripInlineData(params));
};

/**
 * Logs a GenAI API call with its configuration and output.
 * @param model The model identifier used for the call.
 * @param prompt The prompt or contents sent to the model.
 * @param config Any additional configuration (e.g., temperature, tools).
 * @param output The output received from the model.
 */
export const logGenAiCall = (model: string, prompt: any, config: any, output: any) => {
  console.info(`[GENAI] Call to ${model}`, {
    prompt: stripInlineData(prompt),
    config: stripInlineData(config),
    output: stripInlineData(output)
  });
};
