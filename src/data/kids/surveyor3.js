/**
 * Surveyor 3 — line-by-line briefing (same rhythm as Opportunity) then the crater game.
 */

const media = (src, caption) => ({
  src: `/surveyor3/${src}`,
  caption: { en: caption },
  credit: { en: "NASA" },
  alt: { en: caption },
});

function line(id, text, extra = {}) {
  return { id, text, mood: extra.mood || "happy", ...extra };
}

function surveyorQuestion({ prompt, options, correctIndex, explanation, hint, wrongText }) {
  return {
    prompt,
    options: options.map((label, i) => ({
      id: String(i),
      label,
      correct: i === correctIndex,
    })),
    explanation,
    hint,
    wrongText,
  };
}

export const SURVEYOR3_KIDS = {
  id: "surveyor-3",
  name: "Surveyor 3",
  missionTitle: "Find Apollo a safe landing",
  inviteTitle: "Want to walk Surveyor Crater and clear Apollo to land?",
  inviteBody:
    "Click the Moon, follow the green arrow to the safe pad, test the soil, and plant the flag beside Intrepid.",
  inviteYes: "Enter the crater",
  inviteNo: "Not now",
  playGameLabel: "Play the crater game",
  themeColor: "#9ad8ff",
  landingSite: "Surveyor Crater, Oceanus Procellarum",
  landingDate: "April 20, 1967",
  coordinates: { lat: -3.02, lon: -23.42 },

  segments: [
    {
      id: "meet",
      title: "Hi! I'm Surveyor 3",
      lines: [
        line("m1", "Hi! I'm Surveyor 3. I'm a robot lander, about as tall as a person.", {
          mood: "excited",
          pose: "wave",
          media: media("landing-crater.jpg", "Surveyor Crater, where I landed in 1967"),
        }),
        line("m2", "NASA set me down on the Moon on April 20, 1967, in a dark plain called Oceanus Procellarum.", {
          mood: "happy",
          highlight: "legs",
        }),
        line("m3", "I don't have wheels. Three landing legs and round footpads hold me up in the dust.", {
          mood: "happy",
          highlight: "legs",
          pose: "bounce",
        }),
        line("m4", "My solar panel is my lunch. It turns sunlight into power for my camera and radio.", {
          mood: "happy",
          highlight: "solar",
        }),
        line("m5", "Now make a guess before I tell you the rest…", { mood: "curious", pose: "wave" }),
      ],
      question: surveyorQuestion({
        prompt: "When did Surveyor 3 reach the Moon?",
        options: [
          "April 1967, two years before Apollo 12",
          "The same day Apollo 11 landed",
          "After the astronauts had already left",
        ],
        correctIndex: 0,
        hint: "The astronauts of Apollo 12 arrived in November 1969.",
        explanation: "April 20, 1967. I waited more than two years so people could walk over and visit me.",
        wrongText: "I got here first. April 1967 — Apollo 12 didn't arrive until November 1969.",
      }),
    },
    {
      id: "job",
      title: "Why NASA sent me",
      lines: [
        line("j1", "Before people could land, NASA had one big worry: would a heavy ship sink into the Moon dust?", {
          mood: "curious",
          highlight: "legs",
        }),
        line("j2", "My footpads pressed into the ground. If they sank, astronauts could not come.", {
          mood: "happy",
          highlight: "legs",
          media: media("footpad-imprint.jpg", "The print my footpad left in the lunar dust"),
        }),
        line("j3", "My blue scoop is a little shovel. It digs a trench and feels how hard the soil pushes back.", {
          mood: "excited",
          highlight: "scoop",
          pose: "dig",
          media: media("soil-trench.jpg", "A trench dug by the soil scoop"),
        }),
        line("j4", "My TV camera is my eye. It sends pictures of the crater all the way to Earth.", {
          mood: "happy",
          highlight: "camera",
          pose: "scan",
          media: media("camera-artifact.jpg", "My television camera, later brought home by Apollo 12"),
        }),
        line("j5", "My antenna is my phone. Every number I measure goes to scientists in Houston.", {
          mood: "happy",
          highlight: "antenna",
        }),
        line("j6", "Your turn. What was the job that mattered most?", { mood: "curious" }),
      ],
      question: surveyorQuestion({
        prompt: "What was Surveyor 3's most important job?",
        options: [
          "Prove the soil could hold a heavy lander",
          "Search for oceans on Mars",
          "Build a base for people to live in",
        ],
        correctIndex: 0,
        hint: "Think about the footpads and the scoop, not a city.",
        explanation: "Yes. The soil was firm — about as strong as damp beach sand. A lunar lander could stand on it.",
        wrongText: "My real job was the soil. If the dust was too soft, Apollo could not land.",
      }),
    },
    {
      id: "bounce",
      title: "The landing that bounced",
      lines: [
        line("b1", "Landing was supposed to be one soft touch. My radar would cut the engines at the right second.", {
          mood: "happy",
          highlight: "legs",
        }),
        line("b2", "Bright rocks in the crater confused that radar. The engines stayed on.", {
          mood: "surprised",
          pose: "bounce",
          highlight: "legs",
        }),
        line("b3", "I bounced twice, then settled on a slope inside the crater.", {
          mood: "surprised",
          pose: "bounce",
          media: media("footpad-imprint.jpg", "I bounced twice before the engines finally stopped"),
        }),
        line("b4", "I was tipped, but my legs, camera, and scoop still worked. The soil test could go on.", {
          mood: "happy",
          highlight: "scoop",
          pose: "dig",
        }),
        line("b5", "What should a pilot do if the radar will not turn the engines off?", { mood: "curious" }),
      ],
      question: surveyorQuestion({
        prompt: "The landing radar glitches. What is the safe move?",
        options: [
          "Cut the engines by hand before you bounce again",
          "Fire the engines until the fuel tank is empty",
          "Turn off the camera and wait a year",
        ],
        correctIndex: 0,
        hint: "Engines that stay on push you back off the ground.",
        explanation: "Cut the engines. I bounced twice because mine stayed lit. Then I could finally rest and dig.",
        wrongText: "Leaving the engines on is what made me bounce. A pilot cuts them by hand.",
      }),
    },
    {
      id: "visit",
      title: "Apollo 12 comes to visit",
      lines: [
        line("v1", "On November 19, 1969, Apollo 12's lander Intrepid touched down a short walk from me.", {
          mood: "excited",
          pose: "wave",
          media: media("apollo12-visit.jpg", "Apollo 12 astronauts walk over to Surveyor 3"),
        }),
        line("v2", "Pete Conrad and Alan Bean were the crew. They could see me from their window.", {
          mood: "happy",
          highlight: "camera",
        }),
        line("v3", "They snipped pieces of me to take home — my camera, scoop parts, and a bit of tubing.", {
          mood: "curious",
          highlight: "camera",
          media: media("apollo12-intrepid.jpg", "Intrepid, the Apollo 12 lunar module"),
        }),
        line("v4", "The Moon has no wind. Their flag stays open on a bar across the top.", {
          mood: "excited",
          pose: "wave",
        }),
        line("v5", "How close did those astronauts land?", { mood: "curious" }),
      ],
      question: surveyorQuestion({
        prompt: "How close did Apollo 12 land to Surveyor 3?",
        options: [
          "A short walk — only a few hundred feet",
          "On the far side of the Moon",
          "They looked, but never found the lander",
        ],
        correctIndex: 0,
        hint: "Conrad joked that Surveyor was right down the middle of the road.",
        explanation: "About 600 feet. Close enough to walk over, say hello, and carry pieces of me back to Earth.",
        wrongText: "They found me easily. Intrepid landed about 600 feet away — a short Moon walk.",
      }),
    },
  ],

  gameBeats: {
    search: {
      title: "1 · Scout",
      line: "Click the crater and follow the green arrow. The glowing ring is a flat, firm pad — the kind Apollo needs.",
      voice: "explorationIntro",
      action: "Start scouting",
    },
    dig: {
      title: "2 · Scoop",
      line: "My blue scoop is a little shovel. Tap Dig and I will test how hard the dust pushes back.",
      voice: "spot1Arrive",
      action: "Deploy the scoop",
    },
    scan: {
      title: "3 · Panorama",
      line: "My TV camera is my eye. Spin it around so Houston can see the crater walls before a crew arrives.",
      voice: "spot3Arrive",
      action: "Spin the camera",
    },
    notify: {
      title: "4 · Radio",
      line: "Soil is firm. Pictures are in. Open the dish and call Pete Conrad and Alan Bean — they are go.",
      voice: "spot2Success",
      action: "Open the dish",
    },
    landing: {
      title: "5 · Intrepid",
      line: "November 1969. Watch Intrepid ease down onto the pad my footpads already tested.",
      voice: "landingView",
      action: "Watch the landing",
    },
    flag: {
      title: "6 · Flag",
      line: "There is no wind on the Moon. Tap once and plant the Stars and Stripes beside Intrepid.",
      voice: "flagView",
      action: "Step outside",
    },
  },

  radioCallouts: {
    explorationIntro:
      "Surveyor 3 online. Click the ground and follow the green arrow to the glowing safe pad.",
    stage1Intro:
      "Altitude 10 meters! Tap Cut Vernier Engines inside the green zone to stop the bounce!",
    stage1Success:
      "Touchdown confirmed! Settled at 14 degrees inside Surveyor Crater. Deploying robotic scoop!",
    spot1Arrive:
      "Safe pad locked. Tap Dig and I will run the scoop until the soil test is finished.",
    spot1Success:
      "Bearing strength reads 6 PSI — damp beach sand! The surface can hold Intrepid.",
    spot2Arrive:
      "Site two: Surface Sampler claw. Grab a regolith clod and crush-test telemetry for Houston.",
    spot2Success:
      "Soil test complete. Firm as damp beach sand. Apollo 12 is cleared to land. Call them in.",
    spot3Arrive:
      "Site three: Panoramic camera and landing beacon. Aim at crater landmarks and lock the guide beam.",
    spot3Success:
      "Houston, this is Surveyor. Pad is safe — Intrepid, you are go for landing!",
    landingView:
      "You are looking out Intrepid's window. The engines are easing the lander onto soil my footpads already tested.",
    flagView:
      "Visor down. There is no wind up here. When I stop walking, tap once and plant the flag.",
    stage2Intro:
      "Scissor arm extended. Run all three soil strength tests to clear Apollo 12 for landing.",
    stage2Success:
      "Soil bearing strength 6 PSI—solid as damp beach sand! Apollo 12 is cleared to land!",
    stage3Intro:
      "Surveyor mission complete! November 1969 astronauts will walk this same crater.",
    apollo12Quote:
      "Hey, there it is! Right down the middle of the road! Let's walk down and check out Surveyor 3!",
    stage3Success:
      "The United States flag is on the Moon. Surveyor 3’s job is done — Apollo 12 has landed.",
  },

  explorationSpots: [
    {
      id: "spot-bearing",
      label: "Soil bearing pad",
      worldX: 380,
      worldY: 200,
      info: {
        title: "Can the Moon hold a heavy lander?",
        voiceLine:
          "Before Apollo, NASA sent me to press my footpad into the regolith — if I sink, astronauts can't land!",
        narration:
          "Surveyor 3's first job: prove the Oceanus Procellarum dust is firm enough for a 15-ton Lunar Module.",
      },
      arriveCallout: "spot1Arrive",
      successCallout: "spot1Success",
      game: "soil-bearing",
      highlight: "legs",
    },
    {
      id: "spot-scoop",
      label: "Sampler claw trench",
      worldX: 520,
      worldY: 340,
      info: {
        title: "Soil Mechanics Surface Sampler",
        voiceLine:
          "My blue scissor arm digs trenches and grabs clods — every crush test radios strength data to Earth.",
        narration:
          "The accordion scoop can dig 17.5 cm deep and measure how hard lunar dirt resists pressure.",
      },
      arriveCallout: "spot2Arrive",
      successCallout: "spot2Success",
      game: "scoop-crush",
      highlight: "scoop",
    },
    {
      id: "spot-beacon",
      label: "Pan camera & beacon",
      worldX: 680,
      worldY: 240,
      info: {
        title: "Chart the crater for Apollo",
        voiceLine:
          "I spin my mirror camera to map Surveyor Crater and align my solar panel antenna as a landing beacon.",
        narration:
          "Panoramic photos plus a locked beacon guided Apollo 12 to land just 535 feet from this crater rim.",
      },
      arriveCallout: "spot3Arrive",
      successCallout: "spot3Success",
      game: "camera-beacon",
      highlight: "camera",
    },
  ],

  artifacts: [
    {
      id: "tv-camera",
      name: "Surveyor 3 Television Camera",
      nasaId: "AS12-48-7100",
      image: "/surveyor3/camera-artifact.jpg",
      mass: "6.8 kg (15 lbs)",
      launchState:
        "Bright white thermal paint, spotless optical mirror, sealed electronics.",
      recoveredState:
        "White paint turned golden-tan from 31 months of intense solar UV radiation; mirror coated in fine lunar dust; glass survived -170°C to +70°C swings without cracking.",
      museumLocation: "Smithsonian National Air & Space Museum, Washington, D.C.",
    },
    {
      id: "soil-scoop",
      name: "Soil Mechanics Surface Sampler (Scoop)",
      nasaId: "AS12-48-7133",
      image: "/surveyor3/soil-trench.jpg",
      mass: "2.1 kg (4.6 lbs)",
      launchState: "Painted bright blue with crisp aluminum scissor-arm hinges.",
      recoveredState:
        "Blue paint faded by solar radiation, but its electric motor and hinges remained intact—carrying genuine Oceanus Procellarum dust inside the scoop back to Earth.",
      museumLocation: "NASA Jet Propulsion Laboratory (JPL) / Cosmosphere",
    },
    {
      id: "strut-tubes",
      name: "Aluminum Support Strut Tubes",
      nasaId: "AS12-48-7136",
      image: "/surveyor3/apollo12-visit.jpg",
      mass: "0.4 kg (0.9 lbs)",
      launchState: "Smooth polished and painted aerospace aluminum tubing.",
      recoveredState:
        "Snipped off with tube cutters by Pete Conrad so engineers could count microscopic micrometeorite pits and test metal fatigue after 942 days on the Moon.",
      museumLocation: "NASA Johnson Space Center Curation Lab, Houston",
    },
  ],
};