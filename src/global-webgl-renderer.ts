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

let currentWebGLRenderer: WebGLRenderer

export function setCurrentWebGLRenderer(renderer: WebGLRenderer) {
  currentWebGLRenderer = renderer
}

export function getCurrentWebGLRenderer(): WebGLRenderer {
  if (!currentWebGLRenderer) throw new Error('failed to getCurrentWebGLRenderer')
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
  return getCurrentGLR().updateProgram(args[0], args[1])
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
  return getCurrentGLR().updateFramebuffer(args[0], args[1])
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
  return getCurrentGLR().updateTexture(args[0], args[1])
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
  return getCurrentGLR().updateBuffer(args[0], args[1])
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

export function glCreateVertexArray(
  propsData?: WebGLVertexArrayPropsData,
  program?: WebGLProgram,
): WebGLVertexArrayObject | null {
  return getCurrentGLR().createVertexArray(propsData, program)
}

export function glUpdateVertexArray(propsData: WebGLVertexArrayPropsData): void
export function glUpdateVertexArray(vertexArray: WebGLVertexArrayObject, propsData: WebGLVertexArrayPropsData, program?: WebGLProgram): void
export function glUpdateVertexArray(...args: any[]): void {
  return getCurrentGLR().updateVertexArray(args[0], args[1], args[2])
}

export function glActiveVertexArray(
  vertexArray: WebGLVertexArrayObject | null | Partial<WebGLVertexArrayProps>,
  then?: () => void | false,
): void {
  return getCurrentGLR().activeVertexArray(vertexArray, then)
}

export function glUpdateUniforms(uniforms: Record<string, any>): void {
  return getCurrentGLR().updateUniforms(uniforms)
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

