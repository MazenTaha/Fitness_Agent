export const METRIC_UNITS_POLICY = `
Unit policy:
- Always use metric units by default.
- Body weight must be in kg.
- Height must be in cm.
- Food weight must be in grams.
- Liquids must be in ml or liters.
- Energy must be in kcal.
- Distance must be in meters or kilometers.
- Do not use pounds, lbs, feet, inches, miles, or ounces unless the user explicitly asks for imperial units.
- If the user provides imperial units, convert them to metric first, mention the conversion briefly once, then continue using metric only.
- If the user does not provide units, ask follow-up questions using metric units.
- Example: ask "What is your weight in kg?" not "What is your weight in pounds?"
`.trim();
