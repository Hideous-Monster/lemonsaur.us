// Fun guest names for visitors who haven't identified yet.
// Used by the telemetry layer (deterministic, seeded by sessionId) and as
// the default value for nick inputs (random each mount).

// ── Seeded RNG ──────────────────────────────────────────────────────────────
// xfnv1a + mulberry32. Same seed → same name forever. Stable telemetry labels.

function xfnv1a(str: string): () => number {
	let h = 2166136261 >>> 0;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 16777619);
	}
	return () => {
		h += 0x6d2b79f5;
		let t = h;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function makeRng(seed?: string): () => number {
	if (!seed) return Math.random;
	return xfnv1a(seed);
}

function pick<T>(rng: () => number, list: readonly T[]): T {
	return list[Math.floor(rng() * list.length)] as T;
}

// ── Wordlists ───────────────────────────────────────────────────────────────

const ADJ = [
	"Gentle",
	"Sad",
	"Loud",
	"Velvet",
	"Iron",
	"Crimson",
	"Drunken",
	"Hungry",
	"Polite",
	"Reckless",
	"Eternal",
	"Slippery",
	"Haunted",
	"Tactical",
	"Feral",
	"Discount",
	"Reluctant",
	"Cosmic",
	"Suburban",
	"Holy",
	"Unholy",
	"Dignified",
	"Greasy",
	"Anointed",
	"Unwashed",
	"Buttered",
	"Triumphant",
	"Sleepy",
	"Weeping",
	"Mildly Cursed",
	"Vengeful",
	"Tender",
	"Forgotten",
	"Distant",
];

const NOUN = [
	"Giant",
	"Hammer",
	"Bandit",
	"Wizard",
	"Lighthouse",
	"Cowboy",
	"Pope",
	"Mongoose",
	"Oracle",
	"Plumber",
	"Centurion",
	"Philosopher",
	"Goblin",
	"Marquis",
	"Architect",
	"Gardener",
	"Drifter",
	"Stallion",
	"Cartographer",
	"Magician",
	"Bricklayer",
	"Sommelier",
	"Locksmith",
	"Heretic",
	"Knight",
	"Diplomat",
	"Falconer",
	"Beekeeper",
	"Dentist",
	"Cryptid",
	"Librarian",
	"Carpenter",
	"Hermit",
	"Inquisitor",
];

const GROUP = [
	"Some Random Triumvirate",
	"the Lesser Hapsburgs",
	"the Brooklyn Cabal",
	"a Polish String Quartet",
	"the Bagel Resistance",
	"the Norwegian Black Metal Caucus",
	"a Discontinued Boy Band",
	"the Council of Damp Wizards",
	"the Ohio Pancake Mafia",
	"the Lukewarm War",
	"a Mid-Tier Drag Brunch",
	"a Defunct Soviet Hockey Team",
	"the Concerned Parents of Yorkshire",
	"the Forgotten Ninth Beatle",
	"a Confederation of Goose Enthusiasts",
	"the Tuesday Bowling League",
	"a Vaguely Threatening Book Club",
	"the Order of Burnt Toast",
	"the Society of Damp Cartographers",
	"an Off-Brand Witch Coven",
];

const FIRST = [
	"Boris",
	"Yuri",
	"Alekhine",
	"Cornelius",
	"Mortimer",
	"Tobias",
	"Gregor",
	"Hieronymus",
	"Bartholomew",
	"Reginald",
	"Eustace",
	"Percival",
	"Beatrix",
	"Hildegard",
	"Agatha",
	"Wilhelmina",
	"Constance",
	"Eulalia",
	"Magnolia",
	"Petunia",
	"Rasputin",
	"Throgmorton",
	"Quentin",
	"Wendell",
	"Igor",
	"Sebastian",
	"Gunther",
	"Fjodor",
	"Klaus",
	"Benedikt",
	"Jolene",
	"Imelda",
	"Esmeralda",
	"Ramona",
	"Lupita",
	"Dolores",
	"Margot",
	"Greta",
	"Henrietta",
	"Octavia",
	"Amanda",
	"Linda",
	"Brad",
	"Greg",
	"Henry",
	"Mira",
];

const LAST = [
	"Volkov",
	"Vladimoritz",
	"Rothchild",
	"Bumblesworth",
	"Pumpernickel",
	"Featherbottom",
	"Hornswaggle",
	"Crunchwrap",
	"Underwood",
	"Catwater",
	"Kissenhug",
	"Bobblefritz",
	"Spankweather",
	"Snickerdoodle",
	"Throckmorton",
	"Mortenson",
	"Drysdale",
	"Hapsburg",
	"McAllister",
	"Vandenberg",
	"Schnitzelbaum",
	"Pemberton",
	"Bjornstad",
	"Halloway",
	"Quigley",
	"Whitaker",
	"Blackwood",
	"Featherstone",
	"Ravensgrove",
	"Wormwood",
	"Cricklewood",
	"Fairweather",
];

const TITLE = [
	"Master",
	"Captain",
	"Doctor",
	"Sir",
	"Lady",
	"Madame",
	"Comrade",
	"Brother",
	"Sister",
	"Father",
	"Reverend",
	"Sergeant",
	"Baron",
	"Count",
	"Duchess",
	"Admiral",
	"Cardinal",
];

const EPITHET = [
	"Knife",
	"Wolf",
	"Reckoning",
	"Magnificent",
	"Punctual",
	"Inevitable",
	"Unprepared",
	"Forgotten",
	"Sweet",
	"Bold",
	"Tender",
	"Reckless",
	"Tongue",
	"Razor",
	"Quiet One",
	"Tax Man",
	"Hand",
	"Bear",
	"Crow",
	"Dagger",
	"Migraine",
	"Shadow",
	"Pretender",
	"Reluctant Hero",
	"Discount",
];

const FOOD_NICK = [
	"Tunafish",
	"Pickles",
	"Sandwich",
	"Boots",
	"Sparkles",
	"Knuckles",
	"Mayonnaise",
	"Whiskers",
	"Thunderbolt",
	"Houdini",
	"Spaghetti",
	"Biscuits",
	"Crouton",
	"Oatmeal",
	"Snacks",
	"Tugboat",
	"Lasagna",
	"Pancakes",
	"Marbles",
	"Slim",
	"Fingers",
	"Tiny",
	"Lefty",
	"Big Sky",
	"Two-Tone",
];

const PLACE = [
	"Northbrook",
	"Vermont",
	"Sicily",
	"Pigeon City",
	"Lower Wessex",
	"the Old Country",
	"Greater Paducah",
	"the Forbidden Hamptons",
	"Slovenia",
	"the Wet Districts",
	"Outer Cleveland",
	"the Lesser Antilles",
	"Saskatoon",
	"the Elbow of France",
	"Hamburg",
	"the Forgotten Province",
	"New New Brunswick",
	"the Mushroom Kingdom",
	"Mars (the suburb)",
	"the Discount Bin",
];

const SURREAL_FIRST = [
	"Grelnik",
	"Mungo",
	"Whorfle",
	"Squelp",
	"Throbgar",
	"Plemb",
	"Krendle",
	"Vorbis",
	"Glonk",
	"Snurf",
	"Wibblet",
	"Jorbo",
	"Klemp",
	"Trundle",
	"Phlex",
	"Quibble",
	"Ronk",
	"Gloop",
	"Fnuk",
	"Snadge",
	"Yorblet",
	"Drozzle",
	"Snib",
	"Twangle",
	"Brimble",
];

const SURREAL_LAST = [
	"Fishtree",
	"Mooncrust",
	"Spoonbender",
	"Pillowmonger",
	"Wormtongue",
	"Stewbottom",
	"Footwhistle",
	"Crowbarrel",
	"Owlfeather",
	"Toadthistle",
	"Hatcheek",
	"Sockwiper",
	"Loafmonger",
	"Bonepocket",
	"Dustthrottle",
	"Cogswallow",
	"Beanthistle",
	"Witchsneeze",
	"Trumpetfoot",
	"Lampwhisker",
	"Cabbageworth",
	"Soupbinder",
	"Hatcrumb",
	"Beardrip",
	"Bonewhistle",
];

const NUM_TITLE = [
	"the Third",
	"the Fourth",
	"the Eighth",
	"the Twelfth",
	"the Unready",
	"the Bald",
	"the Magnificent",
	"the Untimely",
	"the Mostly Sober",
	"the Reasonable",
	"the Inconvenient",
];

const INITIAL = "ABCDEFGHJKLMNPRSTVW".split("");

// ── Hand-picked one-offs (low pick rate) ────────────────────────────────────

const NICKNAMES = [
	"The Lemon Whisperer",
	"Smashmouth Theologian",
	"Captain Wetbeard",
	"Margaret Catwater",
	"Linda from Accounting",
	"GLaDOS's Therapist",
	"A Goose With A Knife",
	"The Last Honest Man in Sicily",
	"Bartholomew Bumblesworth",
	"Sir Reginald Pumpernickel III",
	"Princess Consuela Banana-Hammock",
	"Disco Spaghetti",
	"Hexadecimal Horace",
	"Quentin von Crunchwrap",
	"Beelzebub's Accountant",
	"Mothra's Dental Hygienist",
	"Wesley Crusher's Stunt Double",
	"Doctor Wormhole, PhD",
	"The Ghost of Tom Joad",
	"Brad But Italian",
	"Two Raccoons in a Trench Coat",
	"The Mayor of Pigeon City",
	"Glorbnax the Devourer",
	"A Sentient Bowl of Custard",
	"Lord Featherbottom",
	"The DJ at the End of Time",
	"Yorgi the Unconvinced",
];

// ── Formulas ────────────────────────────────────────────────────────────────

type Formula = (rng: () => number) => string;

const FORMULAS: Formula[] = [
	// 1. "Gentle Giant"
	(r) => `${pick(r, ADJ)} ${pick(r, NOUN)}`,
	// 2. "A Member of Some Random Triumvirate"
	(r) => `A Member of ${pick(r, GROUP)}`,
	// 3. "Boris The Knife"
	(r) => `${pick(r, FIRST)} the ${pick(r, EPITHET)}`,
	// 4. 'Alekhine "Tunafish" Vladimoritz'
	(r) => `${pick(r, FIRST)} "${pick(r, FOOD_NICK)}" ${pick(r, LAST)}`,
	// 5. "Master Rothchild"
	(r) => `${pick(r, TITLE)} ${pick(r, LAST)}`,
	// 6. "Sad Boris Volkov"
	(r) => `${pick(r, ADJ)} ${pick(r, FIRST)} ${pick(r, LAST)}`,
	// 7. "Amanda Kissenhug" (drag-style two-word last name)
	(r) => `${pick(r, FIRST)} ${pick(r, LAST)}-${pick(r, LAST)}`,
	// 8. "Grelnik Fishtree"
	(r) => `${pick(r, SURREAL_FIRST)} ${pick(r, SURREAL_LAST)}`,
	// 9. "Mira of Northbrook"
	(r) => `${pick(r, FIRST)} of ${pick(r, PLACE)}`,
	// 10. "The Sad Cowboy of Vermont"
	(r) => `The ${pick(r, ADJ)} ${pick(r, NOUN)} of ${pick(r, PLACE)}`,
	// 11. "Tobias, the Soup Bandit"
	(r) => `${pick(r, FIRST)}, the ${pick(r, ADJ)} ${pick(r, NOUN)}`,
	// 12. "Captain Greg Sweetcheek"
	(r) => `${pick(r, TITLE)} ${pick(r, FIRST)} ${pick(r, SURREAL_LAST)}`,
	// 13. "Henry the Eighth"
	(r) => `${pick(r, FIRST)} ${pick(r, NUM_TITLE)}`,
	// 14. "J. R. Bobblefritz"
	(r) => `${pick(r, INITIAL)}. ${pick(r, INITIAL)}. ${pick(r, LAST)}`,
	// 15. "Doctor Wormhole, Esquire"
	(r) => `${pick(r, TITLE)} ${pick(r, SURREAL_LAST)}, Esquire`,
	// 16. "Brad from the Tuesday Bowling League"
	(r) => `${pick(r, FIRST)} from ${pick(r, GROUP)}`,
];

// ── Public API ──────────────────────────────────────────────────────────────

const HARDCODED_RATE = 0.15;

export function generateGuestName(seed?: string): string {
	const rng = makeRng(seed);
	if (rng() < HARDCODED_RATE) return pick(rng, NICKNAMES);
	const formula = pick(rng, FORMULAS);
	return formula(rng);
}
