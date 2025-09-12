'use client'

import { useRef, useCallback } from 'react'

interface TouchPosition {
  x: number
  y: number
}

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
  velocity: number
}

interface UseTouchOptions {
  onSwipe?: (direction: SwipeDirection) => void
  onTap?: (position: TouchPosition) => void
  onLongPress?: (position: TouchPosition) => void
  onPinch?: (scale: number) => void
  swipeThreshold?: number
  longPressDelay?: number
  preventScroll?: boolean
}

export function useTouch({
  onSwipe,
  onTap,
  onLongPress,
  onPinch,
  swipeThreshold = 50,
  longPressDelay = 500,
  preventScroll = false
}: UseTouchOptions = {}) {
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)
  const touchTime = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const initialDistance = useRef<number>(0)
  const isLongPress = useRef<boolean>(false)

  const getTouchPosition = useCallback((touch: Touch): TouchPosition => {
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }, [])

  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const calculateSwipe = useCallback((): SwipeDirection => {
    if (!touchStart.current || !touchEnd.current) {
      return { direction: null, distance: 0, velocity: 0 }
    }

    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const time = Date.now() - touchTime.current
    const velocity = distance / time

    if (distance < swipeThreshold) {
      return { direction: null, distance, velocity }
    }

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    let direction: 'left' | 'right' | 'up' | 'down'
    
    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left'
    } else {
      direction = deltaY > 0 ? 'down' : 'up'
    }

    return { direction, distance, velocity }
  }, [swipeThreshold])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    const touch = e.touches[0]
    touchStart.current = getTouchPosition(touch)
    touchTime.current = Date.now()
    isLongPress.current = false

    // Gestione pinch (due dita)
    if (e.touches.length === 2 && onPinch) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1])
    }

    // Avvia timer per long press
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true
        onLongPress(touchStart.current!)
      }, longPressDelay)
    }
  }, [getTouchPosition, getDistance, onLongPress, onPinch, longPressDelay, preventScroll])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    // Cancella long press se c'è movimento
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Gestione pinch
    if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
      const currentDistance = getDistance(e.touches[0], e.touches[1])
      const scale = currentDistance / initialDistance.current
      onPinch(scale)
    }

    const touch = e.touches[0]
    touchEnd.current = getTouchPosition(touch)
  }, [getTouchPosition, getDistance, onPinch, preventScroll])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault()
    }

    // Cancella timer long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (!touchStart.current) return

    // Se è stato un long press, non processare altri eventi
    if (isLongPress.current) {
      return
    }

    const touch = e.changedTouches[0]
    touchEnd.current = getTouchPosition(touch)

    const swipe = calculateSwipe()
    
    if (swipe.direction && onSwipe) {
      onSwipe(swipe)
    } else if (onTap && swipe.distance < swipeThreshold) {
      // È un tap se non c'è stato movimento significativo
      onTap(touchStart.current)
    }

    // Reset
    touchStart.current = null
    touchEnd.current = null
    initialDistance.current = 0
  }, [getTouchPosition, calculateSwipe, onSwipe, onTap, swipeThreshold, preventScroll])

  const bindTouch = useCallback((element: HTMLElement | null) => {
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll })
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventScroll })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll])

  return { bindTouch }
}

// Hook per il feedback tattile
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const lightTap = useCallback(() => vibrate(10), [vibrate])
  const mediumTap = useCallback(() => vibrate(20), [vibrate])
  const heavyTap = useCallback(() => vibrate([30, 10, 30]), [vibrate])
  const success = useCallback(() => vibrate([100, 50, 100]), [vibrate])
  const error = useCallback(() => vibrate([200, 100, 200, 100, 200]), [vibrate])

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    error
  }
}

// Hook per rilevare il tipo di dispositivo
export function useDeviceType() {
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }, [])

  const isIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }, [])

  const isAndroid = useCallback(() => {
    return /Android/.test(navigator.userAgent)
  }, [])

  const isTouchDevice = useCallback(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  const getScreenSize = useCallback(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isSmall: window.innerWidth < 640,
      isMedium: window.innerWidth >= 640 && window.innerWidth < 1024,
      isLarge: window.innerWidth >= 1024
    }
  }, [])

  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isTouchDevice: isTouchDevice(),
    getScreenSize
  }
}

// Hook per gestire l'orientamento del dispositivo
export function useOrientation() {
  const getOrientation = useCallback(() => {
    if (screen.orientation) {
      return screen.orientation.angle === 0 || screen.orientation.angle === 180 
        ? 'portrait' 
        : 'landscape'
    }
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }, [])

  return {
    orientation: getOrientation(),
    isPortrait: getOrientation() === 'portrait',
    isLandscape: getOrientation() === 'landscape'
  }
}