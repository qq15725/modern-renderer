import type { WebGLVertexAttribOptions } from './WebGLVertexAttribOptions'

export interface WebGLVertexArrayObjectMetadata {
  /**
   * Vertex attributes
   */
  attributes: Record<string, WebGLVertexAttribOptions>

  /**
   * Index buffer
   */
  elementArrayBuffer: WebGLBuffer | null
}
