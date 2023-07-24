import type { WebGLVertexAttribOptions } from './WebGLVertexAttribOptions'

export interface WebGLVertexArrayObjectOptions {
  /**
   * Vertex attributes
   */
  attributes?: Record<string, WebGLBuffer | WebGLVertexAttribOptions>

  /**
   * Index buffer
   */
  elementArrayBuffer?: WebGLBuffer | null
}
