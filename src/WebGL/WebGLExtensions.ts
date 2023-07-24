export interface WebGLExtensions {
  // WebGL and WebGL 2
  loseContext?: WEBGL_lose_context | null
  anisotropicFiltering?: EXT_texture_filter_anisotropic | null
  floatTextureLinear?: OES_texture_float_linear | null
  s3tc?: WEBGL_compressed_texture_s3tc | null
  s3tcSRGB?: WEBGL_compressed_texture_s3tc_srgb | null
  etc?: WEBGL_compressed_texture_etc | null
  etc1?: WEBGL_compressed_texture_etc1 | null
  pvrtc?: any | null
  atc?: any | null
  astc?: WEBGL_compressed_texture_astc | null

  // WebGL
  instancedArrays?: ANGLE_instanced_arrays | null
  drawBuffers?: WEBGL_draw_buffers | null
  depthTexture?: WEBGL_depth_texture | null
  vertexArrayObject?: OES_vertex_array_object | null
  uint32ElementIndex?: OES_element_index_uint | null
  floatTexture?: OES_texture_float | null
  textureHalfFloat?: OES_texture_half_float | null
  textureHalfFloatLinear?: OES_texture_half_float_linear | null

  // WebGL 2
  colorBufferFloat?: EXT_color_buffer_float | null
}
