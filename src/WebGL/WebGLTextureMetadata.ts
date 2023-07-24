import type { WebGLTextureFilterMode } from './WebGLTextureFilterMode'
import type { WebGLTextureTarget } from './WebGLTextureTarget'
import type { WebGLTextureUnit } from './WebGLTextureUnit'
import type { WebGLTextureWrapMode } from './WebGLTextureWrapMode'

export interface WebGLTextureMetadata {
  /**
   * Bound point (target)
   */
  target?: WebGLTextureTarget

  /**
   * Bound unit
   */
  unit?: WebGLTextureUnit

  /**
   * Width
   */
  width?: number

  /**
   * Height
   */
  height?: number

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
