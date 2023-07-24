export interface WebGLFramebufferOptions {
  /**
   * Color attachment
   */
  colorTextures?: (WebGLTexture | null)[]

  /**
   * Depth attachment
   */
  depthTexture?: WebGLTexture | null

  /**
   * Stencil attachment
   */
  stencilTexture?: WebGLTexture | null

  /**
   * Mip level
   */
  mipLevel?: number
}
