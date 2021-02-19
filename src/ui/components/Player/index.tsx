/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState } from 'react'
import shaka from 'shaka-player'

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
let player

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
  }, [])
  return (
    <div className={styles.player}>
      <h1>Player</h1>

      <video ref={videoRef} width="640" onTimeUpdate={handleTimeUpdate} />

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
            console.log('Clicked')
            togglePlay()
          }}
        >
          {playerState.playing ? 'Pause' : 'Play'}
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
    </div>
  )
}

export default Player
