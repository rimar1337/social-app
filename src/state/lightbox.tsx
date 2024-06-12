import React from 'react'
import {AppBskyActorDefs} from '@atproto/api'

import {useNonReactiveCallback} from '#/lib/hooks/useNonReactiveCallback'
//import { useNavigation } from '@react-navigation/native' // Import the useNavigation hook from React Navigation
//import { NavigationProp } from '#/lib/routes/types'

interface Lightbox {
  name: string
}

export class ProfileImageLightbox implements Lightbox {
  name = 'profile-image'
  constructor(public profile: AppBskyActorDefs.ProfileViewDetailed) {}
}

interface ImagesLightboxItem {
  uri: string
  alt?: string
}

export class ImagesLightbox implements Lightbox {
  name = 'images'
  constructor(
    public images: ImagesLightboxItem[],
    public index: number,
    public handle?: string,
    public rkey?: string,
  ) {}
  setIndex(index: number) {
    this.index = index
  }
}

const LightboxContext = React.createContext<{
  activeLightbox: Lightbox | null
}>({
  activeLightbox: null,
})

const LightboxControlContext = React.createContext<{
  openLightbox: (lightbox: Lightbox) => void
  closeLightbox: () => boolean
}>({
  openLightbox: () => {},
  closeLightbox: () => false,
})

const ImagesContext = React.createContext<{
  images: ImagesLightboxItem[] | null
  setImages: React.Dispatch<React.SetStateAction<ImagesLightboxItem[] | null>>
}>({
  images: null,
  setImages: () => {},
})

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [activeLightbox, setActiveLightbox] = React.useState<Lightbox | null>(
    null,
  )
  const [images, setImages] = React.useState<ImagesLightboxItem[] | null>(null)
  //const navigation = useNavigation<NavigationProp>() // Get the navigation object

  const openLightbox = useNonReactiveCallback((lightbox: Lightbox) => {
    if (
      lightbox instanceof ImagesLightbox &&
      lightbox.handle &&
      lightbox.rkey
    ) {
      setImages(lightbox.images)
    } else if (lightbox instanceof ImagesLightbox) {
      setActiveLightbox(lightbox)
      setImages(lightbox.images)
    } else if (lightbox instanceof ProfileImageLightbox) {
      setActiveLightbox(lightbox)
    }
  })

  const closeLightbox = useNonReactiveCallback(() => {
    let wasActive = !!activeLightbox
    setActiveLightbox(null)
    return wasActive
  })

  const lightboxState = React.useMemo(
    () => ({
      activeLightbox,
    }),
    [activeLightbox],
  )

  const lightboxMethods = React.useMemo(
    () => ({
      openLightbox,
      closeLightbox,
    }),
    [openLightbox, closeLightbox],
  )

  const imagesState = React.useMemo(
    () => ({
      images,
      setImages,
    }),
    [images, setImages],
  )

  return (
    <LightboxContext.Provider value={lightboxState}>
      <LightboxControlContext.Provider value={lightboxMethods}>
        <ImagesContext.Provider value={imagesState}>
          {children}
        </ImagesContext.Provider>
      </LightboxControlContext.Provider>
    </LightboxContext.Provider>
  )
}

export function useLightbox() {
  return React.useContext(LightboxContext)
}

export function useLightboxControls() {
  return React.useContext(LightboxControlContext)
}

export function useImages() {
  return React.useContext(ImagesContext)
}
