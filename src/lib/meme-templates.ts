export const memeTemplatesWithHints = [
  { url: "https://placehold.co/600x400.png", hint: "person thinking" },
  { url: "https://placehold.co/600x450.png", hint: "cat reaction" },
  { url: "https://placehold.co/500x500.png", hint: "dog surprise" },
  { url: "https://placehold.co/800x600.png", hint: "man confused" },
  { url: "https://placehold.co/700x500.png", hint: "woman celebrating" },
  { url: "https://placehold.co/640x480.png", hint: "baby face" },
  { url: "https://placehold.co/550x450.png", hint: "funny animal" },
  { url: "https://placehold.co/820x540.png", hint: "success kid" },
  { url: "https://placehold.co/720x560.png", hint: "couple arguing" },
  { url: "https://placehold.co/600x600.png", hint: "dramatic scene" },
];

export const getRandomMemeTemplate = () => {
  return memeTemplatesWithHints[Math.floor(Math.random() * memeTemplatesWithHints.length)];
};
