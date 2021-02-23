/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState } from 'react'
import shaka from 'shaka-player'
import { loadImaSdk } from 'utils/ads'
import type { google } from 'utils/ads/ima'

import config from 'config'

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

//Global var
const NEXT_ADS_STARTS_IN = 1000 * 10
let player
let ima
let adsLoader
let adsRequest: google.ima.AdsRequest
let adsManager: google.ima.AdsManager
let adDisplayContainer
const adsLoaded = false
let intervalTimer
// let adDisplayContainer: google.ima.AdDisplayContainer

// player hook
function usePlayerState(videoRef) {
  const [playerState, setPlayerState] = useState({
    playing: false,
    currentTime: 0
  })

  // useEffect(() => {}, [videoRef])

  async function configurePlayer(manifest, license, subtitle) {
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

      await addSubtitleToVideo(
        subtitle,
        'pt-br',
        'subtitle',
        'text/vtt',
        '',
        'Português'
      )
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
    await player.addTextTrack(subtitle, language, kind, mine, codec, label)
  }

  // Add subtitle
  const findTextTrack = async (language) => {
    const track = await player.getTextTracks().filter((t) => {
      return t.language === language
    })

    console.log('track..:', track)

    addSubtitle(track)
  }

  const addSubtitle = (track) => {
    player.selectTextTrack(track)
    player.setTextTrackVisibility(true)
  }

  useEffect(() => {
    playerState.playing ? videoRef.current.play() : videoRef.current.pause()
  }, [playerState.playing])

  function togglePlay() {
    console.log(videoRef)
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
    setPlayerState({
      ...playerState,
      currentTime: event.target.value
    })
    videoRef.current.currentTime = event.target.value
  }

  async function initializeIma() {
    ima = await loadImaSdk()
    console.log('loaded IMA sdk..:', ima)
  }

  return {
    playerState,
    configurePlayer,
    findTextTrack,
    togglePlay,
    handleTimeUpdate,
    handleChangeVideoCurrentTimeManualy,
    initializeIma
  }
}

function usePlayerAds(videoRef, adContainerRef) {
  async function initializeIma() {
    ima = await loadImaSdk()
    console.log('loaded IMA sdk..:', ima)
    adDisplayContainer = new google.ima.AdDisplayContainer(
      adContainerRef.current,
      videoRef.current
    )

    console.log('adDisplayContainer..: ', adDisplayContainer)
    adsLoader = new google.ima.AdsLoader(adDisplayContainer)
    console.log('adLoader..:', adsLoader)

    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    )
    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    )

    videoRef.current.addEventListener('ended', function () {
      adsLoader.contentComplete()
      console.log('add event to control ended video')
    })

    adsRequest = new google.ima.AdsRequest()
    adsRequest.adTagUrl = config.adTagUrl

    adsRequest.linearAdSlotWidth = videoRef.current.clientWidth
    adsRequest.linearAdSlotHeight = videoRef.current.clientHeight
    adsRequest.nonLinearAdSlotWidth = videoRef.current.clientWidth
    adsRequest.nonLinearAdSlotHeight = videoRef.current.clientHeight / 3

    adsLoader.requestAds(adsRequest)
    console.log('**** IMA has been initialized ****')
  }

  function onAdsManagerLoaded(adsManagerLoadedEvent) {
    console.log('called onAdsManagerLoaded')
    adsManager = adsManagerLoadedEvent.getAdsManager(videoRef.current)
    adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError
    )

    adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested
    )
    adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested
    )
    // adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded)

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdEvent)
    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent)
    adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent)
    adsManager.addEventListener(google.ima.AdEvent.Type.SKIPPED, onAdEvent)
  }

  function onAdEvent(adEvent) {
    const ad = adEvent.getAd()
    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
        console.log('ima-events::Loaded')
        if (!ad.isLinear()) {
          videoRef.current.play()
        }
        break
      case google.ima.AdEvent.Type.STARTED:
        console.log('ima-events::started')
        if (ad.isLinear()) {
          intervalTimer = setInterval(function () {
            adsManager.getRemainingTime()
          }, 1000) // every 1s
        }
        break
      case google.ima.AdEvent.Type.COMPLETE:
        console.log('ima-events::complete')
        if (ad.isLinear()) {
          clearInterval(intervalTimer)
        }
        reloadAds()
        break
      case google.ima.AdEvent.Type.SKIPPED:
        console.log('ima-events::SKIPPED')
        if (ad.isLinear()) {
          clearInterval(intervalTimer)
        }
        reloadAds()
        break
    }
  }

  function onContentPauseRequested() {
    videoRef.current.pause()
  }

  function onContentResumeRequested() {
    videoRef.current.play()
  }
  function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError())
    if (adsManager) {
      adsManager.destroy()
    }
  }

  function loadAds() {
    console.log('loading ads')
    // Initialize the container. Must be done via a user action on mobile devices.
    // videoRef.current.load()
    adDisplayContainer.initialize()

    const width = videoRef.current.clientWidth
    const height = videoRef.current.clientHeight
    try {
      adsManager.init(width, height, google.ima.ViewMode.NORMAL)
      adsManager.start()
    } catch (adError) {
      // Play the video without ads, if an error occurs
      console.log('AdsManager could not be started')
      videoRef.current.play()
    }
  }

  function reloadAds() {
    if (adsLoader) {
      adsLoader.contentComplete()
    }

    const adsRequest = new google.ima.AdsRequest()
    adsRequest.adTagUrl =
      'https://pubads.g.doubleclick.net/gampad/ads?iu=/22106339974/test-netmovies&description_url=http%3A%2F%2Fnetmovies.com.br&tfcd=0&npa=0&sz=640x480&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='

    adsLoader.requestAds(adsRequest)

    setTimeout(() => {
      console.log('Started Ads again...')
      loadAds()
    }, NEXT_ADS_STARTS_IN)
  }

  return {
    initializeIma,
    loadAds
  }
}

//Component
const Player = ({ manifest, license, subtitle }: PlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>()
  const adContainerRef = useRef<HTMLDivElement>()
  const { initializeIma, loadAds } = usePlayerAds(videoRef, adContainerRef)
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
    initializeIma()
  }, [])

  return (
    <div className={styles.player}>
      <h1>Player</h1>

      <video ref={videoRef} width="640" onTimeUpdate={handleTimeUpdate} />
      <div className={styles.adContainer} ref={adContainerRef}></div>

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

      <div>
        <button
          onClick={() => {
            togglePlay()
          }}
        >
          {playerState.playing ? 'Pause' : 'Play'}
        </button>
        <button onClick={loadAds}>Load Ads</button>

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
    </div>
  )
}

export default Player
