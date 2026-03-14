/**
 * data.js
 * Comprehensive Japanese Curriculum: Hiragana, Katakana, and Kanji (N5 -> N3)
 */

const JLPT_DATA = {
    "N5": {
        totalVocab: 800,
        totalKanji: 100,
        totalGrammar: 50,
        color: "#3b82f6"
    },
    "N4": {
        totalVocab: 600,
        totalKanji: 300,
        totalGrammar: 60,
        color: "#8b5cf6"
    },
    "N3": {
        totalVocab: 650,
        totalKanji: 650,
        totalGrammar: 70,
        color: "#eab308"
    }
};

const TOTAL_VOCAB = JLPT_DATA.N5.totalVocab + JLPT_DATA.N4.totalVocab + JLPT_DATA.N3.totalVocab;
const TOTAL_KANJI = JLPT_DATA.N5.totalKanji + JLPT_DATA.N4.totalKanji + JLPT_DATA.N3.totalKanji;
const TOTAL_GRAMMAR = JLPT_DATA.N5.totalGrammar + JLPT_DATA.N4.totalGrammar + JLPT_DATA.N3.totalGrammar;

const LESSON_PLAN = [
    // --- N5 FOUNDATIONS (HIRAGANA) ---
    {
        id: 1,
        title: "Hiragana: Vowels",
        desc: "The 5 core sounds: a, i, u, e, o.",
        vocab: [
            { jp: "あ", roma: "a", env: "vowel" },
            { jp: "い", roma: "i", env: "vowel" },
            { jp: "う", roma: "u", env: "vowel" },
            { jp: "え", roma: "e", env: "vowel" },
            { jp: "お", roma: "o", env: "vowel" }
        ]
    },
    {
        id: 2,
        title: "Hiragana: K & S Rows",
        desc: "ka, ki, ku, ke, ko & sa, shi, su, se, so.",
        vocab: [
            { jp: "か", roma: "ka", env: "k-row" }, { jp: "き", roma: "ki", env: "k-row" }, { jp: "く", roma: "ku", env: "k-row" }, { jp: "け", roma: "ke", env: "k-row" }, { jp: "こ", roma: "ko", env: "k-row" },
            { jp: "さ", roma: "sa", env: "s-row" }, { jp: "し", roma: "shi", env: "s-row" }, { jp: "す", roma: "su", env: "s-row" }, { jp: "せ", roma: "se", env: "s-row" }, { jp: "そ", roma: "so", env: "s-row" }
        ]
    },
    {
        id: 3,
        title: "Hiragana: T, N & H Rows",
        desc: "Advanced Hiragana rows.",
        vocab: [
            { jp: "た", roma: "ta", env: "t-row" }, { jp: "な", roma: "na", env: "n-row" }, { jp: "は", roma: "ha", env: "h-row" },
            { jp: "に", roma: "ni", env: "n-row" }, { jp: "ぬ", roma: "nu", env: "n-row" }, { jp: "ね", roma: "ne", env: "n-row" }, { jp: "の", roma: "no", env: "n-row" }
        ]
    },
    // --- N5 FOUNDATIONS (KATAKANA) ---
    {
        id: 4,
        title: "Katakana: Basic Vowels",
        desc: "Foreign loanword characters: A, I, U, E, O.",
        vocab: [
            { jp: "ア", roma: "a", env: "katakana" }, { jp: "イ", roma: "i", env: "katakana" }, { jp: "ウ", roma: "u", env: "katakana" }, { jp: "エ", roma: "e", env: "katakana" }, { jp: "オ", roma: "o", env: "katakana" }
        ]
    },
    {
        id: 5,
        title: "Katakana: K & S Rows",
        desc: "Expanding Katakana mastery.",
        vocab: [
            { jp: "カ", roma: "ka", env: "katakana" }, { jp: "キ", roma: "ki", env: "katakana" }, { jp: "ク", roma: "ku", env: "katakana" },
            { jp: "サ", roma: "sa", env: "katakana" }, { jp: "シ", roma: "shi", env: "katakana" }, { jp: "ス", roma: "su", env: "katakana" }
        ]
    },
    // --- N5 KANJI & VOCAB ---
    {
        id: 6,
        title: "N5 Kanji: Numbers",
        desc: "Reading 1-10 in Kanji.",
        vocab: [
            { jp: "一", roma: "ichi", env: "kanji" }, { jp: "二", roma: "ni", env: "kanji" }, { jp: "三", roma: "san", env: "kanji" },
            { jp: "四", roma: "yon", env: "kanji" }, { jp: "五", roma: "go", env: "kanji" }, { jp: "六", roma: "roku", env: "kanji" },
            { jp: "七", roma: "nana", env: "kanji" }, { jp: "八", roma: "hachi", env: "kanji" }, { jp: "九", roma: "kyuu", env: "kanji" }, { jp: "十", roma: "juu", env: "kanji" }
        ]
    },
    {
        id: 7,
        title: "N5 Kanji: Basic Nature",
        desc: "Natural elements: Mountain, River, Sun, Moon.",
        vocab: [
            { jp: "山", roma: "yama", env: "kanji" }, { jp: "川", roma: "kawa", env: "kanji" }, { jp: "日", roma: "hi", env: "kanji" }, { jp: "月", roma: "tsuki", env: "kanji" }, { jp: "木", roma: "ki", env: "kanji" }
        ]
    },
    {
        id: 8,
        title: "N5 Vocab: Daily Objects",
        desc: "Essential nouns for the exam.",
        vocab: [
            { jp: "ほん", roma: "hon", env: "object" }, { jp: "でんわ", roma: "denwa", env: "object" }, { jp: "くるま", roma: "kuruma", env: "object" }, { jp: "かばん", roma: "kaban", env: "object" }
        ]
    },
    {
        id: 9,
        title: "N5 Verbs: Actions",
        desc: "Eat, Drink, Go, Come.",
        vocab: [
            { jp: "たべる", roma: "taberu", env: "verb" }, { jp: "のむ", roma: "nomu", env: "verb" }, { jp: "いく", roma: "iku", env: "verb" }, { jp: "くる", roma: "kuru", env: "verb" }
        ]
    },
    {
        id: 10,
        title: "N5 Grammar: Postparticles",
        desc: "wa, ga, ni, o, de.",
        vocab: [
            { jp: "は", roma: "wa", env: "particle" }, { jp: "が", roma: "ga", env: "particle" }, { jp: "に", roma: "ni", env: "particle" }, { jp: "を", roma: "wo", env: "particle" }
        ]
    },
    // --- N4 INTERMEDIATE PATH ---
    {
        id: 11,
        title: "N4 Kanji: Time",
        desc: "Weekdays, hours, minutes.",
        vocab: [
            { jp: "時", roma: "ji", env: "kanji" }, { jp: "分", roma: "fun", env: "kanji" }, { jp: "週", roma: "shuu", env: "kanji" }, { jp: "年", roma: "nen", env: "kanji" }
        ]
    },
    {
        id: 12,
        title: "N4 Kanji: School",
        desc: "Study, school, student, teacher.",
        vocab: [
            { jp: "学", roma: "gaku", env: "kanji" }, { jp: "校", roma: "kou", env: "kanji" }, { jp: "生", roma: "sei", env: "kanji" }, { jp: "先", roma: "saki", env: "kanji" }
        ]
    },
    {
        id: 13,
        title: "N4 Adjectives: i-type",
        desc: "Expensive, cheap, fast, slow.",
        vocab: [
            { jp: "高い", roma: "takai", env: "adj" }, { jp: "安い", roma: "yasui", env: "adj" }, { jp: "速い", roma: "hayai", env: "adj" }, { jp: "遅い", roma: "osoi", env: "adj" }
        ]
    },
    {
        id: 14,
        title: "N4 Adjectives: na-type",
        desc: "Quiet, convenient, beautiful.",
        vocab: [
            { jp: "しずか", roma: "shizuka", env: "na-adj" }, { jp: "べんり", roma: "benri", env: "na-adj" }, { jp: "きれい", roma: "kirei", env: "na-adj" }
        ]
    },
    {
        id: 15,
        title: "N4 Verbs: te-form",
        desc: "Connecting actions: tabete, nonde.",
        vocab: [
            { jp: "たべて", roma: "tabete", env: "te-form" }, { jp: "のんで", roma: "nonde", env: "te-form" }, { jp: "いって", roma: "itte", env: "te-form" }
        ]
    },
    {
        id: 16,
        title: "N4 Vocab: Travel",
        desc: "Airport, suitcase, passport.",
        vocab: [
            { jp: "くうこう", roma: "kuukou", env: "travel" }, { jp: "ひこうき", roma: "hikouki", env: "travel" }, { jp: "りょこう", roma: "ryokou", env: "travel" }
        ]
    },
    {
        id: 17,
        title: "N4 Kanji: Directions",
        desc: "Up, down, left, right.",
        vocab: [
            { jp: "上", roma: "ue", env: "kanji" }, { jp: "下", roma: "shita", env: "kanji" }, { jp: "左", roma: "hidari", env: "kanji" }, { jp: "右", roma: "migi", env: "kanji" }
        ]
    },
    {
        id: 18,
        title: "N4 Kanji: Body Parts",
        desc: "Hand, eye, mouth, foot.",
        vocab: [
            { jp: "手", roma: "te", env: "kanji" }, { jp: "目", roma: "me", env: "kanji" }, { jp: "口", roma: "kuchi", env: "kanji" }, { jp: "足", roma: "ashi", env: "kanji" }
        ]
    },
    {
        id: 19,
        title: "N4 Grammar: Potential",
        desc: "Can do actions.",
        vocab: [
            { jp: "たべられる", roma: "taberareru", env: "verb" }, { jp: "よめる", roma: "yomeru", env: "verb" }, { jp: "かける", roma: "kakeru", env: "verb" }
        ]
    },
    {
        id: 20,
        title: "N4 Honorifics Basics",
        desc: "Desu and Masu review.",
        vocab: [
            { jp: "です", roma: "desu", env: "polite" }, { jp: "ます", roma: "masu", env: "polite" }
        ]
    },
    // --- N3 MASTER CORE ---
    {
        id: 21,
        title: "N3 Kanji: Work",
        desc: "Office, employee, company.",
        vocab: [
            { jp: "社", roma: "sha", env: "kanji" }, { jp: "員", roma: "in", env: "kanji" }, { jp: "仕", roma: "shi", env: "kanji" }, { jp: "事", roma: "koto", env: "kanji" }
        ]
    },
    {
        id: 22,
        title: "N3 Kanji: Society",
        desc: "Politics, economy, law.",
        vocab: [
            { jp: "政", roma: "sei", env: "kanji" }, { jp: "治", roma: "ji", env: "kanji" }, { jp: "経", roma: "kei", env: "kanji" }, { jp: "済", roma: "sai", env: "kanji" }
        ]
    },
    {
        id: 23,
        title: "N3 Vocab: Business",
        desc: "Meeting, presentation, deadline.",
        vocab: [
            { jp: "かいぎ", roma: "kaigi", env: "biz" }, { jp: "しめきり", roma: "shimekiri", env: "biz" }, { jp: "れんらく", roma: "renraku", env: "biz" }
        ]
    },
    {
        id: 24,
        title: "N3 Kanji: Advanced Nature",
        desc: "Wind, rain, snow, thunder.",
        vocab: [
            { jp: "風", roma: "kaze", env: "kanji" }, { jp: "雨", roma: "ame", env: "kanji" }, { jp: "雪", roma: "yuki", env: "kanji" }, { jp: "雷", roma: "kaminari", env: "kanji" }
        ]
    },
    {
        id: 25,
        title: "N3 Verbs: Abstract Actions",
        desc: "Think, believe, decide.",
        vocab: [
            { jp: "かんがえる", roma: "kangaeru", env: "verb" }, { jp: "しんじる", roma: "shinjiru", env: "verb" }, { jp: "きめる", roma: "kimeru", env: "verb" }
        ]
    },
    {
        id: 26,
        title: "N3 Kanji: Mind & Soul",
        desc: "Heart, thought, feeling.",
        vocab: [
            { jp: "心", roma: "kokoro", env: "kanji" }, { jp: "思", roma: "omou", env: "kanji" }, { jp: "感", roma: "kanji", env: "kanji" }
        ]
    },
    {
        id: 27,
        title: "N3 Vocab: News & Media",
        desc: "Article, broadcast, incident.",
        vocab: [
            { jp: "きじ", roma: "kiji", env: "media" }, { jp: "じけん", roma: "jiken", env: "media" }, { jp: "ほうそう", roma: "housou", env: "media" }
        ]
    },
    {
        id: 28,
        title: "N3 Grammar: Transitive vs Intransitive",
        desc: "Pairs like maker/made.",
        vocab: [
            { jp: "あける", roma: "akeru", env: "verb" }, { jp: "あく", roma: "aku", env: "verb" }, { jp: "きめる", roma: "kimeru", env: "verb" }, { jp: "きまる", roma: "kimaru", env: "verb" }
        ]
    },
    {
        id: 29,
        title: "N3 Kanji: Human Relations",
        desc: "Marriage, friend, relative.",
        vocab: [
            { jp: "結", roma: "ketsu", env: "kanji" }, { jp: "婚", roma: "kon", env: "kanji" }, { jp: "友", roma: "tomo", env: "kanji" }, { jp: "親", roma: "oya", env: "kanji" }
        ]
    },
    {
        id: 30,
        title: "N3 Mastery Final Review",
        desc: "Summation of all core patterns.",
        vocab: [
            { jp: "せいこう", roma: "seikou", env: "n3" }, { jp: "どりょく", roma: "doryoku", env: "n3" }, { jp: "ごうかく", roma: "goukaku", env: "n3" }
        ]
    }
];
