import type { WebGLBufferTarget } from './WebGLBufferTarget'
import type { WebGLBufferUsage } from './WebGLBufferUsage'

export interface WebGLBufferOptions {
  /**
   * Bound point (target)
   */
  target?: WebGLBufferTarget

  /**
   * Usage type
   */
  usage?: WebGLBufferUsage

  /**
   * Bound data
   */
  data: BufferSource | Array<number> | null
}
