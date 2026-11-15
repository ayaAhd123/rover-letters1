export const CAPTIONS = {
  en: [
    { start: 0.2, end: 3.9, text: "A long time ago, we sent machines to the Moon and to Mars." },
    { start: 3.9, end: 7.2, text: "They explored. They discovered." },
    { start: 7.2, end: 11, text: "They sent us pictures of worlds no one had ever seen." },
    { start: 11, end: 15, text: "Then their work was done, and they stayed behind." },
    { start: 15, end: 17, text: "Quiet... Alone." },
    { start: 17, end: 19, text: "But they are not forgotten." },
    { start: 19, end: 21, text: "Every machine has a story." },
    { start: 21, end: 23, text: "Come and listen." },
  ],
};

export function captionAt(cues, time) {
  for (const cue of cues) {
    if (time >= cue.start && time < cue.end) return cue.text;
  }
  return "";
}
