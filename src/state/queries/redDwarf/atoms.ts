// do we even need jotai ?
// maybe, when we manually track follow / like state
// but thats a later thing

// import type AtpAgent from "@atproto/api";
// import { atom, createStore } from "jotai";
// import { atomWithStorage } from 'jotai/utils';

// export const store = createStore();

// export const selectedFeedUriAtom = atomWithStorage<string | null>(
//   'selectedFeedUri',
//   null
// );

// //export const feedScrollPositionsAtom = atom<Record<string, number>>({});

// export const feedScrollPositionsAtom = atomWithStorage<Record<string, number>>(
//   'feedscrollpositions',
//   {}
// );

// export const likedPostsAtom = atomWithStorage<Record<string, boolean>>(
//   'likedPosts',
//   {}
// );

// export const agentAtom = atom<AtpAgent|null>(null);
// export const authedAtom = atom<boolean>(false);

// export const constellationHostAtom = atomWithStorage<string>(
//   "constellationHost",
//   "constellation.microcosm.blue"
// )