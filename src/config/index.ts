interface IConfigurations {
  adTagUrl: string
  video: {
    license: string
    manifest: string
    subtitle: string
  }
}

const config: IConfigurations = {
  adTagUrl: process.env.NEXT_PUBLIC_AD_TAG_URL,
  video: {
    license: process.env.NEXT_PUBLIC_PLAYER_LICENSE,
    manifest: process.env.NEXT_PUBLIC_PLAYER_MANIFEST,
    subtitle: process.env.NEXT_PUBLIC_PLAYER_SUBTITLE
  }
}

export default config
