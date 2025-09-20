import {type JSX, memo, useCallback, useEffect, useState} from 'react'
import {AppState, type StyleProp, Text, type ViewStyle} from 'react-native'
import {type AppBskyActorDefs, RichText} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useQueryClient} from '@tanstack/react-query'
import type React from 'react'

import {DISCOVER_FEED_URI} from '#/lib/constants'
import {useNonReactiveCallback} from '#/lib/hooks/useNonReactiveCallback'
import {logger} from '#/logger'
import {isIOS} from '#/platform/detection'
import {listenPostCreated} from '#/state/events'
import {
  type FeedDescriptor,
  type FeedParams,
  type FeedPostSlice,
  type FeedPostSliceItem,
} from '#/state/queries/post-feed'
import {useATURILoader, useRawRecordShim} from '#/state/queries/redDwarf/shims'
import {
  useInfiniteQueryFeedSkeleton,
  useQueryArbitrary,
  useQueryIdentity,
} from '#/state/queries/redDwarf/useQuery'
import {useAgent, useSession} from '#/state/session'
import {List, type ListRef} from '#/view/com/util/List'
import {
  PostFeedLoadingPlaceholder,
  PostLoadingPlaceholder,
} from '#/view/com/util/LoadingPlaceholder'
import {useTheme} from '#/alf'
import * as Layout from '#/components/Layout'
import {EmptyState} from '../util/EmptyState'
import {PostContent, PostFeedItemPartial} from './PostFeedItemRedDwarf'

export function PostFeedItemATURILoader({
  atUri,
  // onConstellation,
  detailed = false,
  bottomReplyLine,
  topReplyLine,
  bottomBorder = true,
  feedviewpost = false,
  repostedby,
}: {
  atUri: string
  // onConstellation?: (data: any) => void;
  detailed?: boolean
  bottomReplyLine?: boolean
  topReplyLine?: boolean
  bottomBorder?: boolean
  feedviewpost?: boolean
  repostedby?: string
}) {
  const {postQuery, opProfile, resolved, likes, reposts, replies} =
    useATURILoader(atUri)

  // const navigateToProfile = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (resolved?.did) {
  //     router.navigate({
  //       to: "/profile/$did",
  //       params: { did: resolved.did },
  //     });
  //   }
  // };
  if (!postQuery) return <PostLoadingPlaceholder />

  if (!postQuery?.value) {
    // deleted post more often than a non-resolvable post
    return <></>
  }

  return (
    <PostFeedItemRawRecordShim
      key={atUri}
      detailed={detailed}
      postRecord={postQuery}
      profileRecord={opProfile}
      aturi={atUri}
      resolved={resolved}
      likesCount={likes}
      repostsCount={reposts}
      repliesCount={replies}
      bottomReplyLine={bottomReplyLine}
      topReplyLine={topReplyLine}
      bottomBorder={bottomBorder}
      feedviewpost={feedviewpost}
      repostedby={repostedby}
    />
  )
}

export function PostFeedItemRawRecordShim({
  postRecord,
  profileRecord,
  aturi,
  resolved,
  likesCount,
  repostsCount,
  repliesCount,
  // detailed = false,
  // bottomReplyLine = false,
  // topReplyLine = false,
  bottomBorder = true,
  // feedviewpost = false,
  // repostedby,
}: {
  postRecord: any
  profileRecord: any
  aturi: string
  resolved: any
  likesCount?: number | null
  repostsCount?: number | null
  repliesCount?: number | null
  detailed?: boolean
  bottomReplyLine?: boolean
  topReplyLine?: boolean
  bottomBorder?: boolean
  feedviewpost?: boolean
  repostedby?: string
}) {
  const {
    moderation,
    fakepost: fakepostforprofile,
    feedviewpostreplydid,
  } = useRawRecordShim({
    postRecord,
    profileRecord,
    resolved,
    aturi,
    likesCount,
    repostsCount,
    repliesCount,
  })

  //const randomBool = Math.random() < 0.5;
  if (!profileRecord) {
    const richText = new RichText({
      text: postRecord?.value.text,
      facets: postRecord?.value.facets,
    })
    return (
      // <View
      //   style={{
      //     minHeight: 120,
      //     backgroundColor: 'red',
      //     paddingBottom: 8,
      //     paddingLeft: 2,
      //     paddingRight: 2,
      //   }}>
      //   <Text style={{color: 'white'}}>Loading profile content</Text>
      <PostLoadingPlaceholder>
        <PostContent
          moderation={moderation}
          richText={richText}
          postEmbed={undefined}
          postAuthor={undefined}
          onOpenEmbed={() => {}}
          post={fakepostforprofile}
          threadgateRecord={undefined}
        />
      </PostLoadingPlaceholder>
      //</View>
    )
  }
  // if (postRecord?.value?.embed && !hydratedEmbed) {
  //   return (
  //     <View
  //       style={{
  //         minHeight: 120,
  //         backgroundColor: 'orange',
  //         paddingBottom: 8,
  //         paddingLeft: 2,
  //         paddingRight: 2,
  //       }}>
  //       <Text style={{color: 'white'}}>Loading quoted content</Text>
  //       <PostLoadingPlaceholder />
  //     </View>
  //   )
  // }

  return (
    <>
      {/* <p>
        {postRecord?.value?.embed.$type + " " + JSON.stringify(hydratedEmbed)}
      </p> */}
      <PostFeedItemPartial
        key={aturi}
        post={fakepostforprofile}
        //postButForProfile={fakepostforprofile}
        //postButForEmbeds={fakepostforembed}
        record={postRecord?.value}
        reason={undefined}
        feedContext={undefined}
        reqId={undefined}
        moderation={moderation}
        parentAuthor={undefined} // parentAuthor={item.parentAuthor} its feedviewpostreplydid but we need profileviewbasic
        showReplyTo={!!feedviewpostreplydid}
        isThreadParent={false}
        isThreadChild={false}
        isThreadLastChild={false}
        isParentBlocked={false}
        isParentNotFound={false}
        hideTopBorder={!bottomBorder}
        rootPost={fakepostforprofile}
        onShowLess={undefined}
      />
      {/* <UniversalPostRenderer
        expanded={detailed}
        // onPostClick={() =>
        //   parsedaturi &&
        //   navigate({
        //     to: "/profile/$did/post/$rkey",
        //     params: { did: parsedaturi.did, rkey: parsedaturi.rkey },
        //   })
        // }
        // onProfileClick={() => parsedaturi && navigate({to: "/profile/$did",
        //   params: {did: parsedaturi.did}
        // })}
        // onProfileClick={(e) => {
        //   e.stopPropagation();
        //   if (parsedaturi) {
        //     navigate({
        //       to: "/profile/$did",
        //       params: { did: parsedaturi.did },
        //     });
        //   }
        // }}
        post={fakepost}
        salt={aturi}
        bottomReplyLine={bottomReplyLine}
        topReplyLine={topReplyLine}
        bottomBorder={bottomBorder}
        //extraOptionalItemInfo={{reply: postRecord?.value?.reply as AppBskyFeedDefs.ReplyRef, post: fakepost}}
        feedviewpostreplyhandle={feedviewpostreplyhandle}
        repostedby={feedviewpostrepostedbyhandle}
      /> */}
    </>
  )
}

export function parseAtUri(
  atUri: string,
): {did: string; collection: string; rkey: string} | null {
  const PREFIX = 'at://'
  if (!atUri.startsWith(PREFIX)) {
    return null
  }

  const parts = atUri.slice(PREFIX.length).split('/')

  if (parts.length !== 3) {
    return null
  }

  const [did, collection, rkey] = parts

  if (!did || !collection || !rkey) {
    return null
  }

  return {did, collection, rkey}
}

type FeedRow =
  | {
      type: 'loading'
      key: string
    }
  | {
      type: 'empty'
      key: string
    }
  | {
      type: 'error'
      key: string
    }
  | {
      type: 'loadMoreError'
      key: string
    }
  | {
      type: 'feedShutdownMsg'
      key: string
    }
  | {
      type: 'fallbackMarker'
      key: string
    }
  | {
      type: 'sliceItem'
      key: string
      slice: FeedPostSlice
      indexInSlice: number
      showReplyTo: boolean
    }
  | {
      type: 'videoGridRowPlaceholder'
      key: string
    }
  | {
      type: 'videoGridRow'
      key: string
      items: FeedPostSliceItem[]
      sourceFeedUri: string
      feedContexts: (string | undefined)[]
      reqIds: (string | undefined)[]
    }
  | {
      type: 'sliceViewFullThread'
      key: string
      uri: string
    }
  | {
      type: 'interstitialFollows'
      key: string
    }
  | {
      type: 'interstitialProgressGuide'
      key: string
    }
  | {
      type: 'interstitialTrending'
      key: string
    }
  | {
      type: 'interstitialTrendingVideos'
      key: string
    }
  | {
      type: 'showLessFollowup'
      key: string
    }
  | {
      type: 'ageAssuranceBanner'
      key: string
    }

export function getItemsForFeedback(feedRow: FeedRow): {
  item: FeedPostSliceItem
  feedContext: string | undefined
  reqId: string | undefined
}[] {
  if (feedRow.type === 'sliceItem') {
    return feedRow.slice.items.map(item => ({
      item,
      feedContext: feedRow.slice.feedContext,
      reqId: feedRow.slice.reqId,
    }))
  } else if (feedRow.type === 'videoGridRow') {
    return feedRow.items.map((item, i) => ({
      item,
      feedContext: feedRow.feedContexts[i],
      reqId: feedRow.reqIds[i],
    }))
  } else {
    return []
  }
}

// DISABLED need to check if this is causing random feed refreshes -prf
// const REFRESH_AFTER = STALE.HOURS.ONE
// const CHECK_LATEST_AFTER = STALE.SECONDS.THIRTY
// export type FeedDescriptor =
//   | 'following'
//   | `author|${ActorDid}|${AuthorFilter}`
//   | `feedgen|${FeedUri}`
//   | `likes|${ActorDid}`
//   | `list|${ListUri}`
//   | `posts|${PostsUriList}`
//   | 'demo'
let PostFeed = ({
  feed,
  //feedParams,
  //ignoreFilterFor,
  //style,
  enabled,
  pollInterval,
  //disablePoll,
  scrollElRef,
  //onScrolledDownChange,
  //onHasNew,
  //renderEmptyState,
  //renderEndOfFeed,
  //testID,
  //headerOffset = 0,
  //progressViewOffset,
  //desktopFixedHeightOffset,
  //ListHeaderComponent,
  //extraData,
  //savedFeedConfig,
  //initialNumToRender: initialNumToRenderOverride,
  //isVideoFeed = false,
}: {
  feed: FeedDescriptor
  feedParams?: FeedParams
  ignoreFilterFor?: string
  style?: StyleProp<ViewStyle>
  enabled?: boolean
  pollInterval?: number
  disablePoll?: boolean
  scrollElRef?: ListRef
  onHasNew?: (v: boolean) => void
  onScrolledDownChange?: (isScrolledDown: boolean) => void
  renderEmptyState: () => JSX.Element
  renderEndOfFeed?: () => JSX.Element
  testID?: string
  headerOffset?: number
  progressViewOffset?: number
  desktopFixedHeightOffset?: number
  ListHeaderComponent?: () => JSX.Element
  extraData?: any
  savedFeedConfig?: AppBskyActorDefs.SavedFeed
  initialNumToRender?: number
  isVideoFeed?: boolean
}): React.ReactNode => {
  const {_} = useLingui()
  //const queryClient = useQueryClient()
  //const {currentAccount, hasSession} = useSession()
  //const initialNumToRender = useInitialNumToRender()
  //const feedFeedback = useFeedFeedbackContext()
  //const [isPTRing, setIsPTRing] = useState(false)
  //const lastFetchRef = useRef<number>(Date.now())
  const [feedType, _feedUriOrActorDid, _feedTab] = feed.split('|')
  //const {gtMobile} = useBreakpoints()
  //const {rightNavVisible} = useLayoutBreakpoints()
  //const areVideoFeedsEnabled = isNative

  // TODO pass prop
  // const [hasPressedShowLessUris, setHasPressedShowLessUris] = useState(
  //  () => new Set<string>(),
  // )
  // const onPressShowLess = useCallback(
  //   (interaction: AppBskyFeedDefs.Interaction) => {
  //     if (interaction.item) {
  //       const uri = interaction.item
  //       setHasPressedShowLessUris(prev => new Set([...prev, uri]))
  //       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  //     }
  //   },
  //   [],
  // )
  const renderPostsEmpty = useCallback(() => {
    return <EmptyState icon="hashtag" message={_(msg`This feed is empty.`)} />
  }, [_])

  //const feedCacheKey = feedParams?.feedCacheKey
  // const opts = useMemo(
  //   () => ({enabled, ignoreFilterFor}),
  //   [enabled, ignoreFilterFor],
  // )
  if (!enabled) {
    return <></>
  }
  if (feedType === 'feedgen' || true) {
    const [_, uri] = feed.split('|')
    // const [ownerDid] = safeParseFeedgenUri(uri)
    return (
      <PostFeedCustomFeed
        feed={uri}
        scrollElRef={scrollElRef}
        pollInterval={pollInterval}
        renderEmptyState={renderPostsEmpty}
      />
    )
  }
}

PostFeed = memo(PostFeed)
export {PostFeed}

// const styles = StyleSheet.create({
//   feedFooter: {paddingTop: 20},
// })

export function isThreadParentAt<T>(arr: Array<T>, i: number) {
  if (arr.length === 1) {
    return false
  }
  return i < arr.length - 1
}

export function isThreadChildAt<T>(arr: Array<T>, i: number) {
  if (arr.length === 1) {
    return false
  }
  return i > 0
}

function PostFeedCustomFeed({
  feed,
  //feedParams,
  //ignoreFilterFor,
  //style,
  enabled,
  pollInterval,
  disablePoll,
  scrollElRef,
  //onScrolledDownChange,
  onHasNew,
  //renderEmptyState,
  //renderEndOfFeed,
  //testID,
  //headerOffset = 0,
  //progressViewOffset,
  //desktopFixedHeightOffset,
  //ListHeaderComponent,
  //extraData,
  //savedFeedConfig,
  //initialNumToRender: initialNumToRenderOverride,
  //isVideoFeed = false,
}: {
  feed: string //FeedDescriptor
  feedParams?: FeedParams
  ignoreFilterFor?: string
  style?: StyleProp<ViewStyle>
  enabled?: boolean
  pollInterval?: number
  disablePoll?: boolean
  scrollElRef?: ListRef
  onHasNew?: (v: boolean) => void
  onScrolledDownChange?: (isScrolledDown: boolean) => void
  renderEmptyState: () => JSX.Element
  renderEndOfFeed?: () => JSX.Element
  testID?: string
  headerOffset?: number
  progressViewOffset?: number
  desktopFixedHeightOffset?: number
  ListHeaderComponent?: () => JSX.Element
  extraData?: any
  savedFeedConfig?: AppBskyActorDefs.SavedFeed
  initialNumToRender?: number
  isVideoFeed?: boolean
}) {
  //const { agent, authed } = useAuth();
  const agent = useAgent()
  const t = useTheme()
  const queryClient = useQueryClient()
  const {currentAccount} = useSession()
  const [isPTRing, setIsPTRing] = useState(false)
  const [_lastFetchedAt, setLastFetchedAt] = useState<any>()
  // const identityresultmaybe = useQueryIdentity(agent?.did);
  // const identity = identityresultmaybe?.data;
  // const feedGenGetRecordQuery = useQueryArbitrary(feedUri);
  const identityresultmaybe = useQueryIdentity(agent?.did)
  const identity = identityresultmaybe?.data

  const feedGengetrecordquery = useQueryArbitrary(feed)
  const feedServiceDid = (feedGengetrecordquery?.data?.value as any)?.did

  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    //isRefetching,
  } = useInfiniteQueryFeedSkeleton({
    feedUri: feed,
    agent: agent ?? undefined,
    isAuthed: !!agent,
    pdsUrl: identity?.pds,
    feedServiceDid: feedServiceDid,
  })

  useEffect(() => {
    setLastFetchedAt(true)
  }, [])

  const onRefresh = useCallback(async () => {
    setIsPTRing(true)
    try {
      await refetch()
      // onHasNew?.(false)
    } catch (err) {
      logger.error('Failed to refresh posts feed', {message: err})
    }
    setIsPTRing(false)
  }, [refetch, setIsPTRing])

  /*
  // const lastFetchedAt = data?.pages[0].fetchedAt
  if (lastFetchedAt) {
    lastFetchRef.current = lastFetchedAt
  }
  const isEmpty = useMemo(
    () => !isFetching && !data?.pages?.some(page => page.feed.length),
    [isFetching, data],
  )*/

  const checkForNew = useNonReactiveCallback(async () => {
    if (
      !data?.pages[0] ||
      /*isFetching ||*/ !onHasNew ||
      !enabled ||
      disablePoll
    ) {
      return
    }

    // Discover always has fresh content
    if (feed === DISCOVER_FEED_URI) {
      return onHasNew(true)
    }

    try {
      onHasNew(true)
      // TODO we should probably just make the red dwarf useQueries be more like
      // the bsky ones instead of making more custom logic
      // async peekLatest(): Promise<AppBskyFeedDefs.FeedViewPost> {
      //     const contentLangs = getContentLanguages().join(',')
      //     const res = await this.agent.app.bsky.feed.getFeed(
      //       {
      //         ...this.params,
      //         limit: 1,
      //       },
      //       {headers: {'Accept-Language': contentLangs}},
      //     )
      //     return res.data.feed[0]
      //   }
      // if (await pollLatest(data.pages[0])) {
      //   if (isEmpty) {
      //     refetch()
      //   } else {
      //     onHasNew(true)
      //   }
      // }
    } catch (e) {
      logger.error('Poll latest failed', {feed, message: String(e)})
    }
  })

  const myDid = currentAccount?.did || ''
  const onPostCreated = useCallback(() => {
    // NOTE
    // only invalidate if there's 1 page
    // more than 1 page can trigger some UI freakouts on iOS and android
    // -prf
    if (
      data?.pages.length === 1 &&
      (feed === 'following' ||
        feed === `author|${myDid}|posts_and_author_threads`)
    ) {
      queryClient.invalidateQueries({
        queryKey: [
          'feedSkeleton',
          feed,
          {isAuthed: !!agent?.did, did: agent?.did},
        ] as const,
      })
    }
  }, [data?.pages.length, feed, myDid, queryClient, agent?.did])
  useEffect(() => {
    return listenPostCreated(onPostCreated)
  }, [onPostCreated])

  // useEffect(() => {
  //   if (enabled && !disablePoll) {
  //     const timeSinceFirstLoad = Date.now() - lastFetchRef.current
  //     if (isEmpty || timeSinceFirstLoad > CHECK_LATEST_AFTER) {
  //       // check for new on enable (aka on focus)
  //       checkForNew()
  //     }
  //   }
  // }, [enabled, isEmpty, disablePoll, checkForNew])

  useEffect(() => {
    let cleanup1: () => void | undefined, cleanup2: () => void | undefined
    const subscription = AppState.addEventListener('change', nextAppState => {
      // check for new on app foreground
      if (nextAppState === 'active') {
        checkForNew()
      }
    })
    cleanup1 = () => subscription.remove()
    if (pollInterval) {
      // check for new on interval
      const i = setInterval(() => {
        checkForNew()
      }, pollInterval)
      cleanup2 = () => clearInterval(i)
    }
    return () => {
      cleanup1?.()
      cleanup2?.()
    }
  }, [pollInterval, checkForNew])

  //const { ref, inView } = useInView();

  // React.useEffect(() => {
  //   if (inView && hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Layout.Center>
        <PostFeedLoadingPlaceholder />
      </Layout.Center>
      // <Text
      // //className="p-4 text-center text-gray-500"
      // >
      //   Loading feed...
      // </Text>
    )
  }

  if (isError) {
    return (
      <Layout.Center>
        <Text
          style={{
            backgroundColor: t.atoms.bg_contrast_100.backgroundColor,
            color: t.atoms.text_contrast_high.color,
            paddingVertical: 10,
            paddingHorizontal: 8,
          }} //className="p-4 text-center text-red-500"
        >
          Error: {error.message}
        </Text>
      </Layout.Center>
    )
  }

  const allPosts =
    data?.pages.flatMap(page => {
      if (page) return page.feed
    }) ?? []

  if (!allPosts || typeof allPosts !== 'object' || allPosts.length === 0) {
    return (
      <Layout.Center>
        <Text
          style={{
            backgroundColor: t.atoms.bg_contrast_100.backgroundColor,
            color: t.atoms.text_contrast_high.color,
            paddingVertical: 10,
            paddingHorizontal: 8,
          }} //className="p-4 text-center text-red-500"
        >
          No posts in this feed.
        </Text>
      </Layout.Center>
    )
  }

  return (
    <FeedList
      allPosts={allPosts}
      scrollElRef={scrollElRef}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isPTRing={isPTRing}
      onRefresh={onRefresh}
    />
  )
}

function FeedList({
  allPosts,
  //hasNextPage,
  //isFetchingNextPage,
  fetchNextPage,
  scrollElRef,
  isPTRing,
  onRefresh,
}: {
  allPosts: any[]
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  scrollElRef?: ListRef
  isPTRing?: boolean
  onRefresh: () => void
}) {
  const renderItem = ({item, index}: {item: any; index: number}) => {
    if (!item) return null

    return (
      <PostFeedItemATURILoader
        key={item.post || index}
        atUri={item.post}
        feedviewpost={true}
        repostedby={!!item.reason?.$type && (item.reason as any)?.repost}
      />
    )
  }

  return (
    <List
      data={allPosts}
      keyExtractor={(item, index) => item?.post || String(index)}
      renderItem={renderItem}
      // ListFooterComponent={FeedFooter({
      //   isFetchingNextPage,
      //   hasNextPage,
      //   fetchNextPage,
      // })}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={2} // number of posts left to trigger load more
      removeClippedSubviews={true}
      windowSize={9}
      maxToRenderPerBatch={isIOS ? 5 : 1}
      ref={scrollElRef}
      // ListHeaderComponent={ListHeaderComponent}
      refreshing={isPTRing}
      onRefresh={onRefresh}
      // headerOffset={headerOffset}
      // progressViewOffset={progressViewOffset}
      // contentContainerStyle={{
      //   minHeight: Dimensions.get('window').height * 1.5,
      // }}
      // onScrolledDownChange={onScrolledDownChange}
      // extraData={extraData}
      // desktopFixedHeight={
      //   desktopFixedHeightOffset ? desktopFixedHeightOffset : true
      // }
      // initialNumToRender={initialNumToRenderOverride ?? initialNumToRender}
      updateCellsBatchingPeriod={40}
      // onItemSeen={onItemSeen}
    />
  )
}

// const FeedFooter = ({
//   isFetchingNextPage,
//   hasNextPage,
//   fetchNextPage,
// }: {
//   isFetchingNextPage: boolean
//   hasNextPage: boolean
//   fetchNextPage: any
// }) => {
//   if (isFetchingNextPage) {
//     return <Text>Loading more...</Text>
//   }
//   if (hasNextPage) {
//     return (
//       <Pressable accessibilityRole="button" onPress={fetchNextPage}>
//         <Text>Load More Posts</Text>
//       </Pressable>
//     )
//   }
//   return <Text>End of feed.</Text>
// }

// function PostFeedAuthorFeed({}) {}
