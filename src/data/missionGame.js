/**
 * Mission game content v2 (Kids mode, Opportunity).
 * Edit text, photos, questions and answers here. No code changes needed.
 * Photos live in /public/opportunity/ (same files as the story).
 *
 * Phase 1 Build   -> BUILD (each part has a quiz)
 * Phase 2 Launch  -> LAUNCH
 * Phase 3 Mission -> MISSIONS (look + fill the blanks), BOARD, CLAIM, CHALLENGE, SIGN
 * Phase 4 Letter  -> LETTER
 *
 * Fill-the-blank sentences: {0}, {1}... are blanks. `answers` lists the accepted
 * words for that blank, `bank` is every tile the kid sees, `hint` is what the
 * companion says after a wrong try. Two wrong checks reveal the answer.
 */

export const COMPANION = { name: "Leo", image: null }; // no companion art yet: shows the first letter

const q = (id, label, correct) => ({ id, label, ...(correct ? { correct: true } : {}) });

export const BUILD = {
  intro: "Welcome, scientist! Opp is still in pieces. Tap a part below, then tap its empty spot on the rover.",
  pickFirst: "Pick a part from the tray first, then tap its spot.",
  wrongSlot: "Hmm, that part doesn't go there. Think about where it belongs on a rover!",
  slotHint: {
    camera: "Eyes go up high. Look at the top of the rover!",
    wheels: "Wheels go at the very bottom, so Opp can roll.",
    antenna: "The antenna sticks out on the right, like a phone aerial.",
    arm: "The arm hangs low on the left, near the wheels.",
    panels: "The solar panels spread out on the sides, like wings.",
  },
  done: "Opp is built! Every part has a job, and every piece is in the right place.",
  finishButton: "Back to story",
  nextPart: "Next part",
  quiz: {
    camera: {
      q: "What is the camera's job?",
      options: [q("a", "Taking pictures of Mars", true), q("b", "Keeping Opp warm"), q("c", "Making power")],
      hint: "Remember, the camera is Opp's eyes.",
      right: "Yes! My eyes take pictures of Mars for you.",
    },
    wheels: {
      q: "What do Opp's wheels do?",
      options: [q("a", "Help him drive over rocks and sand", true), q("b", "Send messages to Earth"), q("c", "Make energy")],
      hint: "Wheels are like legs.",
      right: "Yes! My six wheels carry me over rocks and sand.",
    },
    antenna: {
      q: "What does the antenna do?",
      options: [q("a", "Sends messages to Earth", true), q("b", "Takes pictures"), q("c", "Grinds rocks")],
      hint: "The antenna works like a phone.",
      right: "Yes! My antenna talks to the scientists on Earth.",
    },
    arm: {
      q: "What does the arm's microscope do?",
      options: [q("a", "Looks closely at tiny things in rocks", true), q("b", "Helps Opp drive"), q("c", "Makes power")],
      hint: "A microscope is like a magnifying glass.",
      right: "Yes! It lets me see tiny details in rocks.",
    },
    panels: {
      q: "What do the solar panels give Opp?",
      options: [q("a", "Energy from sunlight", true), q("b", "Water to drink"), q("c", "Pictures of Mars")],
      hint: "Opp doesn't use gas. Look at the sky!",
      right: "Yes! Solar panels turn sunlight into energy.",
    },
  },
};

// stages play in order; `progress` moves the dot from Earth (0) to Mars (100)
export const LAUNCH = {
  stages: [
    { label: "3", ms: 1000, mood: "scared", pose: null, progress: 0 },
    { label: "2", ms: 1000, mood: "scared", pose: null, progress: 0 },
    { label: "1", ms: 1000, mood: "surprised", pose: "shake", progress: 0 },
    { label: "Liftoff!", ms: 2500, mood: "surprised", pose: "look-up", progress: 12 },
    { label: "Seven months of space travel…", ms: 3000, mood: "sleepy", pose: "curl", progress: 70 },
    { label: "Parachute, rockets, airbags… BOUNCE!", ms: 2800, mood: "scared", pose: "bounce", progress: 100 },
  ],
  landed: "Opp landed on Mars, right inside a crater. Hole in one!",
  earth: "Earth",
  mars: "Mars",
  button: "Open Mission Control",
};

export const LOOK_PINS = 5; // how many pins the kid places before moving on
export const LOOK_PROMPT = `Tap ${LOOK_PINS} places in the photo that look interesting.`;

export const MISSIONS = [
  {
    id: "landscape",
    photo: "/opportunity/10-mars-landscape.jpg",
    alt: "The red, rocky ground of Mars where Opportunity explored",
    credit: "NASA/JPL-Caltech",
    lookIntro: "Opp's first photo just arrived! Look closely, like a scientist.",
    explainIntro: "Now explain what you see. Tap the words to fill the blanks.",
    clue: { id: "dust", label: "Red, dusty ground", evidence: false },
    explain: {
      template: "I see {0} in this photo. There is no {1}, so Mars today is {2}.",
      blanks: [
        { answers: ["red dusty ground"], hint: "Look at the ground in the photo. What color and what kind of ground is it?" },
        { answers: ["water"], hint: "Is there a lake or a river anywhere in the photo?" },
        { answers: ["dry"], hint: "No water means the ground is..." },
      ],
      bank: ["red dusty ground", "blue ocean", "water", "green plants", "dry", "wet"],
      fact: "Today Mars is dry and dusty. But rocks can remember the past!",
    },
  },
  {
    id: "blueberries",
    photo: "/opportunity/11-blueberries.jpg",
    alt: "Tiny round gray balls called blueberries inside a Mars rock",
    credit: "NASA/JPL-Caltech/Cornell",
    lookIntro: "Opp zoomed in with his microscope. Something is hiding inside this rock!",
    explainIntro: "Time to explain. Think about what you know about water and rocks.",
    clue: { id: "balls", label: "Blueberry rocks", evidence: true },
    explain: {
      template: "I see tiny {0} inside the rock. On Earth, balls like these grow when {1} soaks into rock. So this is a clue that Mars was {2} long ago.",
      blanks: [
        { answers: ["round balls"], hint: "Look at the shapes inside the rock. They are small and round." },
        { answers: ["water"], hint: "What soaks into rock and helps minerals grow?" },
        { answers: ["wet"], hint: "If water soaked into the rock, Mars wasn't dry. It was..." },
      ],
      bank: ["round balls", "footprints", "water", "fire", "wet", "dry"],
      fact: "Scientists call them blueberries, but they're made of rock. On Earth, balls like these grow when water soaks into rock.",
    },
  },
  {
    id: "water",
    photo: "/opportunity/12-water-evidence.jpg",
    alt: "Layered Mars rocks that hold salty minerals",
    credit: "NASA/JPL-Caltech",
    lookIntro: "Another clue! These rocks are full of minerals. Look closely.",
    explainIntro: "What do these minerals tell us? Fill in the blanks.",
    clue: { id: "salt", label: "Salty minerals", evidence: true },
    explain: {
      template: "The rocks have {0} minerals. When water {1}, it leaves salt behind. So this is a {2} that water was here.",
      blanks: [
        { answers: ["salty"], hint: "Think of the sea. What do minerals left by water taste like?" },
        { answers: ["dries up"], hint: "What happens to a puddle in the hot sun?" },
        { answers: ["clue"], hint: "A sign that helps scientists find the answer is called a..." },
      ],
      bank: ["salty", "sweet", "dries up", "freezes", "clue", "joke"],
      fact: "When water dries up, it leaves salt behind. That's a second clue!",
    },
  },
];

export const BOARD = {
  intro: "Now let's be real scientists. Which of your clues prove that Mars had water?",
  prompt: "Pin the clues that show water was on Mars.",
  extra: [{ id: "far", label: "Mars is far away", evidence: false }],
  hint: "Ask yourself: does this clue tell us anything about water?",
  done: "Yes! Two clues point to water. One clue could be a coincidence, but two make us more sure.",
};

export const CLAIM = {
  intro: "Now write your claim, the big idea scientists share. Use your evidence!",
  prompt: "Build your claim.",
  template: "Long ago, Mars was {0} because I found {1} and {2}.",
  blanks: [
    { answers: ["warmer and wetter"], hint: "Your clues are about water. Was Mars always dry?" },
    { answers: ["blueberry rocks", "salty minerals"], hint: "Pick a clue from your evidence board." },
    { answers: ["blueberry rocks", "salty minerals"], hint: "Pick the other clue from your evidence board." },
  ],
  bank: ["warmer and wetter", "always cold and dry", "blueberry rocks", "salty minerals", "red dusty ground", "Mars is far away"],
  fact: "That is what NASA scientists concluded from Opp's discoveries. You built it yourself!",
};

export const CHALLENGE = {
  intro: "Mission Control has a challenge question for you. Real scientists answer these too.",
  prompt: "Why do scientists look for more than one clue?",
  options: [
    q("a", "One clue could be a coincidence, so more clues make us surer", true),
    q("b", "Because it is more fun"),
    q("c", "Because the first clue is always wrong"),
  ],
  hint: "Think about why two clues are stronger than one.",
  right: "Exactly! Scientists never trust just one clue.",
};

export const SIGN = {
  intro: "Almost done! Sign your letter to Opp. A grown-up can help you write your name.",
  label: "Scientist name",
  placeholder: "Your name",
  button: "Finish my letter",
};

export const LETTER = {
  greeting: "Dear Opp,",
  thanks: "Thank you for sending your photos from Mars. Here is what I found out.",
  closing: "Your friend,",
  anonymous: "A young scientist",
  teacherTitle: "For the teacher",
  hintsLabel: "Hints used",
  helpLabel: "Steps where the answer was shown",
  none: "none",
};

export const UI = {
  steps: ["Build"],
  notebookTitle: "My scientist notebook",
  notebookEmpty: "Your notes will appear here.",
  print: "Print my letter",
  replay: "Play again",
  exit: "Back to Mars map",
};