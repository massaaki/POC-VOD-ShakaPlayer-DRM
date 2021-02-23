/* eslint-disable react-hooks/exhaustive-deps */
import { loadImaSdk, google } from '@alugha/ima'
import { useRef, useEffect, useState } from 'react'
import shaka from 'shaka-player'
// import importScript from 'utils/importScript'

import styles from './styles.module.scss'

export enum DrmType {
  widevine = 'widevine',
  playready = 'playready'
}

export type PlayerProps = {
  manifest: string
  license: string
  subtitle: string
  type?: DrmType
}

const NEXT_ADS_STARTS_IN = 2500

//Global vars
let player //contentVideo
let ima
let adsManager: google.ima.AdsManager
let adsLoader: google.ima.AdsLoader
let adDisplayContainer: google.ima.AdDisplayContainer
let intervalTimer

// player hook
function usePlayerState(videoRef) {
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0
  })

  useEffect(() => {
    console.log('player')
  }, [videoRef])

  async function configurePlayer(manifest, license, subtitle) {
    console.log('initialize player')
    player = new shaka.Player(videoRef.current)
    if (videoRef.current !== null) {
      // player.addEventListener('error', onErrorEvent)
      player.configure({
        drm: {
          servers: {
            'com.widevine.alpha': license
          },
          advanced: {
            'com.widevine.alpha': {
              videoRobustness: 'SW_SECURE_CRYPTO',
              audioRobustness: 'SW_SECURE_CRYPTO'
            }
          }
        },
        preferredTextLanguage: 'pt-br'
      })

      await player.load(manifest)

      console.log('loaded video')
      console.log(subtitle)
      await addSubtitleToVideo(
        subtitle,
        'pt-br',
        'subtitle',
        'text/vtt',
        '',
        'Português'
      )
      console.log('getConfiguration..:', player.getConfiguration())
      console.log('getTextTracks..:', player.getTextTracks())

      console.log('player..:', player)
    }
  }

  //Add Text Track
  const addSubtitleToVideo = async (
    subtitle,
    language: string,
    kind = 'subtitle',
    mine = 'text/vtt',
    codec = '',
    label: string
  ) => {
    console.log('addSubtitleToVideo...', subtitle)
    await player.addTextTrack(subtitle, language, kind, mine, codec, label)
  }

  // Add subtitle
  const findTextTrack = async (language) => {
    const track = await player.getTextTracks().filter((t) => {
      return t.language === language
    })

    console.log('track found..:', track)
    addSubtitle(track)
  }

  const addSubtitle = (track) => {
    player.selectTextTrack(track)
    player.setTextTrackVisibility(true)
    console.log('Legenda adicionada!')
  }

  useEffect(() => {
    console.log('playerState..:', playerState.playing)
    playerState.playing ? videoRef.current.play() : videoRef.current.pause()
  }, [playerState.playing])

  function togglePlay() {
    console.log('toggle play called', videoRef)
    setPlayerState({
      ...playerState,
      playing: !playerState.playing
    })
  }

  function handleTimeUpdate() {
    setPlayerState({
      ...playerState,
      currentTime: videoRef.current.currentTime
    })
  }
  function handleChangeVideoCurrentTimeManualy(event) {
    console.log(event.target.value)
    setPlayerState({
      ...playerState,
      currentTime: event.target.value
    })
    videoRef.current.currentTime = event.target.value
  }

  return {
    playerState,
    configurePlayer,
    findTextTrack,
    togglePlay,
    handleTimeUpdate,
    handleChangeVideoCurrentTimeManualy
  }
}

//Component
const Player = ({ manifest, license, subtitle }: PlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>()
  const adContainerRef = useRef()

  const {
    playerState,
    configurePlayer,
    findTextTrack,
    togglePlay,
    handleTimeUpdate,
    handleChangeVideoCurrentTimeManualy
  } = usePlayerState(videoRef)

  useEffect(() => {
    configurePlayer(manifest, license, subtitle)

    //Initialize IMA
    initializeIMA()
  }, [])

  const initializeIMA = async () => {
    try {
      ima = await loadImaSdk()
      adDisplayContainer = new ima.AdDisplayContainer(adContainerRef.current)
      adDisplayContainer.initialize()

      console.log('IMA Initialized')

      const adsRequest = new ima.AdsRequest()
      adsRequest.adTagUrl =
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/22106339974/test-netmovies&description_url=http%3A%2F%2Fnetmovies.com.br&tfcd=0&npa=0&sz=640x480&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='
      // select the correct creative if multiple are returned.
      adsRequest.linearAdSlotWidth = 640
      adsRequest.linearAdSlotHeight = 400

      adsRequest.nonLinearAdSlotWidth = 640
      adsRequest.nonLinearAdSlotHeight = 150

      adsLoader = new ima.AdsLoader(adDisplayContainer)
      console.log('adsLoader created')
      // Listen and respond to ads loaded and error events.
      adsLoader.addEventListener(
        ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false
      )
      adsLoader.addEventListener(
        ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false
      )
    } catch (err) {
      console.log('Check your adblocker', err)
    }
  }

  function onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    console.log('event listener..: onAdsManagerLoaded')

    const adsRenderingSettings = new ima.AdsRenderingSettings()
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true
    // videoContent should be set to the content video element.
    adsManager = adsManagerLoadedEvent.getAdsManager(
      videoRef.current,
      adsRenderingSettings
    )

    // Add listeners to the required events.
    adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, onAdError)
    adsManager.addEventListener(
      ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested
    )
    adsManager.addEventListener(
      ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested
    )
    adsManager.addEventListener(ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent)

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(ima.AdEvent.Type.LOADED, onAdEvent)
    adsManager.addEventListener(ima.AdEvent.Type.STARTED, onAdEvent)
    adsManager.addEventListener(ima.AdEvent.Type.COMPLETE, onAdEvent)

    console.log('adsManager..:', adsManager)
  }
  function onContentPauseRequested() {
    videoRef.current.pause()
  }
  function onContentResumeRequested() {
    videoRef.current.play()
  }

  function onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    const ad = adEvent.getAd()
    switch (adEvent.type) {
      case ima.AdEvent.Type.LOADED:
        console.log('ima-events::Loaded')
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          // Use ad.width and ad.height.
          videoRef.current.play()
        }
        break
      case ima.AdEvent.Type.STARTED:
        console.log('ima-events::started')
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          intervalTimer = setInterval(function () {
            const remainingTime = adsManager.getRemainingTime()
          }, 300) // every 300ms
        }
        break
      case ima.AdEvent.Type.COMPLETE:
        console.log('ima-events::complete')
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        if (ad.isLinear()) {
          clearInterval(intervalTimer)
        }

        reloadAds()

        break
    }
  }

  function reloadAds() {
    if (adsLoader) {
      adsLoader.contentComplete()
    }

    const adsRequest = new ima.AdsRequest()
    adsRequest.adTagUrl =
      'https://pubads.g.doubleclick.net/gampad/ads?iu=/22106339974/test-netmovies&description_url=http%3A%2F%2Fnetmovies.com.br&tfcd=0&npa=0&sz=640x480&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='

    adsLoader.requestAds(adsRequest)

    setTimeout(() => {
      console.log('Started Ads again...')
      playAds()
    }, NEXT_ADS_STARTS_IN)
  }

  function playAds() {
    // Initialize the container. Must be done via a user action on mobile devices.
    videoRef.current.load()
    adDisplayContainer.initialize()

    console.log('playAds')

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      console.log('adsManager.init..:', ima.ViewMode.NORMAL)
      adsManager.init(640, 360, ima.ViewMode.NORMAL)
      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      adsManager.start()
    } catch (adError) {
      console.log('adError', adError)
      // console.log(adErrorEvent.getError().toString())
      // An error may be thrown if there was a problem with the VAST response.
      videoRef.current.play()
    }
  }

  function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent)
    console.log(adErrorEvent.getError())

    if (adsManager) {
      adsManager.destroy()
    }
  }

  return (
    <div className={styles.player}>
      <h1>Player</h1>

      <div className={styles.actions}>
        <button
          onClick={() => {
            console.log('Clicked')
            togglePlay()
          }}
        >
          {playerState.playing ? 'Pause' : 'Play'}
        </button>
        <button id="playButton" onClick={playAds}>
          Play Ads
        </button>

        <button
          onClick={() => {
            videoRef.current.currentTime = videoRef.current.currentTime + 30 // +30 seconds
          }}
        >
          + 30s
        </button>

        <button onClick={() => findTextTrack('pt-br')}>LEGENDA: pt-br</button>
        <button onClick={() => videoRef.current.requestFullscreen()}>
          Full Screen
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.content} id="contentElement">
          <video ref={videoRef} width="640" onTimeUpdate={handleTimeUpdate} />
          <div ref={adContainerRef} id={styles.adContainer}></div>
          {/* <div id="adContainer"></div> */}
        </div>
      </div>
      <p>
        currentTime..:
        {new Date(playerState.currentTime * 1000).toISOString().substr(11, 8)}
      </p>
      {videoRef.current && videoRef.current?.duration && (
        <p>
          TotalTime..:
          {new Date(videoRef.current?.duration * 1000)
            .toISOString()
            .substr(11, 8)}
        </p>
      )}
      {videoRef.current && videoRef.current?.duration && (
        <input
          type="range"
          value={playerState.currentTime}
          min="0"
          max={videoRef.current.duration}
          onChange={handleChangeVideoCurrentTimeManualy}
          style={{ width: '640px' }}
        />
      )}
    </div>
  )
}

export default Player
