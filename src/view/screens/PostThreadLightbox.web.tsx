import React, {useEffect, useMemo, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {
  AppBskyFeedDefs,
  AppBskyFeedPost,
  RichText as RichTextAPI,
} from '@atproto/api'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'

import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {POST_TOMBSTONE, usePostShadow} from '#/state/cache/post-shadow'
import {useImages} from '#/state/lightbox'
import {
  RQKEY as POST_THREAD_RQKEY,
  ThreadNode,
  usePostThreadQuery,
} from '#/state/queries/post-thread'
import {useSetMinimalShellMode} from '#/state/shell'
import {useComposerControls} from '#/state/shell/composer'
import {
  CommonNavigatorParams,
  NativeStackScreenProps,
  NavigationProp,
} from 'lib/routes/types'
import {makeRecordUri} from 'lib/strings/url-helpers'
import ImageDefaultHeader from '../com/lightbox/ImageViewing/components/ImageDefaultHeader'
import {LightboxInner} from '../com/lightbox/Lightbox.web'
import {PostThread} from '../com/post-thread/PostThread'
import {PostCtrls} from '../com/util/post-ctrls/PostCtrls'
type Props = NativeStackScreenProps<CommonNavigatorParams, 'PostThreadLightbox'>

interface Img {
  uri: string
  alt?: string
}

export function PostThreadLightboxScreen({route}: Props) {
  const queryClient = useQueryClient()
  const setMinimalShellMode = useSetMinimalShellMode()
  const {openComposer} = useComposerControls()
  const {name, rkey, page} = route.params
  const navigation = useNavigation<NavigationProp>()
  const uri = makeRecordUri(name, 'app.bsky.feed.post', rkey)
  const {images} = useImages()
  let earlyReturn: boolean = false
  const [toggle, setToggle] = useState(true)

  if (!images || images.length === 0) {
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
        <LightboxInner
          imgs={imgs}
          initialIndex={page ? page - 1 : 0}
          onClose={onPressBack}
          PostThread
        />
        <View style={[styles.toggleBtn]}>
          <ImageDefaultHeader
            onRequestClose={() => setToggle(!toggle)}
            toggle={toggle}
          />
        </View>
        <View style={styles.bottomCtrls}>
          <BottomCtrlsWrapper uri={uri} onPressReply={onPressReply} />
        </View>
      </View>
      {!isTabletOrMobile && toggle ? (
        <View style={styles.postThreadInternal}>
          <PostThread
            uri={uri}
            onPressReply={onPressReply}
            onCanReply={() => true}
            imageGridDisabled={true}
          />
        </View>
      ) : null}
    </View>
  )
}
interface BottomCtrlsProps {
  uri?: string
  onPressReply: () => void
}
interface BottomCtrlsWrapperProps {
  uri?: string
  onPressReply: () => void
}

const BottomCtrlsWrapper: React.FC<BottomCtrlsWrapperProps> = ({
  uri,
  onPressReply,
}) => {
  const {data: thread} = usePostThreadQuery(uri)
  const [rootPost, setRootPost] = useState<AppBskyFeedDefs.PostView | null>(
    null,
  )
  const [rootPostRecord, setRootPostRecord] =
    useState<AppBskyFeedPost.Record | null>(null)

  useEffect(() => {
    if (thread?.type === 'post') {
      setRootPost(thread.post)
      setRootPostRecord(thread.record)
    }
  }, [thread])

  if (!rootPost || !rootPostRecord) {
    return null
  }
  return (
    <BottomCtrls
      rootPost={rootPost}
      rootPostRecord={rootPostRecord}
      onPressReply={onPressReply}
    />
  )
}

interface BottomCtrlsProps {
  rootPost: AppBskyFeedDefs.PostView
  rootPostRecord: AppBskyFeedPost.Record
  onPressReply: () => void
}

const BottomCtrls: React.FC<BottomCtrlsProps> = ({
  rootPost,
  rootPostRecord,
  onPressReply,
}) => {
  const richText = useMemo(() => {
    return new RichTextAPI({
      text: rootPostRecord.text || '',
      facets: rootPostRecord.facets || [],
    })
  }, [rootPostRecord])

  const postShadowed = usePostShadow(rootPost)

  if (!postShadowed || postShadowed === POST_TOMBSTONE) {
    return null
  }
  return (
    <PostCtrls
      big
      white={true}
      post={postShadowed}
      record={rootPostRecord}
      richText={richText}
      onPressReply={onPressReply}
      logContext="PostThreadItem"
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  postThreadInternal: {
    width: 350,
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
  toggleBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
})
