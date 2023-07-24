import type {
  WebGLBufferOptions,
  WebGLBufferTarget,
  WebGLDrawOptions,
  WebGLFramebufferOptions,
  WebGLProgramOptions,
  WebGLTextureOptions,
  WebGLTextureTarget,
  WebGLTextureUnit,
  WebGLVertexArrayObjectOptions,
  WebGLVertexAttribOptions,
} from './WebGL'

import type { WebGLRenderer } from './WebGLRenderer'

let activeRenderer: WebGLRenderer | undefined
export function setCurrentRenderer(renderer: WebGLRenderer | undefined) {
  activeRenderer = renderer
}

export function getCurrentRenderer(): WebGLRenderer
export function getCurrentRenderer(orFail: false): WebGLRenderer | undefined
export function getCurrentRenderer(orFail = true): WebGLRenderer | undefined {
  if (orFail && !activeRenderer) throw new Error('failed to getCurrentRenderer, current WebGL Renderer not found')
  return activeRenderer
}

export function glCreateProgram(options?: WebGLProgramOptions): WebGLProgram {
  return activeRenderer!.createProgram(options)
}

export function glUpdateProgram(options: WebGLProgramOptions): void
export function glUpdateProgram(program: WebGLProgram, options: WebGLProgramOptions): void
export function glUpdateProgram(...args: any[]): void {
  (activeRenderer?.updateProgram as any)(...args)
}

export function glActiveProgram(program: WebGLProgram | null, then?: () => void | false): void {
  activeRenderer?.activeProgram(program, then)
}

export function glCreateFramebuffer(options?: WebGLFramebufferOptions): WebGLFramebuffer {
  return activeRenderer!.createFramebuffer(options)
}

export function glUpdateFramebuffer(options: WebGLFramebufferOptions): void
export function glUpdateFramebuffer(framebuffer: WebGLFramebuffer, options: WebGLFramebufferOptions): void
export function glUpdateFramebuffer(...args: any[]): void {
  (activeRenderer?.updateFramebuffer as any)(...args)
}

export function glActiveFramebuffer(framebuffer: WebGLFramebuffer | null, then?: () => void | false): void {
  activeRenderer?.activeFramebuffer(framebuffer, then)
}

export function glCreateTexture(options?: WebGLTextureOptions): WebGLTexture {
  return activeRenderer!.createTexture(options)
}

export function glUpdateTexture(options: WebGLTextureOptions): void
export function glUpdateTexture(texture: WebGLTexture, options: WebGLTextureOptions): void
export function glUpdateTexture(...args: any[]): void {
  (activeRenderer?.updateTexture as any)(...args)
}

export function glActiveTexture(
  texture: WebGLTexture | null | {
    unit?: WebGLTextureUnit
    target?: WebGLTextureTarget
    forceIndex?: boolean
    value: WebGLTexture | null
  },
  then?: (target: number) => void | false,
): void {
  activeRenderer?.activeTexture(texture, then)
}

export function glCreateBuffer(options?: WebGLBufferOptions): WebGLBuffer {
  return activeRenderer!.createBuffer(options)
}

export function glUpdateBuffer(options: WebGLBufferOptions): void
export function glUpdateBuffer(buffer: WebGLBuffer, options: WebGLBufferOptions): void
export function glUpdateBuffer(...args: any[]): void {
  (activeRenderer?.updateBuffer as any)(...args)
}

export function glActiveBuffer(
  buffer: WebGLBuffer | null | {
    target?: WebGLBufferTarget
    value: WebGLBuffer | null
  },
  then?: () => void | false,
): void {
  activeRenderer?.activeBuffer(buffer, then)
}

export function glActiveVertexAttrib(key: string, options: WebGLVertexAttribOptions, location = 0): void {
  activeRenderer?.activeVertexAttrib(key, options, location)
}

export function glCreateVertexArray(options?: WebGLVertexArrayObjectOptions): WebGLVertexArrayObject | null
export function glCreateVertexArray(program?: WebGLProgram, options?: WebGLVertexArrayObjectOptions): WebGLVertexArrayObject | null
export function glCreateVertexArray(...args: any[]): WebGLVertexArrayObject | null {
  return activeRenderer!.createVertexArray(...args)
}

export function glUpdateVertexArray(options: WebGLVertexArrayObjectOptions): void
export function glUpdateVertexArray(vertexArray: WebGLVertexArrayObject, options: WebGLVertexArrayObjectOptions): void
export function glUpdateVertexArray(program: WebGLProgram, vertexArray: WebGLVertexArrayObject, options: WebGLVertexArrayObjectOptions): void
export function glUpdateVertexArray(...args: any[]): void {
  (activeRenderer?.updateVertexArray as any)(...args)
}

export function glActiveVertexArray(
  vertexArray: WebGLVertexArrayObject | null | WebGLVertexArrayObjectOptions,
  then?: () => void | false,
): void {
  activeRenderer?.activeVertexArray(vertexArray, then)
}

export function glUpdateUniforms(program: WebGLProgram, uniforms: Record<string, any>): void
export function glUpdateUniforms(uniforms: Record<string, any>): void
export function glUpdateUniforms(...args: any[]): void {
  (activeRenderer?.updateUniforms as any)(...args)
}

export function glViewport(x?: number, y?: number, width?: number, height?: number): void {
  activeRenderer?.viewport(x, y, width, height)
}

export function glClear(mask?: number): void {
  activeRenderer?.clear(mask)
}

export function glDraw(propsData: WebGLDrawOptions = {}): void {
  activeRenderer?.draw(propsData)
}

export function glReset(): void {
  activeRenderer?.reset()
}

export function glResize(width: number, height: number, updateCss = true): void {
  activeRenderer?.resize(width, height, updateCss)
}

