import type {
  WebGLBufferPropsData,
  WebGLBufferTarget,
  WebGLDrawProps,
  WebGLFramebufferPropsData,
  WebGLProgramPropsData,
  WebGLRenderer,
  WebGLTextureIndex,
  WebGLTexturePropsData,
  WebGLTextureTarget,
  WebGLVertexArrayProps,
  WebGLVertexArrayPropsData,
  WebGLVertexAttribProps,
} from './WebGLRenderer'

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

export function glCreateProgram(propsData?: WebGLProgramPropsData): WebGLProgram {
  return activeRenderer!.createProgram(propsData)
}

export function glUpdateProgram(propsData: WebGLProgramPropsData): void
export function glUpdateProgram(program: WebGLProgram, propsData: WebGLProgramPropsData): void
export function glUpdateProgram(...args: any[]): void {
  (activeRenderer?.updateProgram as any)(...args)
}

export function glActiveProgram(program: WebGLProgram | null, then?: () => void | false): void {
  activeRenderer?.activeProgram(program, then)
}

export function glCreateFramebuffer(propsData?: WebGLFramebufferPropsData): WebGLFramebuffer {
  return activeRenderer!.createFramebuffer(propsData)
}

export function glUpdateFramebuffer(propsData: WebGLFramebufferPropsData): void
export function glUpdateFramebuffer(framebuffer: WebGLFramebuffer, propsData: WebGLFramebufferPropsData): void
export function glUpdateFramebuffer(...args: any[]): void {
  (activeRenderer?.updateFramebuffer as any)(...args)
}

export function glActiveFramebuffer(framebuffer: WebGLFramebuffer | null, then?: () => void | false): void {
  activeRenderer?.activeFramebuffer(framebuffer, then)
}

export function glCreateTexture(propsData?: WebGLTexturePropsData): WebGLTexture {
  return activeRenderer!.createTexture(propsData)
}

export function glUpdateTexture(propsData: WebGLTexturePropsData): void
export function glUpdateTexture(texture: WebGLTexture, propsData: WebGLTexturePropsData): void
export function glUpdateTexture(...args: any[]): void {
  (activeRenderer?.updateTexture as any)(...args)
}

export function glActiveTexture(
  texture: WebGLTexture | null | {
    index?: WebGLTextureIndex
    target?: WebGLTextureTarget
    value: WebGLTexture | null
  },
  then?: (target: number) => void | false,
): void {
  activeRenderer?.activeTexture(texture, then)
}

export function glCreateBuffer(propsData?: WebGLBufferPropsData): WebGLBuffer {
  return activeRenderer!.createBuffer(propsData)
}

export function glUpdateBuffer(propsData: WebGLBufferPropsData): void
export function glUpdateBuffer(buffer: WebGLBuffer, propsData: WebGLBufferPropsData): void
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

export function glActiveVertexAttrib(key: string, props: WebGLVertexAttribProps, location = 0): void {
  activeRenderer?.activeVertexAttrib(key, props, location)
}

export function glCreateVertexArray(propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
export function glCreateVertexArray(program?: WebGLProgram, propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
export function glCreateVertexArray(...args: any[]): WebGLVertexArrayObject | null {
  return activeRenderer!.createVertexArray(...args)
}

export function glUpdateVertexArray(propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(program: WebGLProgram, vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(...args: any[]): void {
  (activeRenderer?.updateVertexArray as any)(...args)
}

export function glActiveVertexArray(
  vertexArray: WebGLVertexArrayObject | null | Partial<WebGLVertexArrayProps>,
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

export function glDraw(propsData: Partial<WebGLDrawProps> = {}): void {
  activeRenderer?.draw(propsData)
}

export function glReset(): void {
  activeRenderer?.reset()
}

export function glResize(width: number, height: number, updateCss = true): void {
  activeRenderer?.resize(width, height, updateCss)
}

