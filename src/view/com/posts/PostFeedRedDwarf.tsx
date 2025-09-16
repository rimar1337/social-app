import {
  type JSX,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import React from 'react'
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  LayoutAnimation,
  type ListRenderItemInfo,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native'
import {
  type AppBskyActorDefs,
  AppBskyEmbedVideo,
  type AppBskyFeedDefs,
} from '@atproto/api'
import {type AppBskyFeedPost, AtUri, ModerationDecision} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useQueryClient} from '@tanstack/react-query'

import {isStatusStillActive, validateStatus} from '#/lib/actor-status'
import {DISCOVER_FEED_URI, KNOWN_SHUTDOWN_FEEDS} from '#/lib/constants'
import {useInitialNumToRender} from '#/lib/hooks/useInitialNumToRender'
import {useNonReactiveCallback} from '#/lib/hooks/useNonReactiveCallback'
import {logEvent} from '#/lib/statsig/statsig'
import {logger} from '#/logger'
import {isIOS, isNative, isWeb} from '#/platform/detection'
import {listenPostCreated} from '#/state/events'
import {useFeedFeedbackContext} from '#/state/feed-feedback'
import {useTrendingSettings} from '#/state/preferences/trending'
import {STALE} from '#/state/queries'
import {
  type AuthorFilter,
  createApi,
  type FeedDescriptor,
  type FeedParams,
  type FeedPostSlice,
  type FeedPostSliceItem,
  pollLatest,
  RQKEY,
  usePostFeedQuery,
} from '#/state/queries/post-feed'
import {useHydratedEmbed} from '#/state/queries/redDwarf/useHydrated'
import {
  useInfiniteQueryFeedSkeleton,
  useQueryArbitrary,
  useQueryConstellation,
  useQueryIdentity,
  useQueryPost,
  useQueryProfile,
} from '#/state/queries/redDwarf/useQuery'
import {useLiveNowConfig} from '#/state/service-config'
import {useAgent, useSession} from '#/state/session'
import {useProgressGuide} from '#/state/shell/progress-guide'
import {useSelectedFeed} from '#/state/shell/selected-feed'
import {List, type ListRef} from '#/view/com/util/List'
import {
  PostFeedLoadingPlaceholder,
  PostLoadingPlaceholder,
} from '#/view/com/util/LoadingPlaceholder'
import {LoadMoreRetryBtn} from '#/view/com/util/LoadMoreRetryBtn'
import {type VideoFeedSourceContext} from '#/screens/VideoFeed/types'
import {useBreakpoints, useLayoutBreakpoints} from '#/alf'
import {
  AgeAssuranceDismissibleFeedBanner,
  useInternalState as useAgeAssuranceBannerState,
} from '#/components/ageAssurance/AgeAssuranceDismissibleFeedBanner'
import {ProgressGuide, SuggestedFollows} from '#/components/FeedInterstitials'
import {
  PostFeedVideoGridRow,
  PostFeedVideoGridRowPlaceholder,
} from '#/components/feeds/PostFeedVideoGridRow'
import {TrendingInterstitial} from '#/components/interstitials/Trending'
import {TrendingVideos as TrendingVideosInterstitial} from '#/components/interstitials/TrendingVideos'
import {DiscoverFallbackHeader} from './DiscoverFallbackHeader'
import {FeedShutdownMsg} from './FeedShutdownMsg'
import {PostFeed as PostFeedFallback} from './PostFeed'
import {PostFeedErrorMessage} from './PostFeedErrorMessage'
import {PostFeedItem} from './PostFeedItem'
import { PostFeedItemPartial } from './PostFeedItemRedDwarf'
import {ShowLessFollowup} from './ShowLessFollowup'
import {ViewFullThread} from './ViewFullThread'

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
  console.log('atUri', atUri)
  //const { get, set } = usePersistentStore();
  //const [record, setRecord] = React.useState<any>(null);
  //const [links, setLinks] = React.useState<any>(null);
  //const [error, setError] = React.useState<string | null>(null);
  //const [cacheTime, setCacheTime] = React.useState<number | null>(null);
  //const [resolved, setResolved] = React.useState<any>(null); // { did, pdsUrl, bskyPds, handle }
  //const [opProfile, setOpProfile] = React.useState<any>(null);
  // const [opProfileCacheTime, setOpProfileCacheTime] = React.useState<
  //   number | null
  // >(null);
  //const router = useRouter();

  const parsed = React.useMemo(() => parseAtUri(atUri), [atUri])
  const did = parsed?.did
  const rkey = parsed?.rkey
  console.log('did', did)
  console.log('rkey', rkey)

  // React.useEffect(() => {
  //   const checkCache = async () => {
  //     const postUri = atUri;
  //     const cacheKey = `record:${postUri}`;
  //     const cached = await get(cacheKey);
  //     const now = Date.now();
  //     console.log(
  //       "UniversalPostRenderer checking cache for",
  //       cacheKey,
  //       "cached:",
  //       !!cached,
  //     );
  //     if (
  //       cached &&
  //       cached.value &&
  //       cached.time &&
  //       now - cached.time < CACHE_TIMEOUT
  //     ) {
  //       try {
  //         console.log("UniversalPostRenderer found cached data for", cacheKey);
  //         setRecord(JSON.parse(cached.value));
  //       } catch {
  //         setRecord(null);
  //       }
  //     }
  //   };
  //   checkCache();
  // }, [atUri, get]);

  const {
    data: postQuery,
    // isLoading: isPostLoading,
    // isError: isPostError,
  } = useQueryPost(atUri)
  //const record = postQuery?.value;

  // React.useEffect(() => {
  //   if (!did || record) return;
  //   (async () => {
  //     try {
  //       const resolvedData = await cachedResolveIdentity({
  //         didOrHandle: did,
  //         get,
  //         set,
  //       });
  //       setResolved(resolvedData);
  //     } catch (e: any) {
  //       //setError("Failed to resolve handle/did: " + e?.message);
  //     }
  //   })();
  // }, [did, get, set, record]);

  const {data: resolved} = useQueryIdentity(did || '')

  // React.useEffect(() => {
  //   if (!resolved || !resolved.pdsUrl || !resolved.did || !rkey || record)
  //     return;
  //   let ignore = false;
  //   (async () => {
  //     try {
  //       const data = await cachedGetRecord({
  //         atUri,
  //         get,
  //         set,
  //       });
  //       if (!ignore) setRecord(data);
  //     } catch (e: any) {
  //       //if (!ignore) setError("Failed to fetch base record: " + e?.message);
  //     }
  //   })();
  //   return () => {
  //     ignore = true;
  //   };
  // }, [resolved, rkey, atUri, record]);

  // React.useEffect(() => {
  //   if (!resolved || !resolved.did || !rkey) return;
  //   const fetchLinks = async () => {
  //     const postUri = atUri;
  //     const cacheKey = `constellation:${postUri}`;
  //     const cached = await get(cacheKey);
  //     const now = Date.now();
  //     if (
  //       cached &&
  //       cached.value &&
  //       cached.time &&
  //       now - cached.time < CACHE_TIMEOUT
  //     ) {
  //       try {
  //         const data = JSON.parse(cached.value);
  //         setLinks(data);
  //         if (onConstellation) onConstellation(data);
  //       } catch {
  //         setLinks(null);
  //       }
  //       //setCacheTime(cached.time);
  //       return;
  //     }
  //     try {
  //       const url = `https://constellation.microcosm.blue/links/all?target=${encodeURIComponent(
  //         atUri,
  //       )}`;
  //       const res = await fetch(url);
  //       if (!res.ok) throw new Error("Failed to fetch constellation links");
  //       const data = await res.json();
  //       setLinks(data);
  //       //setCacheTime(now);
  //       set(cacheKey, JSON.stringify(data));
  //       if (onConstellation) onConstellation(data);
  //     } catch (e: any) {
  //       //setError("Failed to fetch constellation links: " + e?.message);
  //     }
  //   };
  //   fetchLinks();
  // }, [resolved, rkey, get, set, atUri, onConstellation]);

  const {data: links} = useQueryConstellation({
    method: '/links/all',
    target: atUri,
  })

  // React.useEffect(() => {
  //   if (!record || !resolved || !resolved.did) return;
  //   const fetchOpProfile = async () => {
  //     const opDid = resolved.did;
  //     const postUri = atUri;
  //     const cacheKey = `profile:${postUri}`;
  //     const cached = await get(cacheKey);
  //     const now = Date.now();
  //     if (
  //       cached &&
  //       cached.value &&
  //       cached.time &&
  //       now - cached.time < CACHE_TIMEOUT
  //     ) {
  //       try {
  //         setOpProfile(JSON.parse(cached.value));
  //       } catch {
  //         setOpProfile(null);
  //       }
  //       //setOpProfileCacheTime(cached.time);
  //       return;
  //     }
  //     try {
  //       let opResolvedRaw = await get(`handleDid:${opDid}`);
  //       let opResolved: any = null;
  //       if (
  //         opResolvedRaw &&
  //         opResolvedRaw.value &&
  //         opResolvedRaw.time &&
  //         now - opResolvedRaw.time < HANDLE_DID_CACHE_TIMEOUT
  //       ) {
  //         try {
  //           opResolved = JSON.parse(opResolvedRaw.value);
  //         } catch {
  //           opResolved = null;
  //         }
  //       } else {
  //         const url = `https://free-fly-24.deno.dev/?did=${encodeURIComponent(
  //           opDid,
  //         )}`;
  //         const res = await fetch(url);
  //         if (!res.ok) throw new Error("Failed to resolve OP did");
  //         opResolved = await res.json();
  //         set(`handleDid:${opDid}`, JSON.stringify(opResolved));
  //       }
  //       if (!opResolved || !opResolved.pdsUrl)
  //         throw new Error("OP did resolution failed or missing pdsUrl");
  //       const profileUrl = `${
  //         opResolved.pdsUrl
  //       }/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(
  //         opDid,
  //       )}&collection=app.bsky.actor.profile&rkey=self`;
  //       const profileRes = await fetch(profileUrl);
  //       if (!profileRes.ok) throw new Error("Failed to fetch OP profile");
  //       const profileData = await profileRes.json();
  //       setOpProfile(profileData);
  //       //setOpProfileCacheTime(now);
  //       set(cacheKey, JSON.stringify(profileData));
  //     } catch (e: any) {
  //       //setError("Failed to fetch OP profile: " + e?.message);
  //     }
  //   };
  //   fetchOpProfile();
  // }, [record, get, set, rkey, resolved, atUri]);

  const {data: opProfile} = useQueryProfile(
    resolved ? `at://${resolved?.did}/app.bsky.actor.profile/self` : undefined,
  )

  // const displayName =
  //   opProfile?.value?.displayName || resolved?.handle || resolved?.did;
  // const handle = resolved?.handle ? `@${resolved.handle}` : resolved?.did;

  // const postText = record?.value?.text || "";
  // const createdAt = record?.value?.createdAt
  //   ? new Date(record.value.createdAt)
  //   : null;
  // const langTags = record?.value?.langs || [];

  //const [likes, setLikes] = React.useState<number | null>(null)
  //const [reposts, setReposts] = React.useState<number | null>(null)
  //const [replies, setReplies] = React.useState<number | null>(null)

  // React.useEffect(() => {
  //   console.log(JSON.stringify(links, null, 2))
  //   setLikes(
  //     links
  //       ? links?.links?.['app.bsky.feed.like']?.['.subject.uri']?.records || 0
  //       : null,
  //   )
  //   setReposts(
  //     links
  //       ? links?.links?.['app.bsky.feed.repost']?.['.subject.uri']?.records || 0
  //       : null,
  //   )
  //   setReplies(
  //     links
  //       ? links?.links?.['app.bsky.feed.post']?.['.reply.parent.uri']
  //           ?.records || 0
  //       : null,
  //   )
  // }, [links])
  const likes = useMemo(
    () =>
      links
        ? links?.links?.['app.bsky.feed.like']?.['.subject.uri']?.records || 0
        : null,
    [links],
  )

  const reposts = useMemo(
    () =>
      links
        ? links?.links?.['app.bsky.feed.repost']?.['.subject.uri']?.records || 0
        : null,
    [links],
  )

  const replies = useMemo(
    () =>
      links
        ? links?.links?.['app.bsky.feed.post']?.['.reply.parent.uri']
            ?.records || 0
        : null,
    [links],
  )

  // const navigateToProfile = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (resolved?.did) {
  //     router.navigate({
  //       to: "/profile/$did",
  //       params: { did: resolved.did },
  //     });
  //   }
  // };
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
  console.log(`received aturi: ${aturi} of post content: ${postRecord}`)
  // TODO change to bsky's navigation system
  //const navigate = useNavigate();
  // const navigate = ()=>{};

  //const { get, set } = usePersistentStore();

  // const [hydratedEmbed, setHydratedEmbed] = useState<any>(undefined);

  // useEffect(() => {
  //   const run = async () => {
  //     if (!postRecord?.value?.embed) return;
  //     const embed = postRecord?.value?.embed;
  //     if (!embed || !embed.$type) {
  //       setHydratedEmbed(undefined);
  //       return;
  //     }

  //     try {
  //       let result: any;

  //       if (embed?.$type === "app.bsky.embed.recordWithMedia") {
  //         const mediaEmbed = embed.media;

  //         let hydratedMedia;
  //         if (mediaEmbed?.$type === "app.bsky.embed.images") {
  //           hydratedMedia = hydrateEmbedImages(mediaEmbed, resolved?.did);
  //         } else if (mediaEmbed?.$type === "app.bsky.embed.external") {
  //           hydratedMedia = hydrateEmbedExternal(mediaEmbed, resolved?.did);
  //         } else if (mediaEmbed?.$type === "app.bsky.embed.video") {
  //           hydratedMedia = hydrateEmbedVideo(mediaEmbed, resolved?.did);
  //         } else {
  //           throw new Error("idiot");
  //         }
  //         if (!hydratedMedia) throw new Error("idiot");

  //         // hydrate the outer recordWithMedia now using the hydrated media
  //         result = await hydrateEmbedRecordWithMedia(
  //           embed,
  //           resolved?.did,
  //           hydratedMedia,
  //           get,
  //           set,
  //         );
  //       } else {
  //         const hydrated =
  //           embed?.$type === "app.bsky.embed.images"
  //             ? hydrateEmbedImages(embed, resolved?.did)
  //             : embed?.$type === "app.bsky.embed.external"
  //               ? hydrateEmbedExternal(embed, resolved?.did)
  //               : embed?.$type === "app.bsky.embed.video"
  //                 ? hydrateEmbedVideo(embed, resolved?.did)
  //                 : embed?.$type === "app.bsky.embed.record"
  //                   ? hydrateEmbedRecord(embed, resolved?.did, get, set)
  //                   : undefined;

  //         result = hydrated instanceof Promise ? await hydrated : hydrated;
  //       }

  //       console.log(
  //         String(result) + " hydrateEmbedRecordWithMedia hey hyeh ye",
  //       );
  //       setHydratedEmbed(result);
  //     } catch (e) {
  //       console.error("Error hydrating embed", e);
  //       setHydratedEmbed(undefined);
  //     }
  //   };

  //   run();
  // }, [postRecord, resolved?.did]);

  // const {
  //   data: hydratedEmbed,
  //   //isLoading: isEmbedLoading,
  //   //error: embedError,
  // } = useHydratedEmbed(postRecord?.value?.embed, resolved?.did)

  // --- START DEBUGGING CODE ---

  // const prevDeps = useRef({
  //   postRecordValue: postRecord?.value,
  //   hydratedEmbed: hydratedEmbed,
  // })

  // useEffect(() => {
  //   if (prevDeps.current.postRecordValue !== postRecord?.value) {
  //     console.log(
  //       `[${aturi}] Re-render caused by: postRecord.value reference changed`,
  //     )
  //   }
  //   if (prevDeps.current.hydratedEmbed !== hydratedEmbed) {
  //     console.log(
  //       `[${aturi}] Re-render caused by: hydratedEmbed reference changed`,
  //     )
  //   }

  //   prevDeps.current = {
  //     postRecordValue: postRecord?.value,
  //     hydratedEmbed: hydratedEmbed,
  //   }
  // })

  // --- END DEBUGGING CODE ---

  // const parsedaturi = parseAtUri(aturi);

  // eslint-disable-next-line dot-notation
  const link = profileRecord?.value?.avatar?.ref?.['$link']
  const avatarUrl = link
    ? `https://cdn.bsky.app/img/avatar/plain/${resolved?.did}/${link}@jpeg`
    : null

  const fakepostforprofile = React.useMemo<AppBskyFeedDefs.PostView>(() => {
    console.log(`[${aturi}] Re-creating fakepost object`)
    return {
      $type: 'app.bsky.feed.defs#postView',
      uri: aturi,
      cid: postRecord?.cid || '',
      author: {
        did: resolved?.did || '',
        handle: resolved?.handle || '',
        displayName: profileRecord?.value?.displayName || '',
        avatar: avatarUrl || '',
        viewer: undefined,
        labels: profileRecord?.labels || undefined,
        verification: undefined,
      },
      record: postRecord?.value || {},
      embed: undefined,
      replyCount: repliesCount ?? 0,
      repostCount: repostsCount ?? 0,
      likeCount: likesCount ?? 0,
      quoteCount: 0,
      indexedAt: postRecord?.value?.createdAt || '',
      viewer: undefined,
      labels: postRecord?.labels || undefined,
      threadgate: undefined,
    }
  }, [
    aturi,
    postRecord?.cid,
    postRecord?.value,
    postRecord?.labels,
    resolved?.did,
    resolved?.handle,
    profileRecord?.value?.displayName,
    profileRecord?.labels,
    avatarUrl,
    repliesCount,
    repostsCount,
    likesCount,
  ])

  //const [feedviewpostreplyhandle, setFeedviewpostreplyhandle] = useState<string | undefined>(undefined);

  // useEffect(() => {
  //   if(!feedviewpost) return;
  //   let cancelled = false;

  //   const run = async () => {
  //     const thereply = (fakepost?.record as AppBskyFeedPost.Record)?.reply?.parent?.uri;
  //     const feedviewpostreplydid = thereply ? new AtUri(thereply).host : undefined;

  //     if (feedviewpostreplydid) {
  //       const opi = await cachedResolveIdentity({
  //         didOrHandle: feedviewpostreplydid,
  //         get,
  //         set,
  //       });

  //       if (!cancelled) {
  //         setFeedviewpostreplyhandle(opi?.handle);
  //       }
  //     }
  //   };

  //   run();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [fakepost, get, set]);
  const thereply = (fakepostforprofile?.record as AppBskyFeedPost.Record)?.reply?.parent
    ?.uri
  const feedviewpostreplydid = thereply ? new AtUri(thereply).host : undefined
  // const replyhookvalue = useQueryIdentity(
  //   feedviewpost ? feedviewpostreplydid : undefined
  // );
  // const feedviewpostreplyhandle = replyhookvalue?.data?.handle;

  // const aturirepostbydid = repostedby ? new AtUri(repostedby).host : undefined
  // const repostedbyhookvalue = useQueryIdentity(
  //   repostedby ? aturirepostbydid : undefined
  // );
  // const feedviewpostrepostedbyhandle = repostedbyhookvalue?.data?.handle;

  // TODO: this is a shim, please implement real moderation
  const moderation = new ModerationDecision()

  if (!profileRecord) {
    return (
      <View
        style={{
          minHeight: 120,
          backgroundColor: 'red',
          paddingBottom: 8,
          paddingLeft: 2,
          paddingRight: 2,
        }}>
        <Text style={{color: 'white'}}>Loading profile content</Text>
        <PostLoadingPlaceholder />
      </View>
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
const CHECK_LATEST_AFTER = STALE.SECONDS.THIRTY
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
  feedParams,
  ignoreFilterFor,
  style,
  enabled,
  pollInterval,
  disablePoll,
  scrollElRef,
  onScrolledDownChange,
  onHasNew,
  renderEmptyState,
  renderEndOfFeed,
  testID,
  headerOffset = 0,
  progressViewOffset,
  desktopFixedHeightOffset,
  ListHeaderComponent,
  extraData,
  savedFeedConfig,
  initialNumToRender: initialNumToRenderOverride,
  isVideoFeed = false,
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
  const queryClient = useQueryClient()
  const {currentAccount, hasSession} = useSession()
  const initialNumToRender = useInitialNumToRender()
  const feedFeedback = useFeedFeedbackContext()
  const [isPTRing, setIsPTRing] = useState(false)
  const lastFetchRef = useRef<number>(Date.now())
  const [feedType, feedUriOrActorDid, feedTab] = feed.split('|')
  const {gtMobile} = useBreakpoints()
  const {rightNavVisible} = useLayoutBreakpoints()
  const areVideoFeedsEnabled = isNative

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

  const feedCacheKey = feedParams?.feedCacheKey
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
    return <PostFeedCustomFeed feed={uri} scrollElRef={scrollElRef} />
  }
}


PostFeed = memo(PostFeed)
export {PostFeed}

const styles = StyleSheet.create({
  feedFooter: {paddingTop: 20},
})

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
  scrollElRef,
}: {
  feed: string
  scrollElRef?: ListRef
}) {
  //const { agent, authed } = useAuth();
  const agent = useAgent()

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
    isRefetching,
  } = useInfiniteQueryFeedSkeleton({
    feedUri: feed,
    agent: agent ?? undefined,
    isAuthed: !!agent,
    pdsUrl: identity?.pds,
    feedServiceDid: feedServiceDid,
  })


  const [isPTRing, setIsPTRing] = useState(false)

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


  //const { ref, inView } = useInView();

  // React.useEffect(() => {
  //   if (inView && hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Text
      //className="p-4 text-center text-gray-500"
      >
        Loading feed...
      </Text>
    )
  }

  if (isError) {
    return (
      <Text //className="p-4 text-center text-red-500"
      >
        Error: {error.message}
      </Text>
    )
  }

  const allPosts =
    data?.pages.flatMap(page => {
      if (page) return page.feed
    }) ?? []

  if (!allPosts || typeof allPosts !== 'object' || allPosts.length === 0) {
    return (
      <Text
      //className="p-4 text-center text-gray-500"
      >
        No posts in this feed.
      </Text>
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
  hasNextPage,
  isFetchingNextPage,
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

const FeedFooter = ({
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: {
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: any
}) => {
  if (isFetchingNextPage) {
    return <Text>Loading more...</Text>
  }
  if (hasNextPage) {
    return (
      <Pressable accessibilityRole="button" onPress={fetchNextPage}>
        <Text>Load More Posts</Text>
      </Pressable>
    )
  }
  return <Text>End of feed.</Text>
}

function PostFeedAuthorFeed({}) {}
