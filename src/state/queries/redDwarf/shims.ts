import React, {useMemo} from 'react'
import {
  type AppBskyActorDefs,
  type AppBskyActorProfile,
  type AppBskyFeedDefs,
  type AppBskyFeedPost,
  AtUri,
  ModerationDecision,
} from '@atproto/api'

import {parseAtUri} from '#/view/com/posts/PostFeedRedDwarf'
import {type ThreadItem} from '../usePostThread/types'
import {useHydratedEmbed} from './useHydrated'
import {
  useQueryConstellation,
  useQueryIdentity,
  useQueryPost,
  useQueryProfile,
} from './useQuery'

/**
 * loads the post, OP's profile, OP's identity, and interaction counts
 * @param atUri
 * @returns
 * @deprecated leftover from initial red dwarf migration, please use its constituent hooks individually
 */
export function useATURILoader(atUri: string): {
  postQuery:
    | {
        uri: string
        cid: string
        value: AppBskyFeedPost.Record
      }
    | undefined
  opProfile:
    | {
        uri: string
        cid: string
        value: AppBskyActorProfile.Record
      }
    | undefined
  resolved:
    | {
        did: string
        handle: string
        pds: string
        signing_key: string
      }
    | undefined
  likes: number | null
  reposts: number | null
  replies: number | null
} {
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

  return {postQuery, opProfile, resolved, likes, reposts, replies}
}

/**
 * structures into the proper shape for a "FeedPost" with quote post hydration
 * @param param0
 * @returns
 * @deprecated leftover from initial red dwarf migration, please use its constituent hooks individually
 */
export function useRawRecordShim({
  postRecord,
  profileRecord,
  aturi,
  resolved,
  likesCount,
  repostsCount,
  repliesCount,
}: {
  postRecord: {
    uri: string
    cid: string
    value: AppBskyFeedPost.Record
  }
  profileRecord: {
    uri: string
    cid: string
    value: AppBskyActorProfile.Record
  }
  aturi: string
  resolved: {
    did: string
    handle: string
    pds: string
    signing_key: string
  }
  likesCount?: number | null
  repostsCount?: number | null
  repliesCount?: number | null
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

  // const parsedaturi = parseAtUri(aturi);

  // eslint-disable-next-line dot-notation
  const link = (profileRecord?.value?.avatar as any)?.ref?.['$link']
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
        labels: Array.isArray(profileRecord?.value?.labels)
          ? profileRecord.value.labels.map(label => ({
              ...label,
              $type: 'com.atproto.label.defs#label',
            }))
          : undefined,
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
      labels: Array.isArray(postRecord?.value?.labels)
        ? postRecord.value.labels.map(label => ({
            ...label,
            $type: 'com.atproto.label.defs#label',
          }))
        : undefined,
      threadgate: undefined,
    }
  }, [
    aturi,
    postRecord?.cid,
    postRecord?.value,
    resolved?.did,
    resolved?.handle,
    profileRecord?.value?.displayName,
    profileRecord?.value.labels,
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
  const thereply = (fakepostforprofile?.record as AppBskyFeedPost.Record)?.reply
    ?.parent?.uri
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

  return {moderation, fakepost: fakepostforprofile, feedviewpostreplydid}
}

function useProfileViewBasicShim(
  did?: string,
): AppBskyActorDefs.ProfileViewBasic | undefined {
  const identity = useQueryIdentity(did)
  const profilertey = useQueryProfile(
    `at://${identity.data?.did}/app.bsky.actor.profile/self`,
  )
  if (!did || !identity) return undefined
  // eslint-disable-next-line dot-notation
  const link = (profilertey?.data?.value?.avatar as any)?.ref?.['$link']
  const avatarUrl = link
    ? `https://cdn.bsky.app/img/avatar/plain/${identity.data?.did || did}/${link}@jpeg`
    : null

  console.log('profileviewbasic pfp:', avatarUrl, profilertey.data)

  return {
    $type: 'app.bsky.actor.defs#profileViewBasic',
    did: did,
    handle: identity.data?.handle || 'handle.invalid',
    displayName:
      profilertey?.data?.value?.displayName ||
      identity.data?.handle ||
      'handle.invalid',
    avatar: avatarUrl || undefined,
    //viewer?: ViewerState
    //labels?: ComAtprotoLabelDefs.Label[]
    createdAt: new Date().toISOString(),
    //verification?: VerificationState
    //status?: StatusView
  }
}

/**
 * structures into the proper shape for a "ThreadItem" with quote post hydration (wrapper around useRawRecordShim)
 * @param param0
 * @returns
 */
export function useThreadItemShim({
  // moderation,
  // fakepost,
  // feedviewpostreplydid,
  item,
  // profileRecord,
  // resolved,
  // likesCount,
  // repostsCount,
  //repliesCount
}: {
  // moderation: ModerationDecision
  // fakepost: AppBskyFeedDefs.PostView
  // feedviewpostreplydid: string | undefined
  item: Extract<ThreadItem, {type: 'threadPost'}>
  // profileRecord: {
  //   uri: string
  //   cid: string
  //   value: AppBskyActorProfile.Record
  // }
  // resolved: {
  //   did: string
  //   handle: string
  //   pds: string
  //   signing_key: string
  // }
  // likesCount?: number | null
  // repostsCount?: number | null
  // repliesCount?: number | null
}): {item: Extract<ThreadItem, {type: 'threadPost'}>; isComplete: boolean} {
  //const aturicontent = useATURILoader(item.uri)
  // const {
  //   moderation,
  //   fakepost: fakepostforprofile,
  //   feedviewpostreplydid: _reply,
  // } = useRawRecordShim({
  //   postRecord: {
  //     uri: item.uri,
  //     cid: item.value.post.cid,
  //     value: item.value.post.record,
  //   },
  //   profileRecord: aturicontent.opProfile,
  //   resolved: resolved,
  //   aturi: item.uri,
  //   likesCount: likesCount,
  //   repostsCount: repostsCount,
  //   repliesCount: item.value.post.replyCount,
  // })
  const aturiloaded = useATURILoader(item.uri)
  const profileviewbasic = useProfileViewBasicShim(item.value.post.author.did)
  const hydratedembed = useHydratedEmbed(
    item.value.post.record.embed,
    item.value.post.author.did,
  )
  const threadshitpost: Extract<ThreadItem, {type: 'threadPost'}> = {
    ...item,
    //moderation,
    value: {
      ...item.value,
      post: {
        ...item.value.post,
        repostCount: aturiloaded.reposts || item.value.post.repostCount,
        likeCount: aturiloaded.likes || item.value.post.likeCount,
        record: {
          ...item.value.post.record,
        },
        author: profileviewbasic || item.value.post.author,
        embed: hydratedembed.data || item.value.post.embed,
      },
    },
  }

  // const threadshitpost: Extract<ThreadItem, {type: 'threadPost'}> = {
  //   type: "threadPost",
  //   key: fakepost.uri,
  //   uri: fakepost.uri,
  //   depth: depth,
  //   value: {
  //     things: "ThreadItemPost.post",
  //     post: {
  //       record: fakepost.record as AppBskyFeedPost.Record,
  //     },

  //   },
  //   isBlurred: false,
  //   moderation: moderation,
  //   ui: {
  //     isAnchor: depth === 0,
  //     showParentReplyLine: !!feedviewpostreplydid, // shit boolean;
  //     showChildReplyLine: false, // shit boolean;
  //     indent: depth, // shit number;
  //     isLastChild: false, // shit boolean;
  //     skippedIndentIndices: new Set(), // shit Set<number>;
  //     precedesChildReadMore: false, // shit boolean;
  //   }
  // }
  return {
    item: threadshitpost,
    isComplete:
      !!profileviewbasic && !hydratedembed.isLoading && !!threadshitpost,
  }
}
