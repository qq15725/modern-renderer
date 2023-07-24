import type { WebGLTarget } from './WebGLTarget'

export interface WebGLProgramMetadata {
  /**
   * Attributes metadata
   */
  attributes: Map<string, {
    type: WebGLTarget
    size: number
    name: string
    location: number
  }>

  /**
   * Uniforms metadata
   */
  uniforms: Map<string, {
    index: number
    type: WebGLTarget
    size: number
    isArray: boolean
    name: string
    location: WebGLUniformLocation | null
  }>

  /**
   * Bound uniforms
   */
  boundUniforms: WeakMap<object, any>
}
