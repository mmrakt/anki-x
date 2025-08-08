import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// モーダルの状態管理
export const modalStateAtom = atom({
  createDeck: false,
  editDeck: false,
  deleteDeck: false,
  createCard: false,
  editCard: false,
  deleteCard: false,
})

// 現在編集中のアイテムID
export const currentEditItemAtom = atom<string | null>(null)

// トースト通知
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  description?: string
  duration?: number
}

export const toastsAtom = atom<ToastMessage[]>([])

// トースト追加
export const addToastAtom = atom(
  null,
  (get, set, toast: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: Math.random().toString(36).substr(2, 9),
      duration: toast.duration || 5000,
    }
    
    const currentToasts = get(toastsAtom)
    set(toastsAtom, [...currentToasts, newToast])

    // 自動削除
    setTimeout(() => {
      const toasts = get(toastsAtom)
      set(toastsAtom, toasts.filter(t => t.id !== newToast.id))
    }, newToast.duration)
  }
)

// トースト削除
export const removeToastAtom = atom(
  null,
  (get, set, toastId: string) => {
    const toasts = get(toastsAtom)
    set(toastsAtom, toasts.filter(t => t.id !== toastId))
  }
)

// ユーザー設定（ローカルストレージ）
export const userPreferencesAtom = atomWithStorage('user-preferences', {
  theme: 'light' as 'light' | 'dark' | 'system',
  language: 'ja',
  studySettings: {
    autoPlayAudio: false,
    showTimer: true,
    autoAdvance: false,
    reviewOrder: 'due' as 'due' | 'random' | 'newest',
  },
  notifications: {
    dailyReminder: true,
    studyStreak: true,
    reviewReady: false,
  }
})

// サイドバーの状態
export const sidebarOpenAtom = atomWithStorage('sidebar-open', true)

// 検索クエリ
export const searchQueryAtom = atom('')

// フィルター状態
export const filtersAtom = atom({
  showDue: true,
  showNew: true,
  showLearning: true,
  showReviewing: true,
  sortBy: 'dueAt' as 'dueAt' | 'createdAt' | 'name',
  sortOrder: 'asc' as 'asc' | 'desc',
})

// ローディング状態（グローバル）
export const globalLoadingAtom = atom(false)

// エラー状態（グローバル）
export const globalErrorAtom = atom<string | null>(null)