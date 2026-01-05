import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      console.log('beforeinstallprompt fired!')  // ✅ check console
      alert('PWA install event detected!')      // ✅ ye sirf event ke time
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log('User choice:', choiceResult.outcome)
      setDeferredPrompt(null)
    })
  }

  if (!deferredPrompt) return null

  return (
    <button
      onClick={handleInstall}
      style={{
        padding: '10px 20px',
        background: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: 5,
        cursor: 'pointer',
        marginBottom: 10
      }}
    >
      Install Rice Farming App
    </button>
  )
}
