import type { WebGLBufferTarget } from './WebGLBufferTarget'
import type { WebGLBufferUsage } from './WebGLBufferUsage'

export interface WebGLBufferMetadata {
  /**
   * UID
   */
  id: number

  /**
   * Bound point (target)
   */
  target?: WebGLBufferTarget

  /**
   * Usage type
   */
  usage?: WebGLBufferUsage

  /**
   * Bound data length
   */
  length: number

  /**
   * Bound data byte length
   */
  byteLength: number

  /**
   * Bound data bytes per element
   */
  bytesPerElement: number
}
