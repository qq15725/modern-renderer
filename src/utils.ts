export const IN_BROWSER = typeof window !== 'undefined'
export const DEVICE_PIXEL_RATIO = IN_BROWSER ? window.devicePixelRatio || 1 : 1

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
