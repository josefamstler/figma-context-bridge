export function printJson(value: unknown): void {
  print(`${JSON.stringify(value, null, 2)}\n`)
}

export function print(value: string): void {
  process.stdout.write(value)
}
