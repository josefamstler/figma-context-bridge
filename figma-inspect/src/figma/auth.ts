export function getFigmaToken(): string {
  const token = process.env.FIGMA_TOKEN ?? process.env.FIGMA_API_KEY
  if (!token) {
    throw new Error("FIGMA_TOKEN is required. Add it to ~/.config/figma-inspect/env first.")
  }
  return token
}
