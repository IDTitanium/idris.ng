// Only publish career anecdotes supplied by Idris. These cases describe this repo.
export const bugs = [
  { id: 'touch', name: 'The scroll thief', location: 'Near the garden path', position: [-5.4, 0.65] as const, problem: 'A visitor swipes the island to scroll. Their character walks away instead. What should count as a destination tap?', options: ['Every pointer-down event', 'A pointer-up with very little movement', 'Disable page scrolling'], answer: 1, decision: 'Measure the distance between pointer-down and pointer-up. Only movements under 10 pixels become walking targets.', outcome: 'The island keeps tap-to-walk while a swipe can still scroll the page.', file: 'src/World.tsx' },
  { id: 'storage', name: 'The forgetful spark', location: 'Along the southern path', position: [-0.6, 4.1] as const, problem: 'Switching from Play to Read unmounts the 3D world. Where should collected-spark progress live?', options: ['Only inside the Three.js scene', 'Inside a random timeout', 'In React state above both views'], answer: 2, decision: 'Keep collected spark IDs in App and pass them into the scene when it mounts again.', outcome: 'Returning to Play restores the collected sparks without making the scene the owner of portfolio progress.', file: 'src/App.tsx' },
  { id: 'webgl', name: 'The blank-screen gremlin', location: 'East of the arcade', position: [5.5, -0.5] as const, problem: 'A browser cannot create a WebGL context. What should happen to the portfolio?', options: ['Show a fallback and keep the content cards working', 'Keep retrying forever', 'Hide the projects until WebGL works'], answer: 0, decision: 'Catch renderer initialization failures and keep the ordinary HTML destination cards and Read mode independent of WebGL.', outcome: 'The visitor can still explore the projects, writing, podcast, and contact panel.', file: 'src/World.tsx' },
] as const;
export type BugId = typeof bugs[number]['id'];

export const duckStories = [
  'Eight years of building, and still curious. Idris works across the full stack, with a foundation in networking and security.',
  'Building is only half the story. Idris also mentors people finding their feet in software development.',
  'SubSync, Clippy, and BytesBurn: two products in progress and a place for conversations. That is a pretty lively desk.',
];
export const duckJokes = [
  'It works on my pond. Have you tried deploying to a pond?',
  'I reviewed your code. Needs more breadcrumbs. Fewer bread dependencies.',
  'My debugging method? Listen carefully. Say nothing. Take all the credit.',
  'There are two hard things in software: cache invalidation, naming things, and counting ducks.',
];

// Cleaned copy of Idris's supplied recording; original remains untouched.
// Never substitute synthesized speech or an invented quote for his voice.
export const welcomeRecording: { src: string | null; transcript: string | null } = {
  src: '/audio/bytesburn-welcome.mp3',
  // Waiting for confirmation that the recorded words match the welcome script.
  transcript: null,
};
