// Viking 1 mission archive — ages ~12–17; verify against NASA sources before publish.

export const MISSION_SOURCES = [
  {
    code: "001",
    label: "NASA Science — Viking 1",
    url: "https://science.nasa.gov/mission/viking-1/",
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
    title: "THE DAY MARS CAME WITHIN REACH.",
    kicker: "Introduction",
    cameraTarget: "fullLander",
    paragraphs: [
      "For all of history, people could see Mars in the sky but never touch it. That changed on July 20, 1976, when NASA’s Viking 1 {{lander}} touched down safely on the surface and began sending back the first images from the Red Planet. Viking 1 was the first truly successful landing on Mars. The Soviet Mars 3 lander landed in 1971, but contact was lost seconds after touchdown.",
      "Viking was designed to collect evidence on the possibility of life on Mars. It began the exploration of the Martian surface, and that work continues today. NASA is celebrating “Viking: 50 Years on Mars.”",
    ],
    telemetry: [
      { label: "Launched", value: "20 AUG 1975", unit: "" },
      { label: "Landed", value: "20 JUL 1976", unit: "" },
      { label: "Lander photos", value: "4,500", unit: "" },
      { label: "Orbiter images", value: "52,663", unit: "" },
      { label: "Lander last contact", value: "11 NOV 1982", unit: "" },
    ],
    image: {
      src: "/viking/05-first-image-footpad.jpg",
      caption: "The first photograph ever taken on the surface of Mars, taken by Viking 1 just minutes after landing",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "orbiter-lander",
    chapter: "02",
    title: "AN ORBITER ABOVE. A LANDER BELOW.",
    kicker: "Two spacecraft in one",
    cameraTarget: "fullLanderWide",
    paragraphs: [
      "Each Viking spacecraft had two main parts. The {{orbiter}} (5,157 lb, or 2,339 kg) circled Mars from above. The {{lander}} (2,156 lb, or 978 kg) went down to the surface. The orbiter’s design borrowed heavily from the Mariner spacecraft. The lander looked like a much larger version of the Surveyor lunar lander.",
      "The two parts also got their power in different ways. The orbiters were solar-powered. Each lander carried two SNAP-19 {{rtg}}s. The mission was designed and managed by NASA, with the Langley Research Center and the Jet Propulsion Laboratory.",
    ],
    image: {
      src: "/viking/02-orbiter-and-lander.jpg",
      caption: "Line drawings of the Viking orbiter and the Viking lander",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "launch",
    chapter: "03",
    title: "A LAST-MINUTE SWITCH.",
    kicker: "Launch",
    cameraTarget: "fullLanderHigh",
    paragraphs: [
      "Viking 1 launched on August 20, 1975, from Launch Complex 41 at Cape Canaveral, Florida, on a Titan IIIE-Centaur rocket. Before launch, the batteries of the first spacecraft were discharged. So NASA replaced it with the second spacecraft, which launched as Viking 1.",
      "On the way, the team made three course corrections: August 27, 1975, and June 10 and June 15, 1976.",
    ],
    image: {
      src: "/viking/03-launch-1975.jpg",
      caption: "Viking 1 launch, August 20, 1975",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "landing-site",
    chapter: "04",
    title: "THE FIRST PLAN WAS TOO ROUGH.",
    kicker: "Finding a safe place",
    cameraTarget: "fullLander",
    paragraphs: [
      "Viking 1 entered orbit around Mars on June 19, 1976. The orbit was very stretched at first, and the next day the orbiter moved into an operational orbit. That day it began sending photos of the primary landing site in the Chryse region. Scientists found the area was rougher than expected.",
      "Using the new photos, they chose a different site, on the western slopes of Chryse Planitia, the “Golden Plain.”",
    ],
    image: {
      src: "/viking/04-landing-site-chryse.jpg",
      caption: "The Plain of Gold on Mars — Chryse Planitia",
      credit: "NASA/JPL-Caltech",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "landing",
    chapter: "05",
    title: "DOWN TO THE GOLDEN PLAIN.",
    kicker: "Landing",
    cameraTarget: "legs",
    paragraphs: [
      "On July 20, 1976, the lander separated from the orbiter. During a complicated atmospheric entry, the probe took air samples. The {{aeroshell}} carried instruments too: a retarding potential analyzer, an upper-atmosphere mass spectrometer, and sensors for pressure, temperature and density.",
      "At 11:53:06 UT, Viking Lander 1 set down safely at 22.483° north latitude and 47.94° west longitude. It landed about 17 miles (28 kilometers) from its planned target.",
    ],
    image: {
      src: "/viking/01-viking-lander-portrait.jpg",
      caption: "The Viking 1 lander on Mars",
      credit: "NASA/JPL-Caltech",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "cameras",
    chapter: "06",
    title: "EYES ON TWO WORLDS: THE SKY AND THE GROUND.",
    kicker: "Cameras",
    cameraTarget: "deck",
    paragraphs: [
      "The lander had an imaging system of two {{facsimileCamera}}s. Once down, it took high-quality photographs in three colors. It also took a 300-degree {{panorama}} that showed parts of the spacecraft itself and the gently rolling plains around it.",
      "The orbiters had two vidicon cameras. Together, the two Viking orbiters returned 52,663 images of Mars and mapped about 97% of the surface at 984 feet (300 meters) resolution. The two landers returned 4,500 photos of their landing sites.",
    ],
    image: {
      src: "/viking/06-first-color-image.jpg",
      caption: "The first color picture of Mars from Viking 1",
      credit: "NASA/JPL-Caltech",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "instruments",
    chapter: "07",
    title: "A WHOLE LAB ON LEGS.",
    kicker: "Instruments and weather",
    cameraTarget: "instruments",
    paragraphs: [
      "Besides cameras, the lander carried a {{gcms}}, a {{seismometer}}, an X-ray fluorescence spectrometer, a biological laboratory, a weather instrument package (temperature, pressure and wind velocity) and a remote sampler arm.",
      "The weather instruments recorded temperatures from minus 123 °F (minus 86 °C) before dawn to minus 27 °F (minus 33 °C) in the afternoon. The seismometer, however, did not work.",
    ],
    image: {
      src: "/viking/08-lander-diagram.jpg",
      caption: "The parts of the Viking lander",
      credit: "NASA",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "arm",
    chapter: "08",
    title: "THE FIRST SCOOP.",
    kicker: "The robot arm",
    cameraTarget: "arm",
    paragraphs: [
      "On July 28, 1976, the lander’s robot arm scooped up the first soil samples and put them into a special biological laboratory that included a {{gcms}}. This is how Viking tested the soil for signs of life.",
    ],
    image: {
      src: "/viking/09-trenches.jpg",
      caption: "Trenches dug by the soil scoop",
      credit: "NASA/JPL-Caltech",
    },
    sources: [{ code: "001" }],
  },
  {
    id: "life",
    chapter: "09",
    title: "LIFE, OR NOT?",
    kicker: "The life question",
    cameraTarget: "deck",
    paragraphs: [
      "The combined data from the four soil samples could have been read as a weak positive for life. But the main test for {{organicCompounds}} used a gas chromatograph, which could detect organic compounds above about 10 to 100 parts per billion in the soil, and it gave negative results.",
      "Viking also found an abundance of sulfur in the soil, different from any known material found on Earth or the Moon. Viking’s job was to collect evidence on the possibility of life. The results were successful, but they did not settle the question.",
    ],
    image: {
      src: "/viking/07-sunset.jpg",
      caption: "A sunset on Mars seen by Viking 1",
      credit: "NASA/JPL-Caltech",
    },
    sources: [{ code: "001" }, { code: "002" }],
  },
  {
    id: "end-of-mission",
    chapter: "10",
    title: "A LONG GOODBYE.",
    kicker: "End of mission",
    cameraTarget: "fullLanderLow",
    paragraphs: [
      "The primary mission ended in November 1976, but Viking kept working. There was an Extended Mission (November 1976 to May 1978) and a Continuation Mission (May 1978 to July 1979). The orbiter then ran a Survey Mission from July 1979 to July 1980. It took many more high-resolution images of the planet and its two moons, far better than Mariner 9’s. It was shut down on August 7, 1980, on its 1,489th orbit, after running out of {{attitudeControl}} propellant.",
      "The lander kept sending daily, and later weekly, weather reports. In January 1982 it was renamed the Thomas Mutch Memorial Station, after the leader of the Viking imaging team, who died on October 6, 1980. On November 11, 1982, a faulty command sent from Earth interrupted communications. Every attempt to regain contact failed.",
    ],
    image: {
      src: "/viking/10-mro-view-2006.jpg",
      caption: "Viking 1 landing site seen from the Mars Reconnaissance Orbiter in 2006",
      credit: "NASA/JPL/University of Arizona",
    },
    sources: [{ code: "001" }, { code: "002" }],
  },
  {
    id: "legacy",
    chapter: "11",
    title: "THE MISSION THAT MARS MISSIONS STILL BUILD ON.",
    kicker: "Legacy",
    cameraTarget: "fullLanderWide",
    paragraphs: [
      "Viking 1 broke new ground in surface exploration of Mars, and the effort it started continues today. Later missions, and those still to come, try to find out whether Mars’s once warm and wet climate could ever have supported some form of life. What they find also helps inform sustainability for future human exploration. These missions keep building on what the Vikings began.",
    ],
    reflectionPrompt:
      "If you could ask Viking to do one more test on Mars, what would you want it to find out?",
    image: {
      src: "/viking/01-viking-lander-portrait.jpg",
      caption: "The Viking 1 lander at work on Mars",
      credit: "NASA/JPL-Caltech",
    },
    sources: [{ code: "001" }, { code: "002" }],
  },
];

export default sections;