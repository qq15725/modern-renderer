export type WebGLTextureSource =
  | TexImageSource
  | null
  | {
    width: number
    height: number
    pixels: ArrayBufferView | null
  }
