export async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Image download failed ${response.status}: ${body}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
