import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  RichText as RichTextAPI,
} from '@atproto/api'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {useQueryClient} from '@tanstack/react-query'

import {useWebMediaQueries} from '#/lib/hooks/useWebMediaQueries'
import {POST_TOMBSTONE, usePostShadow} from '#/state/cache/post-shadow'
import {
  RQKEY as POST_THREAD_RQKEY,
  ThreadNode,
  usePostThreadQuery,
} from '#/state/queries/post-thread'
import {useSetMinimalShellMode} from '#/state/shell'
import {useComposerControls} from '#/state/shell/composer'
import {useIsSidebarOpen, useSetSidebarOpen} from '#/state/shell/sidebar-open'
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
  const uri = makeRecordUri(name, 'app.bsky.feed.post', rkey)
  let earlyReturn: boolean = false
  const {isTabletOrMobile} = useWebMediaQueries()
  const isSidebarOpen = useIsSidebarOpen()
  const setSidebarOpen = useSetSidebarOpen()

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

  if (earlyReturn) {
    return null
  }
  return (
    <View style={styles.container}>
      <View style={styles.lightboxInternal}>
        <View style={{flex: 1}}>
          <PostThreadFetcher uri={uri} page={page ? page - 1 : 0} />
        </View>
        {!isTabletOrMobile && (
          <>
            <View style={[styles.toggleBtn]}>
              <ImageDefaultHeader
                onRequestClose={() => setSidebarOpen(!isSidebarOpen)}
                sidebarToggle={isSidebarOpen}
              />
            </View>
            <View style={styles.bottomCtrls}>
              <BottomCtrlsWrapper uri={uri} onPressReply={onPressReply} />
            </View>
          </>
        )}
      </View>
      {!isTabletOrMobile && isSidebarOpen && (
        <View style={styles.postThreadInternal}>
          <PostThread uri={uri} imageGridDisabled={true} />
        </View>
      )}
    </View>
  )
}

function PostThreadFetcher({uri, page}: {uri?: string; page: number}) {
  const {data: {thread} = {}} = usePostThreadQuery(uri)
  const [rootPost, setRootPost] = useState<AppBskyFeedDefs.PostView | null>(
    null,
  )

  useEffect(() => {
    if (thread?.type === 'post') {
      setRootPost(thread.post)
    }
  }, [thread])

  if (!rootPost) {
    return null
  }
  return <ImageGalleryRenderer rootPost={rootPost} page={page} />
}

function ImageGalleryRenderer({
  rootPost,
  page,
}: {
  rootPost: AppBskyFeedDefs.PostView
  page: number
}) {
  const {isTabletOrMobile} = useWebMediaQueries()
  const navigation = useNavigation<NavigationProp>()
  const [imgs, setImgs] = useState<Img[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const onPressBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Home')
    }
  }, [navigation])

  useEffect(() => {
    let images = []

    if (
      AppBskyEmbedRecordWithMedia.isView(rootPost.embed) &&
      Array.isArray(rootPost.embed.media.images)
    ) {
      images = rootPost.embed.media.images
    } else if (rootPost.embed?.images && Array.isArray(rootPost.embed.images)) {
      images = rootPost.embed.images
    }

    const formattedImages = images.map(img => ({
      uri: img.fullsize,
      alt: img.alt,
      aspectRatio: img.aspectRatio,
    }))

    setImgs(formattedImages)
    setIsLoading(false)
  }, [rootPost])

  if (isLoading || imgs.length === 0) {
    return null
  }

  return (
    <LightboxInner
      imgs={imgs}
      initialIndex={page}
      onClose={onPressBack}
      postThread={!isTabletOrMobile}
    />
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
  const {data: {thread} = {}} = usePostThreadQuery(uri)
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
