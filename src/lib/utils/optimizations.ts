import React from 'react'

/**
 * Heavy computation optimization with Web Workers
 */
export function useWebWorker<T, R>(
  workerFunction: (data: T) => R
): (data: T) => Promise<R> {
  const workerRef = React.useRef<Worker>()

  React.useEffect(() => {
    // Create worker from function
    const workerCode = `
      self.onmessage = function(e) {
        const result = (${workerFunction.toString()})(e.data);
        self.postMessage(result);
      }
    `
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const workerUrl = URL.createObjectURL(blob)
    workerRef.current = new Worker(workerUrl)

    return () => {
      workerRef.current?.terminate()
      URL.revokeObjectURL(workerUrl)
    }
  }, [workerFunction])

  return React.useCallback((data: T) => {
    return new Promise<R>((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      workerRef.current.onmessage = (e) => resolve(e.data)
      workerRef.current.onerror = reject
      workerRef.current.postMessage(data)
    })
  }, [])
}

/**
 * Request idle callback for non-critical updates
 */
export function useIdleCallback(callback: () => void, deps: React.DependencyList) {
  React.useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback)
      return () => cancelIdleCallback(id)
    } else {
      // Fallback to setTimeout
      const id = setTimeout(callback, 1)
      return () => clearTimeout(id)
    }
  }, deps)
}

/**
 * Optimize re-renders with custom comparison
 */
export function useDeepCompareMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = React.useRef<{ deps: React.DependencyList; value: T }>()

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false
    }
  }
  
  return true
}

/**
 * Batch state updates
 */
export function useBatchedState<T>(initialState: T) {
  const [state, setState] = React.useState(initialState)
  const pendingUpdates = React.useRef<Partial<T>[]>([])
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const batchedSetState = React.useCallback((update: Partial<T>) => {
    pendingUpdates.current.push(update)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState((currentState) => {
        const merged = pendingUpdates.current.reduce(
          (acc, update) => ({ ...acc, ...update }),
          currentState
        )
        pendingUpdates.current = []
        return merged
      })
    }, 0)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchedSetState] as const
}
