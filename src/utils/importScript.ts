import { useEffect } from 'react'

const importScript = (scriptUrl: string) => {
  useEffect(() => {
    console.log('add script...')
    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [scriptUrl])
}

export default importScript
