/**
 * 統合インタラクションシステム
 * 
 * ジェスチャー認識、空間数学、インタラクション制御を統合した
 * 包括的なインタラクションエンジン
 * 
 * 重要度: HIGH - システム全体のユーザーインタラクション基盤
 * 
 * 統合対象:
 * - interactionEngine.ts - インタラクション制御・オーケストレーション
 * - gestureRecognition.ts - ジェスチャー認識・入力処理
 * - spatialMath.ts - 3D空間数学・計算ユーティリティ
 */

// ===== 型定義 =====

export type GestureType = 
  | 'tap' | 'doubletap' | 'longpress'
  | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down'
  | 'pinch-in' | 'pinch-out' | 'rotate'
  | 'drag' | 'flick' | 'pan'
  | 'edge-swipe' | 'multi-finger-tap'

export interface GestureEvent {
  type: GestureType
  timestamp: number
  deltaX: number
  deltaY: number
  deltaZ?: number
  velocity: { x: number; y: number }
  distance: number
  angle: number
  scale: number
  rotation: number
  touches: Array<{ x: number; y: number; id: number }>
  progress: number
}

export interface InteractionEngineOptions {
  enableSpatialNavigation?: boolean
  enablePredictiveUI?: boolean
  enableAdaptiveLayout?: boolean
  enableIntelligentAnimations?: boolean
  enableAIAdaptation?: boolean
  enableHapticFeedback?: boolean
  enableCrossSystemLearning?: boolean
  enableMultiTouch?: boolean
  debugMode?: boolean
}

export interface SpatialTransform {
  position: Float32Array
  rotation: Float32Array
  scale: Float32Array
  matrix: Float32Array
}

// ===== 空間数学ユーティリティ =====

export class SpatialMath {
  // 4x4 Matrix operations
  static readonly mat4 = {
    create(): Float32Array {
      const out = new Float32Array(16)
      out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1
      return out
    },

    identity(out: Float32Array): Float32Array {
      out.fill(0)
      out[0] = out[5] = out[10] = out[15] = 1
      return out
    },

    translate(out: Float32Array, a: Float32Array, v: [number, number, number]): Float32Array {
      const [x, y, z] = v
      
      out[12] = (a[0] ?? 0) * x + (a[4] ?? 0) * y + (a[8] ?? 0) * z + (a[12] ?? 0)
      out[13] = (a[1] ?? 0) * x + (a[5] ?? 0) * y + (a[9] ?? 0) * z + (a[13] ?? 0)
      out[14] = (a[2] ?? 0) * x + (a[6] ?? 0) * y + (a[10] ?? 0) * z + (a[14] ?? 0)
      out[15] = (a[3] ?? 0) * x + (a[7] ?? 0) * y + (a[11] ?? 0) * z + (a[15] ?? 0)
      
      if (out !== a) {
        for (let i = 0; i < 12; i++) out[i] = a[i] ?? 0
      }
      
      return out
    },

    scale(out: Float32Array, a: Float32Array, v: [number, number, number]): Float32Array {
      const [x, y, z] = v
      
      out[0] = (a[0] ?? 0) * x; out[1] = (a[1] ?? 0) * x; out[2] = (a[2] ?? 0) * x; out[3] = (a[3] ?? 0) * x
      out[4] = (a[4] ?? 0) * y; out[5] = (a[5] ?? 0) * y; out[6] = (a[6] ?? 0) * y; out[7] = (a[7] ?? 0) * y
      out[8] = (a[8] ?? 0) * z; out[9] = (a[9] ?? 0) * z; out[10] = (a[10] ?? 0) * z; out[11] = (a[11] ?? 0) * z
      out[12] = a[12] ?? 0; out[13] = a[13] ?? 0; out[14] = a[14] ?? 0; out[15] = a[15] ?? 0
      
      return out
    },

    rotateX(out: Float32Array, a: Float32Array, rad: number): Float32Array {
      const s = Math.sin(rad), c = Math.cos(rad)
      const a10 = a[4] ?? 0, a11 = a[5] ?? 0, a12 = a[6] ?? 0, a13 = a[7] ?? 0
      const a20 = a[8] ?? 0, a21 = a[9] ?? 0, a22 = a[10] ?? 0, a23 = a[11] ?? 0
      
      if (a !== out) {
        out[0] = a[0] ?? 0; out[1] = a[1] ?? 0; out[2] = a[2] ?? 0; out[3] = a[3] ?? 0
        out[12] = a[12] ?? 0; out[13] = a[13] ?? 0; out[14] = a[14] ?? 0; out[15] = a[15] ?? 0
      }
      
      out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s
      out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s
      out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s
      out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s
      
      return out
    },

    rotateY(out: Float32Array, a: Float32Array, rad: number): Float32Array {
      const s = Math.sin(rad), c = Math.cos(rad)
      const a00 = a[0] ?? 0, a01 = a[1] ?? 0, a02 = a[2] ?? 0, a03 = a[3] ?? 0
      const a20 = a[8] ?? 0, a21 = a[9] ?? 0, a22 = a[10] ?? 0, a23 = a[11] ?? 0
      
      if (a !== out) {
        out[4] = a[4] ?? 0; out[5] = a[5] ?? 0; out[6] = a[6] ?? 0; out[7] = a[7] ?? 0
        out[12] = a[12] ?? 0; out[13] = a[13] ?? 0; out[14] = a[14] ?? 0; out[15] = a[15] ?? 0
      }
      
      out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s
      out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s
      out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c
      out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c
      
      return out
    },

    rotateZ(out: Float32Array, a: Float32Array, rad: number): Float32Array {
      const s = Math.sin(rad), c = Math.cos(rad)
      const a00 = a[0] ?? 0, a01 = a[1] ?? 0, a02 = a[2] ?? 0, a03 = a[3] ?? 0
      const a10 = a[4] ?? 0, a11 = a[5] ?? 0, a12 = a[6] ?? 0, a13 = a[7] ?? 0
      
      if (a !== out) {
        out[8] = a[8] ?? 0; out[9] = a[9] ?? 0; out[10] = a[10] ?? 0; out[11] = a[11] ?? 0
        out[12] = a[12] ?? 0; out[13] = a[13] ?? 0; out[14] = a[14] ?? 0; out[15] = a[15] ?? 0
      }
      
      out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s
      out[2] = a02 * c + a12 * s; out[3] = a03 * c + a13 * s
      out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s
      out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s
      
      return out
    },

    multiply(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
      const a00 = a[0] ?? 0, a01 = a[1] ?? 0, a02 = a[2] ?? 0, a03 = a[3] ?? 0
      const a10 = a[4] ?? 0, a11 = a[5] ?? 0, a12 = a[6] ?? 0, a13 = a[7] ?? 0
      const a20 = a[8] ?? 0, a21 = a[9] ?? 0, a22 = a[10] ?? 0, a23 = a[11] ?? 0
      const a30 = a[12] ?? 0, a31 = a[13] ?? 0, a32 = a[14] ?? 0, a33 = a[15] ?? 0
      
      let b0 = b[0] ?? 0, b1 = b[1] ?? 0, b2 = b[2] ?? 0, b3 = b[3] ?? 0
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
      
      b0 = b[4] ?? 0; b1 = b[5] ?? 0; b2 = b[6] ?? 0; b3 = b[7] ?? 0
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
      
      b0 = b[8] ?? 0; b1 = b[9] ?? 0; b2 = b[10] ?? 0; b3 = b[11] ?? 0
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
      
      b0 = b[12] ?? 0; b1 = b[13] ?? 0; b2 = b[14] ?? 0; b3 = b[15] ?? 0
      out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
      out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
      out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
      out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
      
      return out
    }
  }

  // 3D Vector operations
  static readonly vec3 = {
    create(): Float32Array {
      return new Float32Array(3)
    },

    fromValues(x: number, y: number, z: number): Float32Array {
      const out = new Float32Array(3)
      out[0] = x; out[1] = y; out[2] = z
      return out
    },

    add(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
      out[0] = (a[0] ?? 0) + (b[0] ?? 0); out[1] = (a[1] ?? 0) + (b[1] ?? 0); out[2] = (a[2] ?? 0) + (b[2] ?? 0)
      return out
    },

    subtract(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array {
      out[0] = (a[0] ?? 0) - (b[0] ?? 0); out[1] = (a[1] ?? 0) - (b[1] ?? 0); out[2] = (a[2] ?? 0) - (b[2] ?? 0)
      return out
    },

    normalize(out: Float32Array, a: Float32Array): Float32Array {
      const x = a[0] ?? 0, y = a[1] ?? 0, z = a[2] ?? 0
      let len = x * x + y * y + z * z
      
      if (len > 0) {
        len = 1 / Math.sqrt(len)
        out[0] = (a[0] ?? 0) * len; out[1] = (a[1] ?? 0) * len; out[2] = (a[2] ?? 0) * len
      }
      
      return out
    },

    distance(a: Float32Array, b: Float32Array): number {
      const x = (b[0] ?? 0) - (a[0] ?? 0), y = (b[1] ?? 0) - (a[1] ?? 0), z = (b[2] ?? 0) - (a[2] ?? 0)
      return Math.sqrt(x * x + y * y + z * z)
    },

    lerp(out: Float32Array, a: Float32Array, b: Float32Array, t: number): Float32Array {
      const ax = a[0] ?? 0, ay = a[1] ?? 0, az = a[2] ?? 0
      out[0] = ax + t * ((b[0] ?? 0) - ax)
      out[1] = ay + t * ((b[1] ?? 0) - ay)
      out[2] = az + t * ((b[2] ?? 0) - az)
      return out
    }
  }

  // Utility functions
  static smoothDamp(
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

  static bezierCurve3D(
    t: number,
    p0: Float32Array,
    p1: Float32Array,
    p2: Float32Array,
    p3: Float32Array
  ): Float32Array {
    const out = SpatialMath.vec3.create()
    const t2 = t * t, t3 = t2 * t
    const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt
    
    out[0] = mt3 * (p0[0] ?? 0) + 3 * mt2 * t * (p1[0] ?? 0) + 3 * mt * t2 * (p2[0] ?? 0) + t3 * (p3[0] ?? 0)
    out[1] = mt3 * (p0[1] ?? 0) + 3 * mt2 * t * (p1[1] ?? 0) + 3 * mt * t2 * (p2[1] ?? 0) + t3 * (p3[1] ?? 0)
    out[2] = mt3 * (p0[2] ?? 0) + 3 * mt2 * t * (p1[2] ?? 0) + 3 * mt * t2 * (p2[2] ?? 0) + t3 * (p3[2] ?? 0)
    
    return out
  }
}

// ===== ジェスチャー認識エンジン =====

export class GestureRecognizer {
  private element: HTMLElement
  private options: {
    enableMultiTouch: boolean
    onGestureStart: (type: GestureType, event: GestureEvent) => void
    onGestureUpdate: (event: GestureEvent) => void
    onGestureEnd: () => void
    onGestureCancel: () => void
  }
  
  // State tracking
  private touchStartTime = 0
  private touchStartPos = { x: 0, y: 0 }
  private lastTouchPos = { x: 0, y: 0 }
  private lastTouchTime = 0
  private touchIdentifiers = new Map<number | string, { x: number; y: number }>()
  private gestureState: 'idle' | 'recognizing' | 'active' = 'idle'
  private currentGesture: GestureType | null = null
  private tapTimeout: number | null = null
  private longPressTimeout: number | null = null
  private lastTapTime = 0
  private tapCount = 0
  
  // Gesture thresholds
  private readonly THRESHOLDS = {
    TAP: 10,
    SWIPE: 50,
    SWIPE_VELOCITY: 0.3,
    LONG_PRESS_DURATION: 500,
    DOUBLE_TAP_INTERVAL: 300,
    PINCH: 10,
    ROTATION: 15
  }

  constructor(element: HTMLElement, options: {
    enableMultiTouch: boolean
    onGestureStart: (type: GestureType, event: GestureEvent) => void
    onGestureUpdate: (event: GestureEvent) => void
    onGestureEnd: () => void
    onGestureCancel: () => void
  }) {
    this.element = element
    this.options = options
    this.attachListeners()
  }

  private attachListeners() {
    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false })
    
    // Mouse events (desktop fallback)
    this.element.addEventListener('mousedown', this.handleMouseDown)
    this.element.addEventListener('mousemove', this.handleMouseMove)
    this.element.addEventListener('mouseup', this.handleMouseUp)
    this.element.addEventListener('mouseleave', this.handleMouseLeave)
  }

  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    
    this.touchStartTime = Date.now()
    this.touchStartPos = {
      x: e.touches[0]?.clientX ?? 0,
      y: e.touches[0]?.clientY ?? 0
    }
    this.lastTouchPos = { ...this.touchStartPos }
    
    // Store all touch points
    this.touchIdentifiers.clear()
    Array.from(e.touches).forEach(touch => {
      this.touchIdentifiers.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY
      })
    })
    
    // Handle multi-touch or single touch
    if (e.touches.length > 1 && this.options.enableMultiTouch) {
      this.recognizeMultiTouchGesture(e)
    } else {
      this.startLongPressDetection()
    }
    
    this.gestureState = 'recognizing'
  }

  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    
    if (this.gestureState === 'idle') return
    
    const currentPos = {
      x: e.touches[0]?.clientX ?? 0,
      y: e.touches[0]?.clientY ?? 0
    }
    
    const deltaX = currentPos.x - this.lastTouchPos.x
    const deltaY = currentPos.y - this.lastTouchPos.y
    const totalDeltaX = currentPos.x - this.touchStartPos.x
    const totalDeltaY = currentPos.y - this.touchStartPos.y
    const distance = Math.sqrt(totalDeltaX ** 2 + totalDeltaY ** 2)
    
    // Cancel long press if moved too far
    if (distance > this.THRESHOLDS.TAP && this.longPressTimeout) {
      this.cancelLongPress()
    }
    
    // Detect gesture type
    if (!this.currentGesture && distance > this.THRESHOLDS.TAP) {
      if (e.touches.length > 1) {
        this.updateMultiTouchGesture(e)
      } else {
        this.currentGesture = 'drag'
        this.startGesture('drag', e)
      }
    }
    
    // Update current gesture
    if (this.currentGesture) {
      const velocity = this.calculateVelocity(currentPos)
      const angle = Math.atan2(totalDeltaY, totalDeltaX) * 180 / Math.PI
      
      this.options.onGestureUpdate({
        type: this.currentGesture,
        timestamp: Date.now(),
        deltaX,
        deltaY,
        velocity,
        distance,
        angle,
        scale: 1,
        rotation: 0,
        touches: Array.from(e.touches).map(t => ({
          x: t.clientX,
          y: t.clientY,
          id: t.identifier
        })),
        progress: Math.min(distance / 100, 1)
      })
    }
    
    this.lastTouchPos = currentPos
    this.lastTouchTime = Date.now()
  }

  private handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    
    const touchDuration = Date.now() - this.touchStartTime
    const finalPos = this.lastTouchPos
    const totalDeltaX = finalPos.x - this.touchStartPos.x
    const totalDeltaY = finalPos.y - this.touchStartPos.y
    const distance = Math.sqrt(totalDeltaX ** 2 + totalDeltaY ** 2)
    
    this.cancelLongPress()
    
    if (this.currentGesture) {
      this.options.onGestureEnd()
    } else if (distance < this.THRESHOLDS.TAP) {
      this.handleTapGesture()
    } else if (touchDuration < 300) {
      // Quick swipe (flick)
      const velocity = this.calculateVelocity(finalPos)
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
      
      if (speed > this.THRESHOLDS.SWIPE_VELOCITY) {
        const direction = this.getSwipeDirection(totalDeltaX, totalDeltaY)
        this.emitGesture(direction, e)
      }
    }
    
    this.resetGestureState()
  }

  private handleTouchCancel = (_e: TouchEvent) => {
    this.cancelLongPress()
    this.options.onGestureCancel()
    this.resetGestureState()
  }

  // Mouse event handlers (simplified for desktop)
  private handleMouseDown = (e: MouseEvent) => {
    const touch = this.mouseToTouchEvent(e)
    this.handleTouchStart(touch)
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (this.gestureState === 'idle') return
    const touch = this.mouseToTouchEvent(e)
    this.handleTouchMove(touch)
  }

  private handleMouseUp = (e: MouseEvent) => {
    const touch = this.mouseToTouchEvent(e, [])
    this.handleTouchEnd(touch)
  }

  private handleMouseLeave = (_e: MouseEvent) => {
    if (this.gestureState !== 'idle') {
      this.handleTouchCancel({} as TouchEvent)
    }
  }

  private mouseToTouchEvent(e: MouseEvent, touches: any[] = [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }]): TouchEvent {
    return {
      touches,
      preventDefault: () => e.preventDefault()
    } as any
  }

  // Multi-touch gesture recognition
  private recognizeMultiTouchGesture(e: TouchEvent) {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      if (!touch1 || !touch2) return
      const distance = this.getDistance(touch1, touch2)
      const angle = this.getAngle(touch1, touch2)
      
      this.touchIdentifiers.set('pinch-distance', { x: distance, y: 0 })
      this.touchIdentifiers.set('rotation-angle', { x: angle, y: 0 })
    } else if (e.touches.length > 2) {
      this.currentGesture = 'multi-finger-tap'
      this.startGesture('multi-finger-tap', e)
    }
  }

  private updateMultiTouchGesture(e: TouchEvent) {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      if (!touch1 || !touch2) return
      const currentDistance = this.getDistance(touch1, touch2)
      const currentAngle = this.getAngle(touch1, touch2)
      
      const initialDistance = this.touchIdentifiers.get('pinch-distance')?.x || currentDistance
      const initialAngle = this.touchIdentifiers.get('rotation-angle')?.x || currentAngle
      
      const scale = currentDistance / initialDistance
      const rotation = currentAngle - initialAngle
      
      if (Math.abs(scale - 1) > 0.1) {
        this.currentGesture = scale > 1 ? 'pinch-out' : 'pinch-in'
      } else if (Math.abs(rotation) > this.THRESHOLDS.ROTATION) {
        this.currentGesture = 'rotate'
      }
      
      if (this.currentGesture) {
        this.startGesture(this.currentGesture, e)
      }
    }
  }

  // Helper methods
  private startLongPressDetection() {
    this.longPressTimeout = window.setTimeout(() => {
      if (this.gestureState === 'recognizing' && !this.currentGesture) {
        this.currentGesture = 'longpress'
        this.emitGesture('longpress', null)
      }
    }, this.THRESHOLDS.LONG_PRESS_DURATION)
  }

  private cancelLongPress() {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout)
      this.longPressTimeout = null
    }
  }

  private handleTapGesture() {
    const now = Date.now()
    
    if (now - this.lastTapTime < this.THRESHOLDS.DOUBLE_TAP_INTERVAL) {
      this.tapCount++
      if (this.tapCount === 2) {
        this.emitGesture('doubletap', null)
        this.tapCount = 0
      }
    } else {
      this.tapCount = 1
      if (this.tapTimeout) clearTimeout(this.tapTimeout)
      
      this.tapTimeout = window.setTimeout(() => {
        if (this.tapCount === 1) {
          this.emitGesture('tap', null)
        }
        this.tapCount = 0
      }, this.THRESHOLDS.DOUBLE_TAP_INTERVAL)
    }
    
    this.lastTapTime = now
  }

  private startGesture(type: GestureType, e: TouchEvent | null) {
    this.gestureState = 'active'
    this.currentGesture = type
    
    const event: GestureEvent = {
      type,
      timestamp: Date.now(),
      deltaX: 0,
      deltaY: 0,
      velocity: { x: 0, y: 0 },
      distance: 0,
      angle: 0,
      scale: 1,
      rotation: 0,
      touches: e ? this.getTouches(e) : [],
      progress: 0
    }
    
    this.options.onGestureStart(type, event)
  }

  private emitGesture(type: GestureType, e: TouchEvent | null) {
    const event: GestureEvent = {
      type,
      timestamp: Date.now(),
      deltaX: this.lastTouchPos.x - this.touchStartPos.x,
      deltaY: this.lastTouchPos.y - this.touchStartPos.y,
      velocity: this.calculateVelocity(this.lastTouchPos),
      distance: this.getDistance(
        { clientX: this.touchStartPos.x, clientY: this.touchStartPos.y } as Touch,
        { clientX: this.lastTouchPos.x, clientY: this.lastTouchPos.y } as Touch
      ),
      angle: Math.atan2(
        this.lastTouchPos.y - this.touchStartPos.y,
        this.lastTouchPos.x - this.touchStartPos.x
      ) * 180 / Math.PI,
      scale: 1,
      rotation: 0,
      touches: e ? this.getTouches(e) : [],
      progress: 1
    }
    
    this.options.onGestureStart(type, event)
    this.options.onGestureEnd()
  }

  private calculateVelocity(currentPos: { x: number; y: number }): { x: number; y: number } {
    const timeDelta = Date.now() - this.lastTouchTime || 1
    return {
      x: (currentPos.x - this.lastTouchPos.x) / timeDelta,
      y: (currentPos.y - this.lastTouchPos.y) / timeDelta
    }
  }

  private getSwipeDirection(deltaX: number, deltaY: number): GestureType {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    if (absX > absY) {
      return deltaX > 0 ? 'swipe-right' : 'swipe-left'
    } else {
      return deltaY > 0 ? 'swipe-down' : 'swipe-up'
    }
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  private getAngle(touch1: Touch, touch2: Touch): number {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI
  }

  private getTouches(e: TouchEvent): Array<{ x: number; y: number; id: number }> {
    return Array.from(e.touches).map(t => ({
      x: t.clientX,
      y: t.clientY,
      id: t.identifier
    }))
  }

  private resetGestureState() {
    this.gestureState = 'idle'
    this.currentGesture = null
    this.touchIdentifiers.clear()
  }

  destroy() {
    // Remove all event listeners
    this.element.removeEventListener('touchstart', this.handleTouchStart)
    this.element.removeEventListener('touchmove', this.handleTouchMove)
    this.element.removeEventListener('touchend', this.handleTouchEnd)
    this.element.removeEventListener('touchcancel', this.handleTouchCancel)
    this.element.removeEventListener('mousedown', this.handleMouseDown)
    this.element.removeEventListener('mousemove', this.handleMouseMove)
    this.element.removeEventListener('mouseup', this.handleMouseUp)
    this.element.removeEventListener('mouseleave', this.handleMouseLeave)
    
    this.cancelLongPress()
    if (this.tapTimeout) clearTimeout(this.tapTimeout)
  }
}

// ===== 統合インタラクションエンジン =====

export class UnifiedInteractionSystem {
  private options: InteractionEngineOptions
  private gestureRecognizer: GestureRecognizer | null = null
  private spatialTransform: SpatialTransform
  
  // Vue composables instances (dynamically connected)
  private vueComposables: {
    gestures?: any
    spatial?: any
    predictive?: any
    adaptive?: any
    animations?: any
    aiAdaptation?: any
  } = {}
  
  // Interaction tracking
  private interactionHistory: Array<{
    type: string
    timestamp: number
    data: any
  }> = []
  
  private gestureHandlers = new Map<GestureType, (event: GestureEvent) => void>()
  private contextualActions = new Map<string, () => void>()
  private debugOverlay: HTMLElement | null = null

  constructor(options: InteractionEngineOptions = {}) {
    this.options = {
      enableSpatialNavigation: true,
      enablePredictiveUI: true,
      enableAdaptiveLayout: true,
      enableIntelligentAnimations: true,
      enableHapticFeedback: true,
      enableMultiTouch: true,
      debugMode: false,
      ...options
    }
    
    // Initialize spatial transform
    this.spatialTransform = {
      position: SpatialMath.vec3.fromValues(0, 0, 0),
      rotation: SpatialMath.vec3.fromValues(0, 0, 0),
      scale: SpatialMath.vec3.fromValues(1, 1, 1),
      matrix: SpatialMath.mat4.create()
    }
    
    this.initialize()
  }

  private initialize() {
    this.setupDefaultGestureHandlers()
    
    if (this.options.debugMode) {
      this.initializeDebugMode()
    }
  }

  private setupDefaultGestureHandlers() {
    // Spatial navigation gestures
    this.gestureHandlers.set('swipe-left', (event) => {
      if (this.vueComposables.spatial && this.options.enableSpatialNavigation) {
        this.vueComposables.spatial.pan(-event.distance, 0)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('swipe-right', (event) => {
      if (this.vueComposables.spatial && this.options.enableSpatialNavigation) {
        this.vueComposables.spatial.pan(event.distance, 0)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('pinch-in', (_event) => {
      if (this.vueComposables.spatial && this.options.enableSpatialNavigation) {
        this.vueComposables.spatial.zoom(0.9)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('pinch-out', (_event) => {
      if (this.vueComposables.spatial && this.options.enableSpatialNavigation) {
        this.vueComposables.spatial.zoom(1.1)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('longpress', (event) => {
      this.showContextMenu(event)
      this.provideHapticFeedback('medium')
    })
    
    this.gestureHandlers.set('doubletap', (event) => {
      this.executeSmartAction(event)
      this.provideHapticFeedback('success')
    })
    
    this.gestureHandlers.set('edge-swipe', (event) => {
      this.handleEdgeSwipe(event)
      this.provideHapticFeedback('heavy')
    })
  }

  // ===== Public API =====

  public attachToElement(element: HTMLElement): void {
    if (this.gestureRecognizer) {
      this.gestureRecognizer.destroy()
    }
    
    this.gestureRecognizer = new GestureRecognizer(element, {
      enableMultiTouch: this.options.enableMultiTouch || false,
      onGestureStart: (type, event) => this.handleGesture(type, event),
      onGestureUpdate: (event) => this.updateGesture(event),
      onGestureEnd: () => this.endGesture(),
      onGestureCancel: () => this.cancelGesture()
    })
  }

  public connectToVue(vueContext: {
    gestures?: any
    spatial?: any
    predictive?: any
    adaptive?: any
    animations?: any
    aiAdaptation?: any
  }): void {
    this.vueComposables = vueContext
  }

  public registerGestureHandler(type: GestureType, handler: (event: GestureEvent) => void): void {
    this.gestureHandlers.set(type, handler)
  }

  public registerContextualAction(id: string, action: () => void): void {
    this.contextualActions.set(id, action)
  }

  public triggerHaptic(intensity: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    this.provideHapticFeedback(intensity)
  }

  public getSpatialTransform(): SpatialTransform {
    return this.spatialTransform
  }

  public updateSpatialTransform(position?: [number, number, number], rotation?: [number, number, number], scale?: [number, number, number]): void {
    if (position) {
      this.spatialTransform.position[0] = position[0]
      this.spatialTransform.position[1] = position[1]
      this.spatialTransform.position[2] = position[2]
    }
    
    if (rotation) {
      this.spatialTransform.rotation[0] = rotation[0]
      this.spatialTransform.rotation[1] = rotation[1]
      this.spatialTransform.rotation[2] = rotation[2]
    }
    
    if (scale) {
      this.spatialTransform.scale[0] = scale[0]
      this.spatialTransform.scale[1] = scale[1]
      this.spatialTransform.scale[2] = scale[2]
    }
    
    // Update transformation matrix
    this.updateTransformationMatrix()
  }

  public getInteractionHistory(): Array<{ type: string; timestamp: number; data: any }> {
    return [...this.interactionHistory]
  }

  // ===== Private methods =====

  private handleGesture(type: GestureType, event: GestureEvent): void {
    this.recordInteraction('gesture', { type, event })
    
    const handler = this.gestureHandlers.get(type)
    if (handler) {
      handler(event)
    }
    
    if (this.vueComposables.predictive) {
      this.vueComposables.predictive.trackAction(`gesture-${type}`)
    }
  }

  private updateGesture(_event: GestureEvent): void {
    // Update ongoing gesture
  }

  private endGesture(): void {
    // Handle gesture end
  }

  private cancelGesture(): void {
    // Handle gesture cancellation
  }

  private showContextMenu(event: GestureEvent): void {
    const actions = this.getContextualActions(event)
    
    if (this.vueComposables.animations && actions.length > 0) {
      // Animate context menu appearance using animations composable
    }
  }

  private getContextualActions(_event: GestureEvent): Array<{ label: string; action: () => void }> {
    const actions: Array<{ label: string; action: () => void }> = []
    
    if (this.vueComposables.predictive) {
      const predictions = this.vueComposables.predictive.predictedActions?.value || []
      predictions.slice(0, 3).forEach((prediction: any) => {
        actions.push({
          label: prediction.id,
          action: () => {
            if (prediction.action) prediction.action()
          }
        })
      })
    }
    
    return actions
  }

  private executeSmartAction(_event: GestureEvent): void {
    if (this.vueComposables.predictive) {
      const topPrediction = this.vueComposables.predictive.topPrediction?.value
      if (topPrediction && topPrediction.action) {
        topPrediction.action()
      }
    }
  }

  private handleEdgeSwipe(event: GestureEvent): void {
    const edge = this.detectEdge(event)
    
    switch (edge) {
      case 'left':
        if (this.vueComposables.spatial) {
          this.vueComposables.spatial.navigateBack?.()
        }
        break
      case 'right':
        // Show quick actions
        break
      case 'top':
        // Show notifications
        break
      case 'bottom':
        // Show navigation
        break
    }
  }

  private detectEdge(event: GestureEvent): 'left' | 'right' | 'top' | 'bottom' | null {
    const touch = event.touches[0]
    if (!touch) return null
    
    const threshold = 20
    const { innerWidth, innerHeight } = window
    
    if (touch.x < threshold) return 'left'
    if (touch.x > innerWidth - threshold) return 'right'
    if (touch.y < threshold) return 'top'
    if (touch.y > innerHeight - threshold) return 'bottom'
    
    return null
  }

  private provideHapticFeedback(intensity: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'): void {
    if (!this.options.enableHapticFeedback || !('vibrate' in navigator)) return
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [30, 10, 30],
      error: [50, 10, 50, 10, 50]
    }
    
    navigator.vibrate(patterns[intensity] || patterns.light)
  }

  private recordInteraction(type: string, data: any): void {
    this.interactionHistory.push({
      type,
      timestamp: Date.now(),
      data
    })
    
    // Keep history limited
    if (this.interactionHistory.length > 100) {
      this.interactionHistory.shift()
    }
    
    if (this.options.debugMode) {
      console.log('[UnifiedInteractionSystem]', type, data)
    }
  }

  private updateTransformationMatrix(): void {
    const { position, rotation, scale, matrix } = this.spatialTransform
    
    SpatialMath.mat4.identity(matrix)
    SpatialMath.mat4.translate(matrix, matrix, [
      position[0] ?? 0, 
      position[1] ?? 0, 
      position[2] ?? 0
    ])
    SpatialMath.mat4.rotateX(matrix, matrix, rotation[0] ?? 0)
    SpatialMath.mat4.rotateY(matrix, matrix, rotation[1] ?? 0)
    SpatialMath.mat4.rotateZ(matrix, matrix, rotation[2] ?? 0)
    SpatialMath.mat4.scale(matrix, matrix, [
      scale[0] ?? 1, 
      scale[1] ?? 1, 
      scale[2] ?? 1
    ])
  }

  private initializeDebugMode(): void {
    // Create debug overlay
    this.debugOverlay = document.createElement('div')
    this.debugOverlay.id = 'unified-interaction-debug-overlay'
    this.debugOverlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 12px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      z-index: 99999;
      max-width: 350px;
      max-height: 500px;
      overflow-y: auto;
      border-radius: 8px;
      border: 1px solid #333;
    `
    document.body.appendChild(this.debugOverlay)
    
    // Update debug info
    setInterval(() => {
      if (this.debugOverlay) {
        const info = this.getDebugInfo()
        this.debugOverlay.innerHTML = `
          <h4 style="margin: 0 0 8px 0; color: #4CAF50;">🎮 Unified Interaction System</h4>
          <div><strong>Gesture:</strong> ${info.currentGesture || 'none'}</div>
          <div><strong>Spatial Transform:</strong></div>
          <div style="margin-left: 12px;">
            <div>Position: [${info.spatialTransform.position.map(v => v.toFixed(2)).join(', ')}]</div>
            <div>Rotation: [${info.spatialTransform.rotation.map(v => v.toFixed(2)).join(', ')}]</div>
            <div>Scale: [${info.spatialTransform.scale.map(v => v.toFixed(2)).join(', ')}]</div>
          </div>
          <div><strong>Active Features:</strong></div>
          <div style="margin-left: 12px;">
            <div>🌐 Spatial Nav: ${this.options.enableSpatialNavigation ? '✅' : '❌'}</div>
            <div>🔮 Predictive UI: ${this.options.enablePredictiveUI ? '✅' : '❌'}</div>
            <div>📱 Haptic: ${this.options.enableHapticFeedback ? '✅' : '❌'}</div>
            <div>👆 Multi-Touch: ${this.options.enableMultiTouch ? '✅' : '❌'}</div>
          </div>
          <div><strong>Recent Interactions:</strong></div>
          <ul style="margin: 4px 0; padding-left: 16px; font-size: 10px;">
            ${info.recentInteractions.map(i => `<li>${i}</li>`).join('')}
          </ul>
        `
      }
    }, 200)
  }

  private getDebugInfo() {
    return {
      currentGesture: this.vueComposables.gestures?.currentGesture?.value,
      spatialTransform: {
        position: Array.from(this.spatialTransform.position),
        rotation: Array.from(this.spatialTransform.rotation),
        scale: Array.from(this.spatialTransform.scale)
      },
      recentInteractions: this.interactionHistory.slice(-5).map(i => 
        `${i.type} (${new Date(i.timestamp).toLocaleTimeString()})`
      )
    }
  }

  public destroy(): void {
    // Clean up gesture recognizer
    if (this.gestureRecognizer) {
      this.gestureRecognizer.destroy()
      this.gestureRecognizer = null
    }
    
    // Clean up debug overlay
    if (this.debugOverlay) {
      this.debugOverlay.remove()
      this.debugOverlay = null
    }
    
    // Clear all handlers and data
    this.gestureHandlers.clear()
    this.contextualActions.clear()
    this.interactionHistory = []
    this.vueComposables = {}
  }
}

// ===== Singleton instance & factory =====

let systemInstance: UnifiedInteractionSystem | null = null

export function getUnifiedInteractionSystem(options?: InteractionEngineOptions): UnifiedInteractionSystem {
  if (!systemInstance) {
    systemInstance = new UnifiedInteractionSystem(options)
  }
  return systemInstance
}

export function destroyUnifiedInteractionSystem(): void {
  if (systemInstance) {
    systemInstance.destroy()
    systemInstance = null
  }
}

// ===== エクスポート =====

// Fixed export conflicts - only export default to prevent redeclation errors
export {
  UnifiedInteractionSystem as default
}

console.log('🎮 統合インタラクションシステム読み込み完了')