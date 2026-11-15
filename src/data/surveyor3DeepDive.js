// Surveyor 3 mission archive — ages ~12–17; verify against NASA sources before publish.

export const MISSION_SOURCES = [
  {
    code: "001",
    label: "NASA Science — Surveyor 3",
    url: "https://science.nasa.gov/mission/surveyor-3/",
  },
  {
    code: "002",
    label: "NASA History — Beyond Earth: A Chronicle of Deep Space Exploration",
    url: "https://www.nasa.gov/ebooks/beyond-earth-a-chronicle-of-deep-space-exploration-1958-2016/",
  },
];

const sections = [
  {
    id: "introduction",
    chapter: "01",
    title: "CAN THE MOON HOLD A SPACECRAFT?",
    kicker: "Introduction",
    cameraTarget: "fullLander",
    paragraphs: [
      "Surveyor 3 was the second in NASA’s Surveyor series to make a {{softLanding}} on the Moon. It launched on April 17, 1967, and its objective was a lunar soft landing. Its tests answered a big question. Scientists concluded that the lunar surface was solid enough to hold the weight of an Apollo lunar module.",
      "Surveyor 3 is also famous for what happened later. Apollo 12 astronauts walked to it and brought some of its parts back to Earth.",
    ],
    telemetry: [
      { label: "Launched", value: "17 APR 1967", unit: "" },
      { label: "Landed", value: "20 APR 1967", unit: "" },
      { label: "TV pictures sent", value: "6,326", unit: "" },
      { label: "Mass", value: "2,200", unit: "LB" },
      { label: "Last contact", value: "4 MAY 1967", unit: "" },
    ],
    image: {
      src: "/surveyor3/apollo12-visit.jpg",
      caption:
        "Apollo 12’s Lunar Module in the background and Surveyor 3 in the foreground, during the second Apollo 12 moonwalk",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "launch",
    chapter: "02",
    title: "A SECOND BURN FROM EARTH ORBIT.",
    kicker: "Launch",
    cameraTarget: "fullLanderHigh",
    paragraphs: [
      "Surveyor 3 launched from Launch Complex 36B at Cape Canaveral, Florida, on an Atlas Centaur rocket. It was the third engineering flight of the Surveyor series. Unlike the previous Surveyors, it began its mission from a {{parkingOrbit}} around Earth, with a burn from the {{centaurUpperStage}}. The Centaur was now capable of multiple firings.",
    ],
    image: {
      src: "/surveyor3/landing-crater.jpg",
      caption: "Surveyor Crater in Oceanus Procellarum — Surveyor 3’s landing region",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "landing",
    chapter: "03",
    title: "THREE TOUCHDOWNS.",
    kicker: "A bouncy landing",
    cameraTarget: "legs",
    paragraphs: [
      "During the descent, highly reflective rocks confused the lander’s {{descentRadar}}. The main engine did not cut off at the right moment, at about 14 feet (4.3 meters) above the surface.",
      "So Surveyor 3 bounced off the Moon twice: first to a height of 33 feet (10 meters), then to 10 feet (3 meters). The third time, it settled down for a soft landing. That was at 00:04:17 UT on April 20, 1967, in the southeastern region of Oceanus Procellarum, at 3 degrees south latitude and 23.41 degrees west longitude.",
    ],
    image: {
      src: "/surveyor3/landing-crater.jpg",
      caption: "Surveyor Crater and the landing site region",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "tv-camera",
    chapter: "04",
    title: "EYES ON THE MOON.",
    kicker: "The TV camera",
    cameraTarget: "camera",
    paragraphs: [
      "Less than an hour after landing, Surveyor 3 started sending the first of 6,326 TV pictures of the surroundings. Its TV camera had two lenses (25 mm and 100 mm {{focalLength}}) mounted under a mirror that could move horizontally and vertically. A single 200-line picture took about 20 seconds to send. The camera could also take 600-line images, which used digital picture transmission.",
    ],
    image: {
      src: "/surveyor3/camera-artifact.jpg",
      caption: "Surveyor 3 television camera (later returned by Apollo 12)",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "sampler",
    chapter: "05",
    title: "A SCOOP AND A CLAW, AT WORK.",
    kicker: "The surface sampler",
    cameraTarget: "scoop",
    paragraphs: [
      "Surveyor 3 was the first Surveyor to carry a surface-sampling instrument. It could reach up to 5 feet (1.5 meters) from the lander and dig up to 7 inches (18 centimeters) deep. It could also manipulate lunar material in view of the TV camera.",
    ],
    image: {
      src: "/surveyor3/scoop-artifact.jpg",
      caption: "Surveyor 3 surface sampler scoop",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "soil-tests",
    chapter: "06",
    title: "FOUR TRENCHES, FOUR PUSHES, THIRTEEN HITS.",
    kicker: "Digging and testing",
    cameraTarget: "scoop",
    paragraphs: [
      "These were the most exciting experiments of the mission. Following commands from Earth, the sampler dug four trenches and carried out four {{bearingTest}}s and thirteen impact tests. A bearing test checks how much weight the ground can hold.",
    ],
    image: {
      src: "/surveyor3/soil-trench.jpg",
      caption: "Trenches dug in the lunar soil by Surveyor 3",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "wet-sand",
    chapter: "07",
    title: "LIKE WET SAND.",
    kicker: "Solid enough",
    cameraTarget: "legs",
    paragraphs: [
      "Based on these experiments, scientists concluded that lunar soil had a consistency similar to wet sand. Its {{bearingStrength}} was about 10 pounds per square inch (0.7 kilograms per square centimeter, or 98 kilopascals). In other words, it was solid enough to support an Apollo Lunar Module.",
    ],
    image: {
      src: "/surveyor3/footpad-imprint.jpg",
      caption: "Surveyor 3 footpad imprint in the lunar soil",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "end-of-mission",
    chapter: "08",
    title: "THE LAST SIGNAL.",
    kicker: "The lunar night",
    cameraTarget: "fullLanderLow",
    paragraphs: [
      "The last contact with the spacecraft was May 4, 1967. That was two days after the {{lunarNight}} began.",
    ],
    image: {
      src: "/surveyor3/landing-crater.jpg",
      caption: "Oceanus Procellarum — where Surveyor 3 worked until nightfall",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "apollo-12",
    chapter: "09",
    title: "ASTRONAUTS WALK UP TO A ROBOT.",
    kicker: "A visit from Apollo 12",
    cameraTarget: "fullLanderWide",
    paragraphs: [
      "More than three years later, on November 18, 1969, Apollo 12 astronauts Charles Conrad, Jr. and Alan L. Bean landed the Intrepid Lunar Module about 197 yards (180 meters) from the inactive Surveyor 3.",
      "On their second moonwalk ({{eva}}) on November 19, they walked over to it and took parts, including the soil scoop and the camera system. Scientists wanted to evaluate the effects of nearly two and a half years of exposure on the Moon’s surface.",
    ],
    image: {
      src: "/surveyor3/apollo12-visit.jpg",
      caption: "The Surveyor 3 lander with the Apollo 12 Lunar Module in the background",
      credit: "NASA",
    },
    sources: [{ code: "001" }, { code: "002" }],
  },
  {
    id: "legacy",
    chapter: "10",
    title: "A ROBOT THAT TESTED THE GROUND FOR HUMANS.",
    kicker: "Legacy",
    cameraTarget: "fullLanderWide",
    paragraphs: [
      "Surveyor 3 landed with no one aboard, and it dug trenches in the Moon’s soil under commands from Earth. Its results helped answer whether the surface could support a crewed lander, and later astronauts stood next to it.",
    ],
    reflectionPrompt:
      "If you could send one tool to dig on another world, what would you want to find out?",
    image: {
      src: "/surveyor3/apollo12-intrepid.jpg",
      caption: "Intrepid, the Apollo 12 lunar module, beside Surveyor Crater",
      credit: "NASA",
    },
    sources: [{ code: "001" }, { code: "002" }],
  },
];

export default sections;