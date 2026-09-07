export type PlaceId = 'about' | 'work' | 'writing' | 'podcast' | 'contact';
export const linkedin = 'https://www.linkedin.com/in/lawal-idris-oluwaseun/';
export const projects = {
  subsync: { name: 'SubSync', url: 'https://web.mysubsync.com/' },
  clippy: { name: 'Clippy', url: 'https://useclippy.cc' },
};
export const podcastUrl = 'https://www.youtube.com/@BytesBurn';
export const places: { id: PlaceId; name: string; subtitle: string; number: string; color: string; position: [number, number, number] }[] = [
  { id: 'about', name: 'The studio', subtitle: 'A little about me', number: '01', color: '#ed734e', position: [-3.4, 3.4, -2] },
  { id: 'work', name: 'The arcade', subtitle: 'SubSync & Clippy', number: '02', color: '#9273c9', position: [3.15, 3.05, -1.5] },
  { id: 'writing', name: 'The garden', subtitle: 'Ideas worth sharing', number: '03', color: '#619d81', position: [-3.7, 1.9, 2.7] },
  { id: 'podcast', name: 'The radio', subtitle: 'BytesBurn Podcast', number: '04', color: '#c86d4f', position: [0.4, 3.1, -3.5] },
  { id: 'contact', name: 'The portal', subtitle: 'Our next adventure', number: '05', color: '#e9a64a', position: [4.25, 2.8, 2.45] },
];
