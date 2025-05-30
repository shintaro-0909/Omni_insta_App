// 3D spatial mathematics utilities for advanced navigation

export const mat4 = {
  create(): Float32Array {
    const out = new Float32Array(16)
    out[0] = 1
    out[5] = 1
    out[10] = 1
    out[15] = 1
    return out
  },

  identity(out: Float32Array): Float32Array {
    out[0] = 1
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = 1
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = 1
    out[11] = 0
    out[12] = 0
    out[13] = 0
    out[14] = 0
    out[15] = 1
    return out
  },

  translate(out: Float32Array, a: Float32Array, v: [number, number, number]): Float32Array {
    const x = v[0], y = v[1], z = v[2]
    
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]
    
    if (out !== a) {
      out[0] = a[0]
      out[1] = a[1]
      out[2] = a[2]
      out[3] = a[3]
      out[4] = a[4]
      out[5] = a[5]
      out[6] = a[6]
      out[7] = a[7]
      out[8] = a[8]
      out[9] = a[9]
      out[10] = a[10]
      out[11] = a[11]
    }
    
    return out
  },

  scale(out: Float32Array, a: Float32Array, v: [number, number, number]): Float32Array {
    const x = v[0], y = v[1], z = v[2]
    
    out[0] = a[0] * x
    out[1] = a[1] * x
    out[2] = a[2] * x
    out[3] = a[3] * x
    out[4] = a[4] * y
    out[5] = a[5] * y
    out[6] = a[6] * y
    out[7] = a[7] * y
    out[8] = a[8] * z
    out[9] = a[9] * z
    out[10] = a[10] * z
    out[11] = a[11] * z
    out[12] = a[12]
    out[13] = a[13]
    out[14] = a[14]
    out[15] = a[15]
    
    return out
  },

  rotateX(out: Float32Array, a: Float32Array, rad: number): Float32Array {
    const s = Math.sin(rad)
    const c = Math.cos(rad)
    const a10 = a[4]
    const a11 = a[5]
    const a12 = a[6]
    const a13 = a[7]
    const a20 = a[8]
    const a21 = a[9]
    const a22 = a[10]
    const a23 = a[11]
    
    if (a !== out) {
      out[0] = a[0]
      out[1] = a[1]
      out[2] = a[2]
      out[3] = a[3]
      out[12] = a[12]
      out[13] = a[13]
      out[14] = a[14]
      out[15] = a[15]
    }
    
    out[4] = a10 * c + a20 * s
    out[5] = a11 * c + a21 * s
    out[6] = a12 * c + a22 * s
    out[7] = a13 * c + a23 * s
    out[8] = a20 * c - a10 * s
    out[9] = a21 * c - a11 * s
    out[10] = a22 * c - a12 * s
    out[11] = a23 * c - a13 * s
    
    return out
  },

  rotateY(out: Float32Array, a: Float32Array, rad: number): Float32Array {
    const s = Math.sin(rad)
    const c = Math.cos(rad)
    const a00 = a[0]
    const a01 = a[1]
    const a02 = a[2]
    const a03 = a[3]
    const a20 = a[8]
    const a21 = a[9]
    const a22 = a[10]
    const a23 = a[11]
    
    if (a !== out) {
      out[4] = a[4]
      out[5] = a[5]
      out[6] = a[6]
      out[7] = a[7]
      out[12] = a[12]
      out[13] = a[13]
      out[14] = a[14]
      out[15] = a[15]
    }
    
    out[0] = a00 * c - a20 * s
    out[1] = a01 * c - a21 * s
    out[2] = a02 * c - a22 * s
    out[3] = a03 * c - a23 * s
    out[8] = a00 * s + a20 * c
    out[9] = a01 * s + a21 * c
    out[10] = a02 * s + a22 * c
    out[11] = a03 * s + a23 * c
    
    return out
  },

  rotateZ(out: Float32Array, a: Float32Array, rad: number): Float32Array {
    const s = Math.sin(rad)
    const c = Math.cos(rad)
    const a00 = a[0]
    const a01 = a[1]
    const a02 = a[2]
    const a03 = a[3]
    const a10 = a[4]
    const a11 = a[5]
    const a12 = a[6]
    const a13 = a[7]
    
    if (a !== out) {
      out[8] = a[8]
      out[9] = a[9]
      out[10] = a[10]
      out[11] = a[11]
      out[12] = a[12]
      out[13] = a[13]
      out[14] = a[14]
      out[15] = a[15]
    }
    
    out[0] = a00 * c + a10 * s
    out[1] = a01 * c + a11 * s
    out[2] = a02 * c + a12 * s
    out[3] = a03 * c + a13 * s
    out[4] = a10 * c - a00 * s
    out[5] = a11 * c - a01 * s
    out[6] = a12 * c - a02 * s
    out[7] = a13 * c - a03 * s
    
    return out
  },

  perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fovy / 2)
    const nf = 1 / (near - far)
    
    out[0] = f / aspect
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = (far + near) * nf
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[14] = 2 * far * near * nf
    out[15] = 0
    
    return out
  },

  multiply(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]
    
    let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3]
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
    
    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7]
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
    
    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11]
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
    
    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15]
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
    
    return out
  }
}

export const vec3 = {
  create(): Float32Array {
    return new Float32Array(3)
  },

  fromValues(x: number, y: number, z: number): Float32Array {
    const out = new Float32Array(3)
    out[0] = x
    out[1] = y
    out[2] = z
    return out
  },

  add(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
  },

  subtract(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
  },

  multiply(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    out[0] = a[0] * b[0]
    out[1] = a[1] * b[1]
    out[2] = a[2] * b[2]
    return out
  },

  scale(out: Float32Array, a: Float32Array, b: number): Float32Array {
    out[0] = a[0] * b
    out[1] = a[1] * b
    out[2] = a[2] * b
    return out
  },

  normalize(out: Float32Array, a: Float32Array): Float32Array {
    const x = a[0]
    const y = a[1]
    const z = a[2]
    let len = x * x + y * y + z * z
    
    if (len > 0) {
      len = 1 / Math.sqrt(len)
      out[0] = a[0] * len
      out[1] = a[1] * len
      out[2] = a[2] * len
    }
    
    return out
  },

  dot(a: Float32Array, b: Float32Array): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  },

  cross(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    const ax = a[0], ay = a[1], az = a[2]
    const bx = b[0], by = b[1], bz = b[2]
    
    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    
    return out
  },

  length(a: Float32Array): number {
    const x = a[0]
    const y = a[1]
    const z = a[2]
    return Math.sqrt(x * x + y * y + z * z)
  },

  distance(a: Float32Array, b: Float32Array): number {
    const x = b[0] - a[0]
    const y = b[1] - a[1]
    const z = b[2] - a[2]
    return Math.sqrt(x * x + y * y + z * z)
  },

  lerp(out: Float32Array, a: Float32Array, b: Float32Array, t: number): Float32Array {
    const ax = a[0]
    const ay = a[1]
    const az = a[2]
    
    out[0] = ax + t * (b[0] - ax)
    out[1] = ay + t * (b[1] - ay)
    out[2] = az + t * (b[2] - az)
    
    return out
  }
}

export const quat = {
  create(): Float32Array {
    const out = new Float32Array(4)
    out[3] = 1
    return out
  },

  setAxisAngle(out: Float32Array, axis: Float32Array, rad: number): Float32Array {
    rad = rad * 0.5
    const s = Math.sin(rad)
    
    out[0] = s * axis[0]
    out[1] = s * axis[1]
    out[2] = s * axis[2]
    out[3] = Math.cos(rad)
    
    return out
  },

  multiply(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
    const ax = a[0], ay = a[1], az = a[2], aw = a[3]
    const bx = b[0], by = b[1], bz = b[2], bw = b[3]
    
    out[0] = ax * bw + aw * bx + ay * bz - az * by
    out[1] = ay * bw + aw * by + az * bx - ax * bz
    out[2] = az * bw + aw * bz + ax * by - ay * bx
    out[3] = aw * bw - ax * bx - ay * by - az * bz
    
    return out
  },

  slerp(out: Float32Array, a: Float32Array, b: Float32Array, t: number): Float32Array {
    const ax = a[0], ay = a[1], az = a[2], aw = a[3]
    let bx = b[0], by = b[1], bz = b[2], bw = b[3]
    
    let omega, cosom, sinom, scale0, scale1
    
    cosom = ax * bx + ay * by + az * bz + aw * bw
    
    if (cosom < 0.0) {
      cosom = -cosom
      bx = -bx
      by = -by
      bz = -bz
      bw = -bw
    }
    
    if (1.0 - cosom > 0.000001) {
      omega = Math.acos(cosom)
      sinom = Math.sin(omega)
      scale0 = Math.sin((1.0 - t) * omega) / sinom
      scale1 = Math.sin(t * omega) / sinom
    } else {
      scale0 = 1.0 - t
      scale1 = t
    }
    
    out[0] = scale0 * ax + scale1 * bx
    out[1] = scale0 * ay + scale1 * by
    out[2] = scale0 * az + scale1 * bz
    out[3] = scale0 * aw + scale1 * bw
    
    return out
  }
}

// Utility functions for spatial calculations
export function bezierCurve3D(
  t: number,
  p0: Float32Array,
  p1: Float32Array,
  p2: Float32Array,
  p3: Float32Array
): Float32Array {
  const out = vec3.create()
  const t2 = t * t
  const t3 = t2 * t
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  
  out[0] = mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0]
  out[1] = mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1]
  out[2] = mt3 * p0[2] + 3 * mt2 * t * p1[2] + 3 * mt * t2 * p2[2] + t3 * p3[2]
  
  return out
}

export function smoothDamp(
  current: number,
  target: number,
  currentVelocity: { value: number },
  smoothTime: number,
  maxSpeed: number = Infinity,
  deltaTime: number
): { value: number; velocity: number } {
  smoothTime = Math.max(0.0001, smoothTime)
  const omega = 2 / smoothTime
  const x = omega * deltaTime
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
  
  let change = current - target
  const originalTo = target
  
  const maxChange = maxSpeed * smoothTime
  change = Math.max(-maxChange, Math.min(change, maxChange))
  target = current - change
  
  const temp = (currentVelocity.value + omega * change) * deltaTime
  currentVelocity.value = (currentVelocity.value - omega * temp) * exp
  
  let output = target + (change + temp) * exp
  
  if ((originalTo - current > 0) === (output > originalTo)) {
    output = originalTo
    currentVelocity.value = (output - originalTo) / deltaTime
  }
  
  return { value: output, velocity: currentVelocity.value }
}