/**
 * Kids build game for Ingenuity (Ginny) — same flow as Opportunity in MissionGame.
 */

export const COMPANION = { name: "Leo", image: null };

const q = (id, label, correct) => ({ id, label, ...(correct ? { correct: true } : {}) });

export const BUILD = {
  intro: "Welcome, pilot! Ginny is still in pieces. Tap a part below, then tap its empty spot on the helicopter.",
  pickFirst: "Pick a part from the tray first, then tap its spot.",
  wrongSlot: "Hmm, that part doesn't go there. Think about where it belongs on a helicopter!",
  slotHint: {
    blades: "Blades spin on top — look at the rotors!",
    solar: "The solar panel sits on top, above the body.",
    antenna: "The antenna is the tall piece that talks to Earth.",
    avionics: "My brain and body sit in the middle.",
    sensors: "Cameras and sensors look out near the front and bottom.",
    batteries: "Batteries sit low inside the body, near the middle.",
    legs: "Legs go at the very bottom so I can land softly.",
  },
  done: "Ginny is built! Every part has a job, and every piece is in the right place.",
  finishButton: "Back to story",
  nextPart: "Next part",
  quiz: {
    blades: {
      q: "Why do Ginny's blades spin so fast?",
      options: [
        q("a", "Mars air is very thin, so they need extra speed to lift me", true),
        q("b", "They make pictures of craters"),
        q("c", "They send radio messages home"),
      ],
      hint: "Mars has almost no air compared to Earth.",
      right: "Yes! Thin air means my blades have to spin very fast to push enough air.",
    },
    solar: {
      q: "What does the solar panel do?",
      options: [
        q("a", "Charges my batteries with sunlight", true),
        q("b", "Spins the rotors during flight"),
        q("c", "Helps me land on rocky ground"),
      ],
      hint: "The panel faces the sky.",
      right: "Yes! Sunlight charges my batteries for flights and heaters.",
    },
    antenna: {
      q: "How does Ginny talk to Earth?",
      options: [
        q("a", "Through the Perseverance rover and Mars orbiters", true),
        q("b", "By shouting really loud"),
        q("c", "With flashing lights only"),
      ],
      hint: "I use a radio relay, not a direct call home.",
      right: "Yes! My antenna sends data through Perseverance and satellites.",
    },
    avionics: {
      q: "What is avionics?",
      options: [
        q("a", "My flight computer — the brain that helps me fly", true),
        q("b", "The carbon-fiber legs"),
        q("c", "The spinning rotors"),
      ],
      hint: "It fits in a space about the size of a tissue box.",
      right: "Yes! Avionics is my brain — computers, heaters, and flight logic.",
    },
    sensors: {
      q: "What do Ginny's cameras help with?",
      options: [
        q("a", "Seeing the ground and finding a safe place to land", true),
        q("b", "Making the blades spin faster"),
        q("c", "Storing power for the night"),
      ],
      hint: "One camera looks down, another looks at the horizon.",
      right: "Yes! My cameras are my eyes for flying and scouting.",
    },
    batteries: {
      q: "What do the batteries power?",
      options: [
        q("a", "Flights, heaters, and my electronics", true),
        q("b", "Only the spinning blades, nothing else"),
        q("c", "The legs folding up on launch"),
      ],
      hint: "Mars nights get very cold.",
      right: "Yes! Batteries run flights, heaters, and all my inside parts.",
    },
    legs: {
      q: "Why does Ginny have four legs?",
      options: [
        q("a", "They help me land softly on Mars after each flight", true),
        q("b", "They dig into the soil for samples"),
        q("c", "They unfold into extra solar panels"),
      ],
      hint: "They are light carbon tubes, not wheels.",
      right: "Yes! My legs cushion each landing on the rocky surface.",
    },
  },
};

export const UI = {
  steps: ["Build"],
  exit: "Back to Mars map",
  replay: "Play again",
};