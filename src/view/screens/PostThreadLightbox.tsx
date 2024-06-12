import React from 'react' //  useEffect
import {LayoutAnimation, StyleSheet, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import * as MediaLibrary from 'expo-media-library'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useFocusEffect, useNavigation} from '@react-navigation/native'

import {
  CommonNavigatorParams,
  NativeStackScreenProps,
  NavigationProp,
} from '#/lib/routes/types'
import {
  //ImagesLightbox,
  //ProfileImageLightbox,
  useImages,
  //useLightbox,
  //useLightboxControls,
} from '#/state/lightbox'
import {useSetMinimalShellMode} from '#/state/shell/minimal-mode'
//import { useShellLayout } from '#/state/shell/shell-layout'
import {saveImageToMediaLibrary, shareImageModal} from 'lib/media/manip'
import {colors, s} from 'lib/styles'
import {isIOS} from 'platform/detection'
import ImageView from '../com/lightbox/ImageViewing'
import {Button} from '../com/util/forms/Button'
import {Text} from '../com/util/text/Text'
import * as Toast from '../com/util/Toast'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'PostThreadLightbox'>

interface Img {
  uri: string
  alt?: string
}
export function PostThreadLightboxScreen({route}: Props) {
  const {name, rkey, page} = route.params
  const {images} = useImages()
  const navigation = useNavigation<NavigationProp>()
  // Convert ImagesLightboxItem[] | null to Img[]
  let earlyReturn: boolean = false

  // please get imgs properly by itself, this is a hack
  if (
    !images ||
    //!images[0].alt ||
    images.length === 0
  ) {
    navigation.replace('PostThread', {
      name: name,
      rkey: rkey,
    })
    earlyReturn = true
  }
  const imgs: Img[] = images
    ? images.map(img => ({uri: img.uri, alt: img.alt ?? ''}))
    : []

  const onPressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Home')
    }
  }, [navigation])

  const setMinimalShellMode = useSetMinimalShellMode()
  const {top: topInset} = useSafeAreaInsets()

  useFocusEffect(
    React.useCallback(() => {
      setMinimalShellMode(true)
    }, [setMinimalShellMode]),
  )

  //const {activeLightbox} = useLightbox()
  // const {closeLightbox} = useLightboxControls()
  // const onClose = React.useCallback(() => {
  //   closeLightbox()
  // }, [closeLightbox])

  // if (!activeLightbox) {
  //   return null
  // } else if (activeLightbox.name === 'profile-image') {
  //   const opts = activeLightbox as ProfileImageLightbox
  //   return (
  //     <ImageView
  //       images={[{uri: opts.profile.avatar || ''}]}
  //       initialImageIndex={0}
  //       visible
  //       onRequestClose={onClose}
  //       FooterComponent={LightboxFooter}
  //     />
  //   )
  // } else if (activeLightbox.name === 'images') {
  //   const opts = activeLightbox as ImagesLightbox
  //   return (
  //     <ImageView
  //       images={opts.images.map(img => ({...img}))}
  //       initialImageIndex={opts.index}
  //       visible
  //       onRequestClose={onClose}
  //       FooterComponent={LightboxFooter}
  //     />
  //   )
  // } else {
  //   return null
  // }
  if (earlyReturn) {
    return null
  }
  return (
    <View
      style={[
        styles.container,
        // todo find where the extra top inset is coming from
        {marginTop: topInset * -1},
      ]}>
      <ImageView
        images={imgs.map(img => ({...img}))}
        initialImageIndex={page ? page - 1 : 0}
        visible
        onRequestClose={onPressBack}
        FooterComponent={LightboxFooter}
      />
    </View>
  )
}

function LightboxFooter({imageIndex}: {imageIndex: number}) {
  const {_} = useLingui()
  //const {activeLightbox} = useLightbox()
  const [isAltExpanded, setAltExpanded] = React.useState(false)
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()
  const {images} = useImages()
  // Convert ImagesLightboxItem[] | null to Img[]
  const imgs: Img[] = images
    ? images.map(img => ({uri: img.uri, alt: img.alt ?? ''}))
    : []

  const saveImageToAlbumWithToasts = React.useCallback(
    async (uri: string) => {
      if (!permissionResponse || permissionResponse.granted === false) {
        Toast.show(_(msg`Permission to access camera roll is required.`))
        if (permissionResponse?.canAskAgain) {
          requestPermission()
        } else {
          Toast.show(
            _(
              msg`Permission to access camera roll was denied. Please enable it in your system settings.`,
            ),
          )
        }
        return
      }

      try {
        await saveImageToMediaLibrary({uri})
        Toast.show(_(msg`Saved to your camera roll`))
      } catch (e: any) {
        Toast.show(_(msg`Failed to save image: ${String(e)}`))
      }
    },
    [permissionResponse, requestPermission, _],
  )

  // const lightbox = activeLightbox
  // if (!lightbox) {
  //   return null
  // }

  let altText = ''
  let uri = ''
  // if (lightbox.name === 'images') {
  //   const opts = lightbox as ImagesLightbox
  //   uri = opts.images[imageIndex].uri
  //   altText = opts.images[imageIndex].alt || ''
  // } else if (lightbox.name === 'profile-image') {
  //   const opts = lightbox as ProfileImageLightbox
  //   uri = opts.profile.avatar || ''
  // }

  uri = imgs[imageIndex].uri
  altText = imgs[imageIndex].alt || ''

  return (
    <View style={[styles.footer]}>
      {altText ? (
        <View accessibilityRole="button" style={styles.footerText}>
          <Text
            style={[s.gray3]}
            numberOfLines={isAltExpanded ? undefined : 3}
            selectable
            onPress={() => {
              LayoutAnimation.configureNext({
                duration: 300,
                update: {type: 'spring', springDamping: 0.7},
              })
              setAltExpanded(prev => !prev)
            }}
            onLongPress={() => {}}>
            {altText}
          </Text>
        </View>
      ) : null}
      <View style={styles.footerBtns}>
        <Button
          type="primary-outline"
          style={styles.footerBtn}
          onPress={() => saveImageToAlbumWithToasts(uri)}>
          <FontAwesomeIcon icon={['far', 'floppy-disk']} style={s.white} />
          <Text type="xl" style={s.white}>
            <Trans context="action">Save</Trans>
          </Text>
        </Button>
        <Button
          type="primary-outline"
          style={styles.footerBtn}
          onPress={() => shareImageModal({uri})}>
          <FontAwesomeIcon icon="arrow-up-from-bracket" style={s.white} />
          <Text type="xl" style={s.white}>
            <Trans context="action">Share</Trans>
          </Text>
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: 16,
    paddingBottom: isIOS ? 40 : 24,
    paddingHorizontal: 24,
    backgroundColor: '#000d',
  },
  footerText: {
    paddingBottom: isIOS ? 20 : 16,
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderColor: colors.white,
  },
  container: {
    backgroundColor: 'black',
    height: '100%',
  },
})
