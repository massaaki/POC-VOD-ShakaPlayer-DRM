import { AppProps } from 'next/app'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as gtag from '../../lib/gtag'

import 'themes/global.scss'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return <Component {...pageProps} />
}

export default MyApp
