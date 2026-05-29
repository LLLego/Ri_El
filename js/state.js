// =============================================
// GLOBAL STATE VARIABLES
// =============================================

// Firebase state
let db = null;
let firebaseReady = false;
let roomId = null;
let userName = null;
let userKey = null; // 'name1' or 'name2'

// Music player state
let playlist = [];
let currentTrackIdx = 0;
let isPlaying = false;
let allSongs = [];

// Auth state
let authStep = 'name'; // 'name' | 'password'
let pendingName = '';

// Mood system state
const MOODS = [
    { emoji: '\u{1F60A}', label: 'Happy' },
    { emoji: '\u{1F634}', label: 'Sleepy' },
    { emoji: '\u{1F494}', label: 'Missing You' },
    { emoji: '\u{1F929}', label: 'Excited' },
    { emoji: '\u{1F60E}', label: 'Chill' },
    { emoji: '\u{1F622}', label: 'Sad' },
    { emoji: '\u{1F970}', label: 'In Love' },
    { emoji: '\u{1F31F}', label: 'Grateful' },
    { emoji: '\u{1F62B}', label: 'Stressed' },
    { emoji: '\u{1F979}', label: 'Overjoyed' },
    { emoji: '\u{1F48E}', label: 'Dreamy' },
    { emoji: '\u{1F525}', label: 'Fired Up' },
];

const NOTE_COLORS = [
    { bg: '#fff9c4', name: 'Lemon' },
    { bg: '#f8bbd0', name: 'Pink' },
    { bg: '#c8e6c9', name: 'Mint' },
    { bg: '#bbdefb', name: 'Sky' },
    { bg: '#e1bee7', name: 'Lavender' },
    { bg: '#ffe0b2', name: 'Peach' },
];

let selectedNoteColor = NOTE_COLORS[0].bg;

// Mood history
let moodHistoryData = {};

// Love letters state
let letterRecipient = 'name2'; // default
let openedLetter = null;

// Love wall state
let loveWallData = [];

// Spin the wheel state
const DEFAULT_WHEEL_ITEMS = ['Movie Night', 'Cook Together', 'Game Night', 'Watch Anime', 'Karaoke', 'Deep Talk', 'Photo Booth', 'Dance Party'];
let wheelItems = [...DEFAULT_WHEEL_ITEMS];
let wheelSpinning = false;

// Word Association state
let waUsedWords = [];
let waTimer = null;
// WA_STARTERS declared in wordassoc.js

// Open When letters state
const OPEN_WHEN_PROMPTS = [
    { id: 'sad', icon: '&#x1F622;', label: "You're Sad", key: 'openwhen_sad' },
    { id: 'missing', icon: '&#x1F494;', label: 'Missing Me', key: 'openwhen_missing' },
    { id: 'sleepless', icon: '&#x1F319;', label: "Can't Sleep", key: 'openwhen_sleepless' },
    { id: 'happy', icon: '&#x1F60A;', label: "You're Happy", key: 'openwhen_happy' },
    { id: 'proud', icon: '&#x1F4AA;', label: 'Proud of You', key: 'openwhen_proud' },
    { id: 'bored', icon: '&#x1F634;', label: "You're Bored", key: 'openwhen_bored' },
    { id: 'angry', icon: '&#x1F621;', label: "You're Angry", key: 'openwhen_angry' },
    { id: 'anniversary', icon: '&#x1F382;', label: 'Monthsary', key: 'openwhen_anniversary' },
];
let owViewingLetter = null;

// Games shared state
let currentGame = null;
let gameListeners = [];

// Would You Rather state
let wyrIdx = 0, wyrChoice = null, wyrPartnerChoice = null, wyrScore = 0, wyrPartnerScore = 0;

// Know Me state
let kmIdx = 0, kmPhase = 'answer'; // answer -> guess -> reveal
let kmMyAnswer = null, kmTheirAnswer = null;
let kmMyGuess = null;

// Draw & Guess state
let dgIsDrawer = false, dgCurrentWord = '', dgStrokes = [], dgDrawing = false;
let dgRole = 'drawer';
let dgColor = '#000', dgSize = 3;

// Typing Race state
let trSentence = '', trStartTime = null, trDone = false, trMyTime = null;

// Heartbeat Race state
let hbTaps = 0, hbTimer = null, hbTimeLeft = 10, hbRunning = false;

// Movie Night state
let mnStartTime = null, mnRunning = false, mnTimer = null, mnElapsed = 0;

// Question Date state
let qdIdx = 0, qdMyAnswer = null, qdTheirAnswer = null;

// Voice Notes state
let vnRecording = false;
let vnMediaRecorder = null;
let vnChunks = [];
let vnTimerInterval = null;
let vnRecordStart = 0;
const VN_MAX_SECONDS = 30;
let vnCurrentAudio = null;

// Roblox Date Night state
let ROBLOX_DATES = [
    { name: "Brookhaven", cat: "chill", desc: "Live your dream life together", id: 4924922222 },
    { name: "Adopt Me!", cat: "chill", desc: "Raise pets together", id: 920587237 },
    { name: "Fisch", cat: "cozy", desc: "Relaxing fishing adventure together", id: 16732694052 },
    { name: "Grow a Garden", cat: "cozy", desc: "Build a garden paradise together", id: 126884695634066 },
    { name: "Rainy Vibes", cat: "cozy", desc: "Explore cozy rainy landscapes, find hidden frogs", id: 8314038172 },
    { name: "Typical Ramen", cat: "cozy", desc: "Run a cozy ramen shop together", id: 119534579319519 },
    { name: "Escape Room", cat: "adventure", desc: "Solve puzzles together to escape", id: 4719441149 },
    { name: "Murder Mystery 2", cat: "horror", desc: "Can you trust each other?", id: 142823291 },
]; // fallback, replaced by fetch
let ROBLOX_ALL_GAMES = [];
const ROBLOX_FEATURED_COUNT = 12;
let robloxCat = 'all';
let robloxVotes = {};
