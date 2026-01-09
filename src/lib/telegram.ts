import { retrieveLaunchParams } from '@telegram-apps/sdk'

/**
 * Минимальные локальные типы, чтобы TS был спокоен.
 * SDK может экспортировать более точные типы, но эти простые подойдут.
 */
type InitDataParsed = {
  user?: {
    id?: number
    first_name?: string
    last_name?: string
    username?: string
    photo_url?: string
  }
  [k: string]: any
}

export const isTMA = (): boolean => {
  // Проверяем наличие Telegram WebApp в window
  return typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp
}

/**
 * Инициализация — возвращаем нормализованный user и сам initData (объект или null).
 */
export const initTelegram = async (): Promise<{
  user: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    photoUrl?: string
  }; initData: InitDataParsed | null
}> => {
  if (!isTMA()) {
    throw new Error('Not in Telegram Mini App')
  }

  // retrieveLaunchParams возвращает initData (parsed) и другие поля
  const { initData } = retrieveLaunchParams()
  const userRaw = initData?.user
  console.log("TG INIT DATA:", initData)
console.log("TG USER RAW:", userRaw)

  // Initialize Telegram WebApp (safely)
  const tg = (window as any).Telegram.WebApp
  try {
    tg.expand?.()
    tg.enableClosingConfirmation?.()
    if (tg.setHeaderColor) tg.setHeaderColor('#0A0A0A')
    if (tg.setBackgroundColor) tg.setBackgroundColor('#0A0A0A')
  } catch (e) {
    // не критично — просто лог
    console.warn('Telegram WebApp UI initialization failed', e)
  }

  const user = {
    id: userRaw?.id ?? 0,
    firstName: userRaw?.firstName ?? '',
    lastName: userRaw?.lastName,
    username: userRaw?.username,
    photoUrl: userRaw?.photoUrl,
  }
  
  const rawInitData = (window as any).Telegram.WebApp.initData
  
return {
  user,
  initData: rawInitData,
}
}

export const requestPhoneNumber = () => {
  if (!isTMA()) return Promise.reject('Not in Telegram')
  return new Promise((resolve, reject) => {
    const tg = (window as any).Telegram.WebApp
    if (!tg.requestContact) {
      return reject('Telegram WebApp requestContact not available')
    }

    tg.requestContact((success: boolean) => {
      if (success) {
        resolve(tg.sendData(JSON.stringify({ type: 'contact_requested' })))
      } else {
        reject('Permission denied')
      }
    })
  })
}
