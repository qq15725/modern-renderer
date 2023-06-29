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

let currentWebGLRenderer: WebGLRenderer | undefined

export function setCurrentWebGLRenderer(renderer: WebGLRenderer | undefined) {
  currentWebGLRenderer = renderer
}

export function getCurrentWebGLRenderer(): WebGLRenderer
export function getCurrentWebGLRenderer(orFail: false): WebGLRenderer | undefined
export function getCurrentWebGLRenderer(orFail = true): WebGLRenderer | undefined {
  if (orFail && !currentWebGLRenderer) throw new Error('failed to getCurrentWebGLRenderer, current WebGL Renderer not found')
  return currentWebGLRenderer
}

// Short alias
export const setCurrentGLR = setCurrentWebGLRenderer
export const getCurrentGLR = getCurrentWebGLRenderer

export function glCreateProgram(propsData?: WebGLProgramPropsData): WebGLProgram {
  return getCurrentGLR().createProgram(propsData)
}

export function glUpdateProgram(propsData: WebGLProgramPropsData): void
export function glUpdateProgram(program: WebGLProgram, propsData: WebGLProgramPropsData): void
export function glUpdateProgram(...args: any[]): void {
  return (getCurrentGLR().updateProgram as any)(...args)
}

export function glActiveProgram(program: WebGLProgram | null, then?: () => void | false): void {
  return getCurrentGLR().activeProgram(program, then)
}

export function glCreateFramebuffer(propsData?: WebGLFramebufferPropsData): WebGLFramebuffer {
  return getCurrentGLR().createFramebuffer(propsData)
}

export function glUpdateFramebuffer(propsData: WebGLFramebufferPropsData): void
export function glUpdateFramebuffer(framebuffer: WebGLFramebuffer, propsData: WebGLFramebufferPropsData): void
export function glUpdateFramebuffer(...args: any[]): void {
  return (getCurrentGLR().updateFramebuffer as any)(...args)
}

export function glActiveFramebuffer(framebuffer: WebGLFramebuffer | null, then?: () => void | false): void {
  return getCurrentGLR().activeFramebuffer(framebuffer, then)
}

export function glCreateTexture(propsData?: WebGLTexturePropsData): WebGLTexture {
  return getCurrentGLR().createTexture(propsData)
}

export function glUpdateTexture(propsData: WebGLTexturePropsData): void
export function glUpdateTexture(texture: WebGLTexture, propsData: WebGLTexturePropsData): void
export function glUpdateTexture(...args: any[]): void {
  return (getCurrentGLR().updateTexture as any)(...args)
}

export function glActiveTexture(
  texture: WebGLTexture | null | {
    index?: WebGLTextureIndex
    target?: WebGLTextureTarget
    value: WebGLTexture | null
  },
  then?: (target: number) => void | false,
): void {
  return getCurrentGLR().activeTexture(texture, then)
}

export function glCreateBuffer(propsData?: WebGLBufferPropsData): WebGLBuffer {
  return getCurrentGLR().createBuffer(propsData)
}

export function glUpdateBuffer(propsData: WebGLBufferPropsData): void
export function glUpdateBuffer(buffer: WebGLBuffer, propsData: WebGLBufferPropsData): void
export function glUpdateBuffer(...args: any[]): void {
  return (getCurrentGLR().updateBuffer as any)(...args)
}

export function glActiveBuffer(
  buffer: WebGLBuffer | null | {
    target?: WebGLBufferTarget
    value: WebGLBuffer | null
  },
  then?: () => void | false,
): void {
  return getCurrentGLR().activeBuffer(buffer, then)
}

export function glActiveVertexAttrib(props: WebGLVertexAttribProps, location = 0): void {
  return getCurrentGLR().activeVertexAttrib(props, location)
}

export function glCreateVertexArray(propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
export function glCreateVertexArray(program?: WebGLProgram, propsData?: WebGLVertexArrayPropsData): WebGLVertexArrayObject | null
export function glCreateVertexArray(...args: any[]): WebGLVertexArrayObject | null {
  return getCurrentGLR().createVertexArray(...args)
}

export function glUpdateVertexArray(propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(program: WebGLProgram, vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(...args: any[]): void {
  return (getCurrentGLR().updateVertexArray as any)(...args)
}

export function glActiveVertexArray(
  vertexArray: WebGLVertexArrayObject | null | Partial<WebGLVertexArrayProps>,
  then?: () => void | false,
): void {
  return getCurrentGLR().activeVertexArray(vertexArray, then)
}

export function glUpdateUniforms(program: WebGLProgram, uniforms: Record<string, any>): void
export function glUpdateUniforms(uniforms: Record<string, any>): void
export function glUpdateUniforms(...args: any[]): void {
  return (getCurrentGLR().updateUniforms as any)(...args)
}

export function glViewport(x?: number, y?: number, width?: number, height?: number) {
  return getCurrentGLR().viewport(x, y, width, height)
}

export function glClear(r?: number, g?: number, b?: number, a?: number, mask?: number) {
  return getCurrentGLR().clear(r, g, b, a, mask)
}

export function glDraw(propsData: Partial<WebGLDrawProps> = {}) {
  return getCurrentGLR().draw(propsData)
}

