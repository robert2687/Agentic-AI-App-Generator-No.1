export interface Provider {
  readonly name: string;
  call(prompt: string, onChunk: (chunk: string) => void): Promise<string>;
}
