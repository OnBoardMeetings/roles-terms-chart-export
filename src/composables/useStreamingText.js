import { ref, onUnmounted } from 'vue'

export function useStreamingText() {
  const streamedText = ref('')
  const isStreaming = ref(false)
  let timeoutId = null
  let rafId = null

  const streamText = async (fullText, options = {}) => {
    const {
      speed = 20,
      onComplete = () => {},
      immediate = false,
    } = options

    if (immediate) {
      streamedText.value = fullText
      onComplete()
      return
    }

    isStreaming.value = true
    streamedText.value = ''

    let currentIndex = 0

    const addNextChunk = () => {
      if (currentIndex >= fullText.length) {
        isStreaming.value = false
        onComplete()
        return
      }

      const chunkSize = Math.floor(Math.random() * 3) + 1
      const nextChunk = fullText.slice(currentIndex, currentIndex + chunkSize)
      streamedText.value += nextChunk
      currentIndex += chunkSize

      const delay = speed + Math.random() * speed * 0.5

      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(addNextChunk)
      }, delay)
    }

    addNextChunk()
  }

  const stopStreaming = (showFull = false) => {
    if (timeoutId) clearTimeout(timeoutId)
    if (rafId) cancelAnimationFrame(rafId)
    isStreaming.value = false
  }

  const reset = () => {
    stopStreaming()
    streamedText.value = ''
  }

  onUnmounted(() => {
    stopStreaming()
  })

  return {
    streamedText,
    isStreaming,
    streamText,
    stopStreaming,
    reset,
  }
}
