import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  streaming?: boolean
}

interface ChatState {
  messages: Message[]
  loading: boolean
  abortController: AbortController | null
  addMessage: (message: Message) => void
  updateLastMessage: (content: string | ((prev: string) => string)) => void
  setLastMessageStreaming: (streaming: boolean) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setAbortController: (controller: AbortController | null) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  loading: false,
  abortController: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  updateLastMessage: (content) => set((state) => {
    const msgs = [...state.messages]
    if (msgs.length > 0) {
      const last = msgs[msgs.length - 1]
      const newContent = typeof content === 'function' ? content(last.content) : content
      msgs[msgs.length - 1] = { ...last, content: newContent }
    }
    return { messages: msgs }
  }),

  setLastMessageStreaming: (streaming) => set((state) => {
    const msgs = [...state.messages]
    if (msgs.length > 0) {
      msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], streaming }
    }
    return { messages: msgs }
  }),

  clearMessages: () => {
    set((state) => {
      state.abortController?.abort()
      return { messages: [], loading: false, abortController: null }
    })
  },

  setLoading: (loading) => set({ loading }),
  setAbortController: (controller) => set({ abortController: controller }),
}))
