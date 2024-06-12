import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {
  Image,
  ImageStyle,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native'
import {RichText as RichTextAPI} from '@atproto/api'
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from '@fortawesome/react-native-fontawesome'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
//import Animated from 'react-native-reanimated'
//import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'

import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {usePostShadow} from '#/state/cache/post-shadow'
//import {clamp} from 'lodash'
import {useImages} from '#/state/lightbox'
import {
  //fillThreadModerationCache,
  RQKEY as POST_THREAD_RQKEY,
  //sortThread,
  //ThreadBlocked,
  //ThreadModerationCache,
  ThreadNode,
  //ThreadNotFound,
  //ThreadPost,
  usePostThreadQuery,
} from '#/state/queries/post-thread'
//import {useSession} from '#/state/session'
import {useSetMinimalShellMode} from '#/state/shell'
import {useComposerControls} from '#/state/shell/composer'
//import {useMinimalShellFabTransform} from 'lib/hooks/useMinimalShellTransform'
//import {useWebMediaQueries} from 'lib/hooks/useWebMediaQueries'
import {
  CommonNavigatorParams,
  NativeStackScreenProps,
  NavigationProp,
} from 'lib/routes/types'
import {makeRecordUri} from 'lib/strings/url-helpers'
import {colors, s} from 'lib/styles'
//import {LightboxInner} from '../com/lightbox/Lightbox.web'
import ImageDefaultHeader from '../com/lightbox/ImageViewing/components/ImageDefaultHeader'
//import {s} from 'lib/styles'
//import {ComposePrompt} from 'view/com/composer/Prompt'
import {PostThread} from '../com/post-thread/PostThread'
import {PostCtrls} from '../com/util/post-ctrls/PostCtrls'
import {Text} from '../com/util/text/Text'
type Props = NativeStackScreenProps<CommonNavigatorParams, 'PostThreadLightbox'>

// interface ImagesLightboxItem {
//   uri: string
//   alt?: string
// }

interface Img {
  uri: string
  alt?: string
}

export function PostThreadLightboxScreen({route}: Props) {
  const queryClient = useQueryClient()
  //const {hasSession} = useSession()
  //const fabMinimalShellTransform = useMinimalShellFabTransform()
  const setMinimalShellMode = useSetMinimalShellMode()
  const {openComposer} = useComposerControls()
  //const safeAreaInsets = useSafeAreaInsets()
  const {name, rkey, page} = route.params
  const navigation = useNavigation<NavigationProp>()
  //const {isMobile} = useWebMediaQueries()
  const uri = makeRecordUri(name, 'app.bsky.feed.post', rkey)
  const {images} = useImages()
  // Convert ImagesLightboxItem[] | null to Img[]
  let earlyReturn: boolean = false

  // please get imgs properly by itself, this is a hack
  if (!images || !images[0].alt || images.length === 0) {
    navigation.replace('PostThread', {
      name: name,
      rkey: rkey,
    })
    earlyReturn = true
  }
  const imgs: Img[] = images
    ? images.map(img => ({uri: img.uri, alt: img.alt ?? ''}))
    : []

  //const [canReply, setCanReply] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      setMinimalShellMode(false)
    }, [setMinimalShellMode]),
  )

  const onPressReply = React.useCallback(() => {
    if (!uri) {
      return
    }
    const thread = queryClient.getQueryData<ThreadNode>(POST_THREAD_RQKEY(uri))
    if (thread?.type !== 'post') {
      return
    }
    openComposer({
      replyTo: {
        uri: thread.post.uri,
        cid: thread.post.cid,
        text: thread.record.text,
        author: thread.post.author,
        embed: thread.post.embed,
      },
      onPost: () =>
        queryClient.invalidateQueries({
          queryKey: POST_THREAD_RQKEY(uri),
        }),
    })
  }, [openComposer, queryClient, uri])

  const {isTabletOrMobile} = useWebMediaQueries()
  const onPressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Home')
    }
  }, [navigation])
  if (earlyReturn) {
    return null
  }
  return (
    <View style={styles.container}>
      <View style={styles.lightboxInternal}>
        <LightboxInternal
          imgs={imgs}
          initialIndex={page || 1}
          onClose={onPressBack}
        />
        <View style={styles.bottomCtrls}>
          <BottomCtrls uri={uri} onPressReply={onPressReply} />
        </View>
      </View>
      {!isTabletOrMobile ? (
        <View style={styles.postThreadInternal}>
          <PostThread
            uri={uri}
            onPressReply={onPressReply}
            onCanReply={() => false}
            imageGridDisabled={true}
          />
        </View>
      ) : (
        <></>
      )}
    </View>
  )
}
function BottomCtrls({
  uri,
  onPressReply,
}: {
  uri?: string
  onPressReply: () => void
}) {
  const {
    // isFetching,
    // isError: isThreadError,
    // error: threadError,
    // refetch,
    data: thread,
  } = usePostThreadQuery(uri)

  const rootPost = thread?.type === 'post' ? thread.post : undefined
  const rootPostRecord = thread?.type === 'post' ? thread.record : undefined

  const richText = useMemo(
    () =>
      new RichTextAPI({
        text: rootPostRecord.text,
        facets: rootPostRecord.facets,
      }),
    [rootPostRecord],
  )

  const postShadowed = usePostShadow(rootPost)

  return (
    <PostCtrls
      big
      post={postShadowed}
      record={rootPostRecord}
      richText={richText}
      onPressReply={onPressReply}
      logContext="PostThreadItem"
    />
  )
}

function LightboxInternal({
  imgs,
  initialIndex = 0,
  onClose,
}: {
  imgs: Img[]
  initialIndex: number
  onClose: () => void
}) {
  const {_} = useLingui()
  const [index, setIndex] = useState<number>(initialIndex - 1)
  const [isAltExpanded, setAltExpanded] = useState(false)

  const canGoLeft = index >= 1
  const canGoRight = index < imgs.length - 1
  const onPressLeft = useCallback(() => {
    if (canGoLeft) {
      setIndex(index - 1)
    }
  }, [index, canGoLeft])
  const onPressRight = useCallback(() => {
    if (canGoRight) {
      setIndex(index + 1)
    }
  }, [index, canGoRight])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        onPressLeft()
      } else if (e.key === 'ArrowRight') {
        onPressRight()
      }
    },
    [onClose, onPressLeft, onPressRight],
  )

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onKeyDown])

  const {isTabletOrDesktop} = useWebMediaQueries()
  const btnStyle = React.useMemo(() => {
    return isTabletOrDesktop ? styles.btnTablet : styles.btnMobile
  }, [isTabletOrDesktop])
  const iconSize = React.useMemo(() => {
    return isTabletOrDesktop ? 32 : 24
  }, [isTabletOrDesktop])

  return (
    <View style={styles.mask}>
      <TouchableWithoutFeedback
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={_(msg`Close image viewer`)}
        accessibilityHint={_(msg`Exits image view`)}
        onAccessibilityEscape={onClose}>
        <View style={styles.imageCenterer}>
          <Image
            accessibilityIgnoresInvertColors
            source={imgs[index]}
            style={styles.image as ImageStyle}
            accessibilityLabel={imgs[index].alt ?? ''}
            accessibilityHint=""
          />
          {canGoLeft && (
            <TouchableOpacity
              onPress={onPressLeft}
              style={[
                styles.btn,
                btnStyle,
                styles.leftBtn,
                styles.blurredBackground,
              ]}
              accessibilityRole="button"
              accessibilityLabel={_(msg`Previous image`)}
              accessibilityHint="">
              <FontAwesomeIcon
                icon="angle-left"
                style={styles.icon as FontAwesomeIconStyle}
                size={iconSize}
              />
            </TouchableOpacity>
          )}
          {canGoRight && (
            <TouchableOpacity
              onPress={onPressRight}
              style={[
                styles.btn,
                btnStyle,
                styles.rightBtn,
                styles.blurredBackground,
              ]}
              accessibilityRole="button"
              accessibilityLabel={_(msg`Next image`)}
              accessibilityHint="">
              <FontAwesomeIcon
                icon="angle-right"
                style={styles.icon as FontAwesomeIconStyle}
                size={iconSize}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
      {imgs[index].alt ? (
        <View style={styles.footer}>
          <Pressable
            accessibilityLabel={_(msg`Expand alt text`)}
            accessibilityHint={_(
              msg`If alt text is long, toggles alt text expanded state`,
            )}
            onPress={() => {
              setAltExpanded(!isAltExpanded)
            }}>
            <Text
              style={s.white}
              numberOfLines={isAltExpanded ? 0 : 3}
              ellipsizeMode="tail">
              {imgs[index].alt}
            </Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.closeBtn}>
        <ImageDefaultHeader onRequestClose={onClose} />
      </View>
    </View>
  )
}

// <View style={s.hContentRegion}>
//   <View style={s.flex1}>
//     <PostThreadLightbox
//       uri={uri}
//       onPressReply={onPressReply}
//       onCanReply={setCanReply}
//     />
//   </View>
//   {isMobile && canReply && hasSession && (
//     <Animated.View
//       style={[
//         styles.prompt,
//         fabMinimalShellTransform,
//         {
//           bottom: clamp(safeAreaInsets.bottom, 15, 30),
//         },
//       ]}>
//       <ComposePrompt onPressCompose={onPressReply} />
//     </Animated.View>
//   )}
// </View>
//  )
//}

// const styles = StyleSheet.create({
//   prompt: {
//     // @ts-ignore web-only
//     position: isWeb ? 'fixed' : 'absolute',
//     left: 0,
//     right: 0,
//   },
// })

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  postThreadInternal: {
    width: 370,
    height: '100%',
  },
  lightboxInternal: {
    top: 0,
    left: 0,
    flex: 1,
    // @ts-ignore web only
    height: '100dvh',
    // @ts-ignore web only
    position: 'sticky',
    backgroundColor: '#000',
  },
  bottomCtrls: {
    maxWidth: '90%',
    width: 500,
    paddingVertical: 8,
    marginHorizontal: 'auto',
  },
  mask: {
    // @ts-ignore
    //position: 'fixed',
    top: 0,
    left: 0,
    //width: '100%',
    // @ts-ignore web only
    //height: '100%',
    flex: 1,
    backgroundColor: '#000c',
  },
  imageCenterer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  icon: {
    color: colors.white,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  btn: {
    position: 'absolute',
    backgroundColor: '#00000077',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTablet: {
    width: 50,
    height: 50,
    borderRadius: 25,
    left: 30,
    right: 30,
  },
  btnMobile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    left: 20,
    right: 20,
  },
  leftBtn: {
    right: 'auto',
    top: '50%',
  },
  rightBtn: {
    left: 'auto',
    top: '50%',
  },
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: colors.black,
  },
  blurredBackground: {
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  } as ViewStyle,
})
