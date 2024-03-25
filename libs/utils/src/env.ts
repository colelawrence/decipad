//
// Route all env uses through this file.
// For now this makes it much easier to deal with .env variables
// across the project in a typesafe way.
// If also lets you mock them with Jest.
//
// TODO: Change process.env to use import.meta.
// But this doesnt work for now :(
//

export const env = {
  ...process.env,
  ...import.meta.env,
} as ImportMetaEnv;
