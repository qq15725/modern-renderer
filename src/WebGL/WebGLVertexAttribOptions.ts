export type WebGLVertexAttribType =
  | 'float'
  | 'unsigned_byte'
  | 'unsigned_short'

export interface WebGLVertexAttribOptions {
  buffer: WebGLBuffer

  /**
   * Enable
   */
  enable?: boolean

  /**
   * Data length
   */
  size?: number

  /**
   * Data type
   */
  type?: WebGLVertexAttribType

  /**
   * Normalized
   */
  normalized?: boolean

  stride?: number
  offset?: number
  divisor?: number
}
