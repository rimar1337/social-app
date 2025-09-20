import {useEffect, useMemo} from 'react'
import {type AppBskyFeedDefs, type AppBskyFeedPost, AtUri} from '@atproto/api'
import {type ThreadItem as ThreadItemV2} from '@atproto/api/dist/client/types/app/bsky/unspecced/getPostThreadV2'
import {
  useInfiniteQuery,
  useQueries,
  type UseQueryResult,
} from '@tanstack/react-query'

import {
  constructPostQuery,
  useQueryPost,
  yknowIReallyHateThisButWhateverGuardedConstructConstellationInfiniteQueryLinks,
} from '../redDwarf/useQuery'

export function useReallyWeirdQuery(anchor?: string) {
  // 1. fetch anchor post
  const anchorPost = useQueryPost(anchor)
  console.log('anchor is shit', anchor)
  const supposedroot = anchorPost.data?.value.reply?.root.uri
  const rootPostURI = supposedroot ? supposedroot : anchor
  const anchorPostURI = anchor
  console.log(
    'anchorPost.data?.value.reply?.root.uri',
    anchorPost.data?.value.reply?.root.uri,
  )

  const rootPost = useQueryPost(rootPostURI)

  // 2. infinite query for constellation links
  const infinitequeryresults = useInfiniteQuery({
    ...yknowIReallyHateThisButWhateverGuardedConstructConstellationInfiniteQueryLinks(
      {
        method: '/links',
        target: rootPostURI,
        collection: 'app.bsky.feed.post',
        path: '.reply.root.uri',
      },
    ),
    enabled: !!rootPostURI,
  })

  const {
    data,
    // fetchNextPage,
    // hasNextPage,
    // isFetchingNextPage,
  } = infinitequeryresults

  // auto-fetch all pages
  useEffect(() => {
    if (
      infinitequeryresults.hasNextPage &&
      !infinitequeryresults.isFetchingNextPage
    ) {
      console.log('Fetching the next page...')
      infinitequeryresults.fetchNextPage()
    }
  }, [infinitequeryresults])

  useEffect(() => {
    const alluris = data
      ? data.pages.flatMap(page =>
          page
            ? page.linking_records.map(record => {
                const aturi = `at://${record.did}/${record.collection}/${record.rkey}`
                return aturi
              })
            : [],
        )
      : []
    console.log('data', data, 'alluris', alluris)
  }, [data])

  // 3. fetch all posts from gathered links
  const replyQueries = data
    ? data.pages.flatMap(page =>
        page
          ? page.linking_records.map(record => {
              const aturi = `at://${record.did}/${record.collection}/${record.rkey}`
              return constructPostQuery(aturi)
            })
          : [],
      )
    : []

  const replies = useQueries({queries: replyQueries})

  const postsMap = new Map()

  for (const post of [...replies, anchorPost, rootPost]) {
    if (post.data?.uri) {
      postsMap.set(post.data.uri, post)
    }
  }

  const posts = Array.from(postsMap.values())
  console.log('posts', posts)

  // 4. build tree from posts
  const tree = buildTree(posts)

  // 5. build thread structure
  const threadItems = buildThreadItemsV2({
    tree: tree,
    anchorURI: anchorPostURI,
    rootURI: rootPostURI,
    options: {depthLimit: 4, spanLimit: undefined},
  })

  // 6. shim into query-like object
  const query = useMemo(() => {
    const item = {
      data: {
        hasOtherReplies: false,
        thread: threadItems,
        threadgate: {
          record: undefined,
        },
        isFetching: !!threadItems,
        placeholderData: {},
      },
      isPlaceholderData: !threadItems,
      isFetching: !!threadItems,
      error: undefined,
      refetch: () => {},
    }
    // //console.log("rootswowowooww",roots)
    // console.log("thefinal,threadItems",threadItems);
    // console.log("item",item)
    // console.log("data",data)
    // console.log("anchorpost",anchorPost)
    // console.log("rootPostURI",rootPostURI)
    return item
  }, [threadItems])

  return query
}

type IRNode = {
  data: {
    uri: string
    cid: string
    value: AppBskyFeedPost.Record
  }
  parent?: IRNode
  children: IRNode[]
}

function buildTree(
  posts: UseQueryResult<
    {uri: string; cid: string; value: AppBskyFeedPost.Record} | undefined,
    Error
  >[],
) {
  const nodeMap = new Map<string, IRNode>()
  const roots: IRNode[] = []

  for (const post of posts) {
    if (!post.data) continue
    const node: IRNode = {data: post.data, children: []}
    nodeMap.set(post.data.uri, node)
  }

  for (const post of posts) {
    if (!post.data) continue
    const node = nodeMap.get(post.data.uri)
    if (!node) continue

    const parentUri = post.data.value?.reply?.parent?.uri
    if (parentUri && nodeMap.has(parentUri)) {
      const parentNode = nodeMap.get(parentUri)!
      parentNode.children.push(node)
      node.parent = parentNode
    } else {
      roots.push(node)
    }
  }

  return {roots, nodeMap}
}
function makeThreadItem(node: IRNode, depth: number): ThreadItemV2 {
  console.log('crying node: ', node)
  const aturi = new AtUri(node?.data?.uri)
  const fakefauxpostprofileless: AppBskyFeedDefs.PostView = {
    $type: 'app.bsky.feed.defs#postView',
    uri: node?.data?.uri || '',
    cid: node?.data?.cid || '',
    author: {
      did: aturi.host, // important
      handle: '',
      displayName: '',
      avatar: '',
      viewer: undefined,
      labels: undefined,
      verification: undefined,
    },
    record: node?.data?.value || {},
    embed: undefined,
    replyCount: node?.children.length,
    repostCount: 0,
    likeCount: 0,
    quoteCount: 0,
    indexedAt: new Date().toISOString(),
    viewer: undefined,
    labels: undefined,
    threadgate: undefined,
  }

  return {
    $type: 'app.bsky.unspecced.getPostThreadV2#threadItem',
    uri: node?.data?.uri || '',
    depth,
    value: {
      $type: 'app.bsky.unspecced.defs#threadItemPost',
      post: fakefauxpostprofileless,
      moreParents: false,
      moreReplies: node?.children?.length || 0,
      opThread: false,
      hiddenByThreadgate: false,
      mutedByViewer: false,
    },
  }
}

export function buildThreadItemsV2({
  tree,
  anchorURI,
  rootURI,
  options,
}: {
  tree: {roots: IRNode[]; nodeMap: Map<string, IRNode>}
  anchorURI?: string
  rootURI?: string
  options?: {depthLimit?: number; spanLimit?: number}
}): ThreadItemV2[] {
  console.log('nodeMap:', tree.nodeMap)
  const anchornode = anchorURI ? tree.nodeMap.get(anchorURI) : undefined
  console.log('anchornode:', anchornode)
  if (!anchorURI || !anchornode) {
    console.log('nodemap doesnt have anchorURI:', anchorURI)
    return []
  }
  if (rootURI && !tree.nodeMap.has(rootURI)) {
    console.log('nodemap doesnt have rootURI:', rootURI)
    return []
  }

  const anchor = tree.nodeMap.get(anchorURI)!
  const root = rootURI ? tree.nodeMap.get(rootURI)! : tree.roots[0]
  if (!root) {
    console.log('root doesnt exist:', root)
    return []
  }

  const {depthLimit, spanLimit} = options || {}
  const result: ThreadItemV2[] = []

  function climb(node: IRNode | undefined, depth: number) {
    if (!node) return
    if (depthLimit !== undefined && Math.abs(depth) > depthLimit) return
    result.unshift(makeThreadItem(node, depth))
    climb(node.parent, depth - 1)
  }

  function descend(node: IRNode, depth: number) {
    if (depthLimit !== undefined && depth > depthLimit) return
    const children = spanLimit
      ? node.children.slice(0, spanLimit)
      : node.children
    for (const child of children) {
      result.push(makeThreadItem(child, depth))
      descend(child, depth + 1)
    }
  }

  result.push(makeThreadItem(anchor, 0))

  climb(anchor.parent, -1)

  descend(anchor, 1)

  return result
}
// function findNode(rootNodes: IRNode[], uri: string | undefined): IRNode | undefined {
//   console.log("rootNode is"+rootNodes)
//   console.log("uri is"+uri)
//   if (!uri) return undefined
//   const stack = [...rootNodes]
//   while (stack.length) {
//     console.log("crying stack length: ",stack.length)
//     const node = stack.pop()!
//     if (node){
//       if (node?.data.uri === uri) return node
//       stack.push(...node.children)
//     }
//   }
//   return undefined
// }
