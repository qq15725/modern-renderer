import type { WebGLDrawMode } from './WebGLDrawMode'

export interface WebGLDrawOptions {
  mode?: WebGLDrawMode
  count?: number
  first?: number
  bytesPerElement?: number
  instanceCount?: number
}
