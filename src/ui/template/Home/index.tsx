import dynamic from 'next/dynamic'
const Player = dynamic(() => import('ui/components/Player'), { ssr: false })

import config from 'config'

const Home = () => {
  const license = config.video.license
  const manifest = config.video.manifest
  const subtitle = config.video.subtitle

  return (
    <>
      <h1>Shaka player test</h1>
      <Player license={license} manifest={manifest} subtitle={subtitle} />
    </>
  )
}

export default Home
