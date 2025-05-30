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

export interface GestureRecognizerOptions {
  enableMultiTouch: boolean
  onGestureStart: (type: GestureType, event: GestureEvent) => void
  onGestureUpdate: (event: GestureEvent) => void
  onGestureEnd: () => void
  onGestureCancel: () => void
}

export class GestureRecognizer {
  private element: HTMLElement
  private options: GestureRecognizerOptions
  private touchStartTime = 0
  private touchStartPos = { x: 0, y: 0 }
  private lastTouchPos = { x: 0, y: 0 }
  private lastTouchTime = 0
  private touchIdentifiers: Map<number, { x: number; y: number }> = new Map()
  private gestureState: 'idle' | 'recognizing' | 'active' = 'idle'
  private currentGesture: GestureType | null = null
  private tapTimeout: number | null = null
  private longPressTimeout: number | null = null
  private lastTapTime = 0
  private tapCount = 0
  
  // Gesture thresholds
  private readonly TAP_THRESHOLD = 10
  private readonly SWIPE_THRESHOLD = 50
  private readonly SWIPE_VELOCITY_THRESHOLD = 0.3
  private readonly LONG_PRESS_DURATION = 500
  private readonly DOUBLE_TAP_INTERVAL = 300
  private readonly PINCH_THRESHOLD = 10
  private readonly ROTATION_THRESHOLD = 15
  
  constructor(element: HTMLElement, options: GestureRecognizerOptions) {
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
    
    // Mouse events (for desktop)
    this.element.addEventListener('mousedown', this.handleMouseDown)
    this.element.addEventListener('mousemove', this.handleMouseMove)
    this.element.addEventListener('mouseup', this.handleMouseUp)
    this.element.addEventListener('mouseleave', this.handleMouseLeave)
    
    // Pointer events (unified)
    if ('PointerEvent' in window) {
      this.element.addEventListener('pointerdown', this.handlePointerDown)
      this.element.addEventListener('pointermove', this.handlePointerMove)
      this.element.addEventListener('pointerup', this.handlePointerUp)
      this.element.addEventListener('pointercancel', this.handlePointerCancel)
    }
  }
  
  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    
    this.touchStartTime = Date.now()
    this.touchStartPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
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
    
    // Check for multi-touch gestures
    if (e.touches.length > 1 && this.options.enableMultiTouch) {
      this.recognizeMultiTouchGesture(e)
    } else {
      // Start long press detection
      this.startLongPressDetection()
    }
    
    this.gestureState = 'recognizing'
  }
  
  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    
    if (this.gestureState === 'idle') return
    
    const currentPos = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
    
    const deltaX = currentPos.x - this.lastTouchPos.x
    const deltaY = currentPos.y - this.lastTouchPos.y
    const totalDeltaX = currentPos.x - this.touchStartPos.x
    const totalDeltaY = currentPos.y - this.touchStartPos.y
    const distance = Math.sqrt(totalDeltaX ** 2 + totalDeltaY ** 2)
    
    // Cancel long press if moved too far
    if (distance > this.TAP_THRESHOLD && this.longPressTimeout) {
      this.cancelLongPress()
    }
    
    // Detect gesture type
    if (!this.currentGesture && distance > this.TAP_THRESHOLD) {
      if (e.touches.length > 1) {
        this.updateMultiTouchGesture(e)
      } else {
        this.currentGesture = 'drag'
        this.startGesture('drag', e)
      }
    }
    
    // Update gesture
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
      // Gesture was active, end it
      this.options.onGestureEnd()
    } else if (distance < this.TAP_THRESHOLD) {
      // Check for tap or double tap
      this.handleTapGesture()
    } else if (touchDuration < 300) {
      // Quick swipe (flick)
      const velocity = this.calculateVelocity(finalPos)
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
      
      if (speed > this.SWIPE_VELOCITY_THRESHOLD) {
        const direction = this.getSwipeDirection(totalDeltaX, totalDeltaY)
        this.emitGesture(direction, e)
      }
    }
    
    this.resetGestureState()
  }
  
  private handleTouchCancel = (e: TouchEvent) => {
    this.cancelLongPress()
    this.options.onGestureCancel()
    this.resetGestureState()
  }
  
  // Mouse event handlers (simplified for desktop)
  private handleMouseDown = (e: MouseEvent) => {
    const touch = {
      touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }],
      preventDefault: () => e.preventDefault()
    } as any
    this.handleTouchStart(touch)
  }
  
  private handleMouseMove = (e: MouseEvent) => {
    if (this.gestureState === 'idle') return
    const touch = {
      touches: [{ clientX: e.clientX, clientY: e.clientY, identifier: 0 }],
      preventDefault: () => e.preventDefault()
    } as any
    this.handleTouchMove(touch)
  }
  
  private handleMouseUp = (e: MouseEvent) => {
    const touch = {
      touches: [],
      preventDefault: () => e.preventDefault()
    } as any
    this.handleTouchEnd(touch)
  }
  
  private handleMouseLeave = (e: MouseEvent) => {
    if (this.gestureState !== 'idle') {
      this.handleTouchCancel({} as TouchEvent)
    }
  }
  
  // Pointer event handlers
  private handlePointerDown = (e: PointerEvent) => {
    // Implementation similar to touch/mouse
  }
  
  private handlePointerMove = (e: PointerEvent) => {
    // Implementation similar to touch/mouse
  }
  
  private handlePointerUp = (e: PointerEvent) => {
    // Implementation similar to touch/mouse
  }
  
  private handlePointerCancel = (e: PointerEvent) => {
    // Implementation similar to touch/mouse
  }
  
  // Multi-touch gesture recognition
  private recognizeMultiTouchGesture(e: TouchEvent) {
    if (e.touches.length === 2) {
      // Two-finger gestures: pinch, rotate
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
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
      const currentDistance = this.getDistance(touch1, touch2)
      const currentAngle = this.getAngle(touch1, touch2)
      
      const initialDistance = this.touchIdentifiers.get('pinch-distance')?.x || currentDistance
      const initialAngle = this.touchIdentifiers.get('rotation-angle')?.x || currentAngle
      
      const scale = currentDistance / initialDistance
      const rotation = currentAngle - initialAngle
      
      if (Math.abs(scale - 1) > 0.1) {
        this.currentGesture = scale > 1 ? 'pinch-out' : 'pinch-in'
      } else if (Math.abs(rotation) > this.ROTATION_THRESHOLD) {
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
    }, this.LONG_PRESS_DURATION)
  }
  
  private cancelLongPress() {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout)
      this.longPressTimeout = null
    }
  }
  
  private handleTapGesture() {
    const now = Date.now()
    
    if (now - this.lastTapTime < this.DOUBLE_TAP_INTERVAL) {
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
      }, this.DOUBLE_TAP_INTERVAL)
    }
    
    this.lastTapTime = now
  }
  
  private startGesture(type: GestureType, e: TouchEvent | MouseEvent | null) {
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
  
  private emitGesture(type: GestureType, e: TouchEvent | MouseEvent | null) {
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
  
  private getTouches(e: TouchEvent | MouseEvent): Array<{ x: number; y: number; id: number }> {
    if ('touches' in e) {
      return Array.from(e.touches).map(t => ({
        x: t.clientX,
        y: t.clientY,
        id: t.identifier
      }))
    } else {
      return [{ x: e.clientX, y: e.clientY, id: 0 }]
    }
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