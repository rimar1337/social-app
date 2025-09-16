import * as ATPAPI from "@atproto/api";
import {
  infiniteQueryOptions,
//  type InfiniteData,
  type QueryFunctionContext,
  queryOptions,
  useInfiniteQuery,
  useQuery,
  type UseQueryResult} from "@tanstack/react-query";

// import { constellationHostAtom, store } from "./atoms";

export function constructIdentityQuery(didorhandle?: string) {
  return queryOptions({
    queryKey: ["identity", didorhandle],
    queryFn: async () => {
      if (!didorhandle) return undefined as undefined
      const res = await fetch(
        `https://slingshot.microcosm.blue/xrpc/com.bad-example.identity.resolveMiniDoc?identifier=${encodeURIComponent(didorhandle)}`
      );
      if (!res.ok) throw new Error("Failed to fetch post");
      try {
        return (await res.json()) as {
          did: string;
          handle: string;
          pds: string;
          signing_key: string;
        };
      } catch (_e) {
        return undefined;
      }
    },
  });
}
export function useQueryIdentity(didorhandle: string): UseQueryResult<
  {
    did: string;
    handle: string;
    pds: string;
    signing_key: string;
  },
  Error
>;
export function useQueryIdentity(): UseQueryResult<
      undefined,
      Error
    >
export function useQueryIdentity(didorhandle?: string):
  UseQueryResult<
      {
        did: string;
        handle: string;
        pds: string;
        signing_key: string;
      } | undefined,
      Error
    >
export function useQueryIdentity(didorhandle?: string) {
  return useQuery(constructIdentityQuery(didorhandle));
}

export function constructPostQuery(uri?: string) {
  return queryOptions({
    queryKey: ["post", uri],
    queryFn: async () => {
      if (!uri) return undefined as undefined
      const res = await fetch(
        `https://slingshot.microcosm.blue/xrpc/com.bad-example.repo.getUriRecord?at_uri=${encodeURIComponent(uri)}`
      );
      if (!res.ok) throw new Error("Failed to fetch post");
      try {
        return (await res.json()) as {
          uri: string;
          cid: string;
          value: ATPAPI.AppBskyFeedPost.Record;
        };
      } catch (_e) {
        return undefined;
      }
    },
  });
}
export function useQueryPost(uri: string): UseQueryResult<
  {
    uri: string;
    cid: string;
    value: ATPAPI.AppBskyFeedPost.Record;
  },
  Error
>;
export function useQueryPost(): UseQueryResult<
      undefined,
      Error
    >
export function useQueryPost(uri?: string):
  UseQueryResult<
      {
        uri: string;
        cid: string;
        value: ATPAPI.AppBskyFeedPost.Record;
      } | undefined,
      Error
    >
export function useQueryPost(uri?: string) {
  return useQuery(constructPostQuery(uri));
}

export function constructProfileQuery(uri?: string) {
  return queryOptions({
    queryKey: ["profile", uri],
    queryFn: async () => {
      if (!uri) return undefined as undefined
      const res = await fetch(
        `https://slingshot.microcosm.blue/xrpc/com.bad-example.repo.getUriRecord?at_uri=${encodeURIComponent(uri)}`
      );
      if (!res.ok) throw new Error("Failed to fetch post");
      try {
        return (await res.json()) as {
          uri: string;
          cid: string;
          value: ATPAPI.AppBskyActorProfile.Record;
        };
      } catch (_e) {
        return undefined;
      }
    },
  });
}
export function useQueryProfile(uri: string): UseQueryResult<
  {
    uri: string;
    cid: string;
    value: ATPAPI.AppBskyActorProfile.Record;
  },
  Error
>;
export function useQueryProfile(): UseQueryResult<
  undefined,
  Error
>;
export function useQueryProfile(uri?: string):
  UseQueryResult<
    {
      uri: string;
      cid: string;
      value: ATPAPI.AppBskyActorProfile.Record;
    } | undefined,
    Error
  >
export function useQueryProfile(uri?: string) {
  return useQuery(constructProfileQuery(uri));
}

// export function constructConstellationQuery(
//   method: "/links",
//   target: string,
//   collection: string,
//   path: string,
//   cursor?: string
// ): QueryOptions<linksRecordsResponse, Error>;
// export function constructConstellationQuery(
//   method: "/links/distinct-dids",
//   target: string,
//   collection: string,
//   path: string,
//   cursor?: string
// ): QueryOptions<linksDidsResponse, Error>;
// export function constructConstellationQuery(
//   method: "/links/count",
//   target: string,
//   collection: string,
//   path: string,
//   cursor?: string
// ): QueryOptions<linksCountResponse, Error>;
// export function constructConstellationQuery(
//   method: "/links/count/distinct-dids",
//   target: string,
//   collection: string,
//   path: string,
//   cursor?: string
// ): QueryOptions<linksCountResponse, Error>;
// export function constructConstellationQuery(
//   method: "/links/all",
//   target: string
// ): QueryOptions<linksAllResponse, Error>;
export function constructConstellationQuery(query?:{
  method:
    | "/links"
    | "/links/distinct-dids"
    | "/links/count"
    | "/links/count/distinct-dids"
    | "/links/all",
  target: string,
  collection?: string,
  path?: string,
  cursor?: string
}
) {
  const constellationHost = /*store.get(constellationHostAtom) ??*/ "constellation.microcosm.blue";
  // : QueryOptions<
  //   | linksRecordsResponse
  //   | linksDidsResponse
  //   | linksCountResponse
  //   | linksAllResponse
  //   | undefined,
  //   Error
  // >
  return queryOptions({
    queryKey: ["constellation", query?.method, query?.target, query?.collection, query?.path, query?.cursor] as const,
    queryFn: async () => {
      if (!query) return undefined as undefined
      const method = query.method
      const target = query.target
      const collection = query?.collection
      const path = query?.path
      const cursor = query.cursor
      const res = await fetch(
        `https://${constellationHost}${method}?target=${encodeURIComponent(target)}${collection ? `&collection=${encodeURIComponent(collection)}` : ""}${path ? `&path=${encodeURIComponent(path)}` : ""}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`
      );
      if (!res.ok) throw new Error("Failed to fetch post");
      try {
        switch (method) {
          case "/links":
            return (await res.json()) as linksRecordsResponse;
          case "/links/distinct-dids":
            return (await res.json()) as linksDidsResponse;
          case "/links/count":
            return (await res.json()) as linksCountResponse;
          case "/links/count/distinct-dids":
            return (await res.json()) as linksCountResponse;
          case "/links/all":
            return (await res.json()) as linksAllResponse;
          default:
            return undefined;
        }
      } catch (_e) {
        return undefined;
      }
    },
    // enforce short lifespan
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,
  });
}
export function useQueryConstellation(query: {
  method: "/links";
  target: string;
  collection: string;
  path: string;
  cursor?: string;
}): UseQueryResult<linksRecordsResponse, Error>;
export function useQueryConstellation(query: {
  method: "/links/distinct-dids";
  target: string;
  collection: string;
  path: string;
  cursor?: string;
}): UseQueryResult<linksDidsResponse, Error>;
export function useQueryConstellation(query: {
  method: "/links/count";
  target: string;
  collection: string;
  path: string;
  cursor?: string;
}): UseQueryResult<linksCountResponse, Error>;
export function useQueryConstellation(query: {
  method: "/links/count/distinct-dids";
  target: string;
  collection: string;
  path: string;
  cursor?: string;
}): UseQueryResult<linksCountResponse, Error>;
export function useQueryConstellation(query: {
  method: "/links/all";
  target: string;
}): UseQueryResult<linksAllResponse, Error>;
export function useQueryConstellation(): undefined;
export function useQueryConstellation(query?: {
  method:
    | "/links"
    | "/links/distinct-dids"
    | "/links/count"
    | "/links/count/distinct-dids"
    | "/links/all";
  target: string;
  collection?: string;
  path?: string;
  cursor?: string;
}):
  | UseQueryResult<
      | linksRecordsResponse
      | linksDidsResponse
      | linksCountResponse
      | linksAllResponse
      | undefined,
      Error
    >
  | undefined {
  //if (!query) return;
  return useQuery(
    constructConstellationQuery(query)
  );
}

type linksRecord = {
  did: string;
  collection: string;
  rkey: string;
};
type linksRecordsResponse = {
  total: string;
  linking_records: linksRecord[];
  cursor?: string;
};
type linksDidsResponse = {
  total: string;
  linking_dids: string[];
  cursor?: string;
};
type linksCountResponse = {
  total: string;
};
type linksAllResponse = {
  links: Record<
    string,
    Record<
      string,
      {
        records: number;
        distinct_dids: number;
      }
    >
  >;
};

export function constructFeedSkeletonQuery(options?: {
  feedUri: string;
  agent?: ATPAPI.AtpAgent;
  isAuthed: boolean;
  pdsUrl?: string;
  feedServiceDid?: string;
}) {
  return queryOptions({
    // The query key includes all dependencies to ensure it refetches when they change
    queryKey: ["feedSkeleton", options?.feedUri, { isAuthed: options?.isAuthed, did: options?.agent?.did }],
    queryFn: async () => {
      if (!options) return undefined as undefined
      const { feedUri, agent, isAuthed, pdsUrl, feedServiceDid } = options;
      if (isAuthed) {
        // Authenticated flow
        if (!agent || !pdsUrl || !feedServiceDid) {
          throw new Error("Missing required info for authenticated feed fetch.");
        }
        const url = `${pdsUrl}/xrpc/app.bsky.feed.getFeedSkeleton?feed=${encodeURIComponent(feedUri)}`;
        const res = await agent.fetchHandler(url, {
          method: "GET",
          headers: {
            "atproto-proxy": `${feedServiceDid}#bsky_fg`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Authenticated feed fetch failed: ${res.statusText}`);
        return (await res.json()) as ATPAPI.AppBskyFeedGetFeedSkeleton.OutputSchema;
      } else {
        // Unauthenticated flow (using a public PDS/AppView)
        const url = `https://discover.bsky.app/xrpc/app.bsky.feed.getFeedSkeleton?feed=${encodeURIComponent(feedUri)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Public feed fetch failed: ${res.statusText}`);
        return (await res.json()) as ATPAPI.AppBskyFeedGetFeedSkeleton.OutputSchema;
      }
    },
    //enabled: !!feedUri && (isAuthed ? !!agent && !!pdsUrl && !!feedServiceDid : true),
  });
}

export function useQueryFeedSkeleton(options?: {
  feedUri: string;
  agent?: ATPAPI.AtpAgent;
  isAuthed: boolean;
  pdsUrl?: string;
  feedServiceDid?: string;
}) {
  return useQuery(constructFeedSkeletonQuery(options));
}

export function constructPreferencesQuery(agent?: ATPAPI.AtpAgent | undefined, pdsUrl?: string | undefined) {
  return queryOptions({
    queryKey: ['preferences', agent?.did],
    queryFn: async () => {
      if (!agent || !pdsUrl) throw new Error("Agent or PDS URL not available");
      const url = `${pdsUrl}/xrpc/app.bsky.actor.getPreferences`;
      const res = await agent.fetchHandler(url, { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
  });
}
export function useQueryPreferences(options: {
  agent?: ATPAPI.AtpAgent | undefined, pdsUrl?: string | undefined
}) {
  return useQuery(constructPreferencesQuery(options.agent, options.pdsUrl));
}



export function constructArbitraryQuery(uri?: string) {
  return queryOptions({
    queryKey: ["arbitrary", uri],
    queryFn: async () => {
      if (!uri) return undefined as undefined
      const res = await fetch(
        `https://slingshot.microcosm.blue/xrpc/com.bad-example.repo.getUriRecord?at_uri=${encodeURIComponent(uri)}`
      );
      if (!res.ok) throw new Error("Failed to fetch post");
      try {
        return (await res.json()) as {
          uri: string;
          cid: string;
          value: any;
        };
      } catch (_e) {
        return undefined;
      }
    },
  });
}
export function useQueryArbitrary(uri: string): UseQueryResult<
  {
    uri: string;
    cid: string;
    value: any;
  },
  Error
>;
export function useQueryArbitrary(): UseQueryResult<
  undefined,
  Error
>;
export function useQueryArbitrary(uri?: string): UseQueryResult<
  {
    uri: string;
    cid: string;
    value: any;
  } | undefined,
  Error
>;
export function useQueryArbitrary(uri?: string) {
  return useQuery(constructArbitraryQuery(uri));
}

export function constructFallbackNothingQuery(){
  return queryOptions({
    queryKey: ["nothing"],
    queryFn: async () => {
      return undefined
    },
  });
}

type ListRecordsResponse = {
  cursor?: string;
  records: {
    uri: string;
    cid: string;
    value: ATPAPI.AppBskyFeedPost.Record;
  }[];
};

export function constructAuthorFeedQuery(did: string, pdsUrl: string) {
  return infiniteQueryOptions({
    queryKey: ['authorFeed', did] as const,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      readonly ["authorFeed", string],
      string | undefined
    >): Promise<ListRecordsResponse> => {
      const limit = 25;
      
      const cursor = pageParam as string | undefined;
      const cursorParam = cursor ? `&cursor=${cursor}` : '';
      
      const url = `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${did}&collection=app.bsky.feed.post&limit=${limit}${cursorParam}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch author's posts");
      
      return res.json() as Promise<ListRecordsResponse>;
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined,
  });
}

export function useInfiniteQueryAuthorFeed(did: string | undefined, pdsUrl: string | undefined) {
  const { queryKey, queryFn } = constructAuthorFeedQuery(did!, pdsUrl!);
  
  return useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: undefined as never, // ???? what is this shit
    getNextPageParam: (lastPage) => lastPage.cursor as null | undefined,
    enabled: !!did && !!pdsUrl,
  });
}

type FeedSkeletonPage = ATPAPI.AppBskyFeedGetFeedSkeleton.OutputSchema;

export function constructInfiniteFeedSkeletonQuery(options: {
  feedUri: string;
  agent?: ATPAPI.AtpAgent;
  isAuthed: boolean;
  pdsUrl?: string;
  feedServiceDid?: string;
}) {
  const { feedUri, agent, isAuthed, pdsUrl, feedServiceDid } = options;
  
  return infiniteQueryOptions({
    queryKey: ["feedSkeleton", feedUri, { isAuthed, did: agent?.did }] as const,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      readonly ["feedSkeleton", string, { isAuthed: boolean; did?: string }],
      string | undefined
    >): Promise<FeedSkeletonPage> => {
      const cursorParam = pageParam ? `&cursor=${pageParam}` : "";
      
      if (isAuthed) {
        if (!agent || !pdsUrl || !feedServiceDid) {
          throw new Error("Missing required info for authenticated feed fetch.");
        }
        const url = `${pdsUrl}/xrpc/app.bsky.feed.getFeedSkeleton?feed=${encodeURIComponent(feedUri)}${cursorParam}`;
        const res = await agent.fetchHandler(url, {
          method: "GET",
          headers: {
            "atproto-proxy": `${feedServiceDid}#bsky_fg`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Authenticated feed fetch failed: ${res.statusText}`);
        return (await res.json()) as FeedSkeletonPage;
      } else {
        const url = `https://discover.bsky.app/xrpc/app.bsky.feed.getFeedSkeleton?feed=${encodeURIComponent(feedUri)}${cursorParam}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Public feed fetch failed: ${res.statusText}`);
        return (await res.json()) as FeedSkeletonPage;
      }
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
    initialPageParam: undefined,
  });
}

export function useInfiniteQueryFeedSkeleton(options: {
  feedUri: string;
  agent?: ATPAPI.AtpAgent;
  isAuthed: boolean;
  pdsUrl?: string;
  feedServiceDid?: string;
}) {
  const { queryKey, queryFn } = constructInfiniteFeedSkeletonQuery(options);
  
  return useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: undefined as never,
    getNextPageParam: (lastPage) => lastPage.cursor as null | undefined,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    enabled: !!options.feedUri && (options.isAuthed ? !!options.agent && !!options.pdsUrl && !!options.feedServiceDid : true),
  });
}