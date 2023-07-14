export const IN_BROWSER = typeof window !== 'undefined'
export const DEVICE_PIXEL_RATIO = IN_BROWSER ? window.devicePixelRatio || 1 : 1
export const SUPPORT_WEBGL2 = 'WebGL2RenderingContext' in globalThis

export const isCanvasElement = (node: unknown): node is HTMLCanvasElement => node !== null
  && typeof node === 'object'
  && (node as any).nodeType === 1
  && (node as any).tagName === 'CANVAS'

export const isWebgl2 = (gl: unknown): gl is WebGL2RenderingContext => SUPPORT_WEBGL2
  && gl instanceof globalThis.WebGL2RenderingContext

export function createHTMLCanvas(): HTMLCanvasElement | undefined {
  if (IN_BROWSER) {
    return globalThis.document.createElement('canvas')
  }
  return undefined
}

export function getVarTypeSize(type: string): number {
  switch (type) {
    case 'float':
    case 'int':
    case 'unsigned_int':
    case 'bool':
    case 'sampler_2d':
      return 1
    case 'float_vec2':
    case 'int_vec2':
    case 'unsigned_int_vec2':
    case 'bool_vec2':
      return 2
    case 'float_vec3':
    case 'int_vec3':
    case 'unsigned_int_vec3':
    case 'bool_vec3':
      return 3
    case 'float_vec4':
    case 'int_vec4':
    case 'unsigned_int_vec4':
    case 'bool_vec4':
    case 'float_mat2':
      return 4
    case 'float_mat3':
      return 9
    case 'float_mat4':
      return 16
    default:
      return 1
  }
}

/**
 * Set meta data for debug
 *
 * @param object
 * @param data
 */
export function setMetadata(object: object, data: Record<string, any>) {
  // https://github.com/BabylonJS/Spector.js/#custom-data
  (object as any).__SPECTOR_Metadata = data
}
