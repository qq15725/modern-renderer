import type { WebGLTextureSource } from './WebGLTextureSource'
import type { WebGLTextureTarget } from './WebGLTextureTarget'
import type { WebGLTextureUnit } from './WebGLTextureUnit'
import type { WebGLTextureFilterMode } from './WebGLTextureFilterMode'
import type { WebGLTextureWrapMode } from './WebGLTextureWrapMode'

export interface WebGLTextureOptions {
  /**
   * Bound source
   */
  source: WebGLTextureSource

  /**
   * Bound point (target)
   */
  target?: WebGLTextureTarget

  /**
   * Bound unit
   */
  unit?: WebGLTextureUnit

  /**
   * Filtering mode of the Texture.
   */
  filterMode?: WebGLTextureFilterMode

  /**
   * Texture coordinate wrapping mode.
   */
  wrapMode?: WebGLTextureWrapMode

  /**
   * Defines the anisotropic filtering level of the Texture.
   */
  anisoLevel?: number
}
