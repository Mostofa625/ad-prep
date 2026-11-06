// Static study content. Edit this file to change the plan; user progress lives in localStorage (see app.js).

const PLAN_START = '2026-10-18'; // Sunday, week 1 day 1
const PLAN_WEEKS = 12;

// Daily sessions (Sun–Thu). Friday and Saturday have their own lists.
const DAILY = [
  { id: 'eng', label: 'English', mins: 75 },
  { id: 'math', label: 'Math', mins: 75 },
  { id: 'gk', label: 'GK (BD + International)', mins: 60 },
  { id: 'bn', label: 'Bangla', mins: 40 },
  { id: 'err', label: 'Error review (Mistakes tab)', mins: 20 },
];
const FRIDAY = [
  { id: 'mock', label: 'Full timed 100-MCQ mock', mins: 120 },
  { id: 'mockrev', label: 'Mark the mock, log every wrong answer', mins: 60 },
  { id: 'err', label: 'Error review (Mistakes tab)', mins: 20 },
];
const SATURDAY = [
  { id: 'essay', label: 'Written practice: 1 argument essay (30 min)', mins: 45 },
  { id: 'focus', label: 'Written practice: focus writing / translation', mins: 45 },
  { id: 'rev', label: "Revise the week's notes, all subjects", mins: 120 },
  { id: 'err', label: 'Error review (Mistakes tab)', mins: 20 },
];
// Weeks 11–12, and the 14 days before any exam with a date: mock every other day.
const MOCK_DAY = [
  { id: 'mock', label: 'Full timed 100-MCQ mock', mins: 120 },
  { id: 'mockrev', label: 'Mark the mock, log every wrong answer', mins: 60 },
  { id: 'weak', label: 'Fix the weakest subject from the mock', mins: 60 },
  { id: 'err', label: 'Error review (Mistakes tab)', mins: 20 },
];
const REVIEW_DAY = [
  { id: 'weak', label: 'Weak-topic study (from the last mock)', mins: 90 },
  { id: 'gk', label: 'Current affairs + GK revision', mins: 60 },
  { id: 'essay', label: 'Argument essay or written answer (30 min)', mins: 45 },
  { id: 'viva', label: 'Viva: 2 questions aloud (More tab)', mins: 20 },
  { id: 'err', label: 'Error review (Mistakes tab)', mins: 20 },
];

const PHASES = [
  { from: 1, to: 4, name: 'Foundation', note: 'Basics in every subject. Accuracy before speed.' },
  { from: 5, to: 8, name: 'Build-up', note: 'Harder problems, past papers by topic, timed sections.' },
  { from: 9, to: 10, name: 'Exam focus', note: 'Previous AD papers, weak topics, written practice.' },
  { from: 11, to: 12, name: 'Mocks', note: 'Full mock every other day; review days in between.' },
];

// Suggested topics per week. English / Math / GK / Bangla.
const WEEKS = [
  ['Parts of speech, subject–verb agreement', 'Number system, LCM & HCF', 'Liberation War & 1952–71 history', 'ধ্বনি, বর্ণ, সন্ধি'],
  ['Tense, right form of verbs', 'Percentage, profit & loss', 'Constitution of Bangladesh', 'সমাস, কারক ও বিভক্তি'],
  ['Prepositions, articles', 'Ratio, proportion, partnership', 'Geography: rivers, districts, borders', 'শুদ্ধ বানান, প্রত্যয়'],
  ['Voice & narration', 'Time & work, speed & distance', 'Economy, budget, major projects', 'বাগধারা, প্রবাদ, এক কথায় প্রকাশ'],
  ['Sentence correction, transformation', 'Simple & compound interest, averages', 'UN & international organisations', 'সমার্থক ও বিপরীত শব্দ'],
  ['Synonyms, antonyms, idioms', 'Algebra: indices, equations, factors', 'World geography, capitals, currencies', 'প্রাচীন ও মধ্যযুগের সাহিত্য'],
  ['Reading comprehension', 'Geometry: triangles, circles', 'ICT basics, computer terms', 'আধুনিক সাহিত্য: রবীন্দ্রনাথ, নজরুল'],
  ['Argument essay structure (Essays tab)', 'Mensuration, sets, probability', 'Current affairs (last 6 months)', 'সাহিত্যিক ছদ্মনাম, পত্রিকা, উক্তি'],
  ['Previous AD papers: English', 'Previous AD papers: Math', 'Previous AD papers: GK + mental ability', 'Previous AD papers: Bangla'],
  ['Weak topics + 2 essays', 'Weak topics, speed drills', 'Current affairs refresh', 'Weak topics'],
  ['Mocks + review', 'Mocks + review', 'Mocks + review', 'Mocks + review'],
  ['Mocks + review', 'Mocks + review', 'Mocks + review', 'Mocks + review'],
];

// Question-bank topics (QUESTIONS[].t) covered each week, used for the 30-MCQ test after each subject session.
// An empty list (weeks 9–12) means the whole subject.
const SESSION_SUBJECT = { eng: 'English', math: 'Math', gk: 'GK', bn: 'Bangla' };
const WEEK_TOPICS = [
  { English: ['Parts of speech', 'Subject–verb agreement'], Math: ['Number system', 'LCM & HCF'], GK: ['Liberation War', 'Bangladesh: 1952–1971', 'Bangladesh: history'], Bangla: ['ধ্বনি ও বর্ণ', 'সন্ধি'] },
  { English: ['Tense & verb forms'], Math: ['Percentage, profit & loss'], GK: ['Bangladesh: Constitution'], Bangla: ['সমাস', 'কারক ও বিভক্তি'] },
  { English: ['Prepositions'], Math: ['Ratio & proportion'], GK: ['Bangladesh geography'], Bangla: ['বানান ও বাক্যশুদ্ধি', 'প্রকৃতি-প্রত্যয় ও উপসর্গ'] },
  { English: ['Voice & narration'], Math: ['Time, work & speed'], GK: ['Bangladesh economy & projects', 'Bangladesh: agriculture & census', 'Bangladesh: national achievements'], Bangla: ['বাগধারা ও প্রবাদ', 'এক কথায় প্রকাশ'] },
  { English: ['Clauses & sentences', 'Word formation'], Math: ['Interest', 'Average & age'], GK: ['International organisations', 'Organisation GK'], Bangla: ['সমার্থক ও বিপরীত শব্দ', 'পারিভাষিক শব্দ'] },
  { English: ['Synonyms & antonyms', 'Idioms & phrases', 'Phrasal verbs'], Math: ['Algebra & indices'], GK: ['World geography & countries', 'Environment & climate'], Bangla: ['সাহিত্য'] },
  { English: ['Analogy', 'Spelling', 'Translation'], Math: ['Geometry & mensuration'], GK: ['ICT basics', 'Everyday science'], Bangla: ['সাহিত্য'] },
  { English: ['English literature'], Math: ['Series & sets', 'Mental ability'], GK: ['International', 'World history & politics'], Bangla: ['সাহিত্য', 'শব্দ ও পদ', 'বাক্য ও যতিচিহ্ন'] },
  { English: [], Math: [], GK: [], Bangla: [] },
  { English: [], Math: [], GK: [], Bangla: [] },
  { English: [], Math: [], GK: [], Bangla: [] },
  { English: [], Math: [], GK: [], Bangla: [] },
];

const DEFAULT_EXAMS = [
  { id: 'mod', name: 'Ministry of Defence – AD (non-technical)', date: '2026-11-13', status: 'MCQ Fri 13 Nov 3:30–4:30 PM, Sher-e-Bangla Nagar Govt Boys\' High School. Roll 11025615' },
  { id: 'bepza', name: 'BEPZA – AD (Admin)', date: '', status: 'Applied' },
  { id: 'bhtpa', name: 'Bangladesh Hi-Tech Park Authority – AD', date: '', status: 'Applied' },
  { id: 'nsi', name: 'NSI – AD', date: '', status: 'Circular expected (check age limit, likely 32)' },
];

// MoD AD MCQ on Fri 13 Nov 2026, 3:30–4:30 PM (admit card). Six-day sprint built 5 Nov 2026 from the pattern of the
// real MoD 2023 paper (Bangla 25 with 10 literature, English 24, Math 15, GK 33 with 11 everyday science; 0.50 negative).
// sessionsFor() uses these days instead of the generic mock/review routine.
const NEG_RULE = 'Wrong answer costs 0.50: answer only when you can rule out two options.';
const SPRINT = {
  '2026-11-06': { kind: 'MoD sprint · day 1 of 6', note: 'Find your level on the real 2023 paper. ' + NEG_RULE, list: [
    { id: 'p23', label: 'Exams tab: MoD 2023 real paper (60 min, −0.50)', mins: 75 },
    { id: 'rev', label: 'Review every wrong and skipped answer; write down your 3 weakest topics', mins: 60 },
    { id: 'def', label: 'Study: প্রতিরক্ষা মন্ত্রণালয় ও সশস্ত্র বাহিনী, then its Practice', mins: 45 },
    { id: 'cur', label: 'Study: সাম্প্রতিক জুলাই–নভেম্বর ২০২৬, then its Practice', mins: 45 },
    { id: 'lit', label: 'Bangla literature notes (10 of 25 Bangla questions in 2023)', mins: 60 },
    { id: 'err', label: 'Mistakes tab: due cards', mins: 20 }] },
  '2026-11-07': { kind: 'MoD sprint · day 2 of 6', note: 'Two more real MoD papers, then the heaviest GK block. ' + NEG_RULE, list: [
    { id: 'p18', label: 'Exams tab: MoD 2018 and MoD 2016 papers', mins: 70 },
    { id: 'rev', label: 'Review both papers', mins: 45 },
    { id: 'sci', label: 'Everyday science: two 20-question quick quizzes (11 of 33 GK in 2023)', mins: 60 },
    { id: 'eng', label: 'English: parts of speech, word formation, literature notes', mins: 60 },
    { id: 'math', label: 'Math: geometry & mensuration, percentage & profit (notes + quiz)', mins: 45 },
    { id: 'err', label: 'Mistakes tab: due cards', mins: 20 }] },
  '2026-11-08': { kind: 'MoD sprint · day 3 of 6', note: 'First full mock in the MoD pattern. ' + NEG_RULE, list: [
    { id: 'mock1', label: 'Exams tab: MoD model test 1 (100 Q, 60 min, −0.50); test 2 in the evening if you have time', mins: 75 },
    { id: 'rev', label: 'Review the mock; log every wrong answer', mins: 60 },
    { id: 'bn', label: 'Bangla grammar: বানান ও বাক্যশুদ্ধি, সমাস, সন্ধি, প্রকৃতি-প্রত্যয়', mins: 60 },
    { id: 'bd', label: 'GK: Bangladesh history, Liberation War, Constitution (most-repeated quiz)', mins: 45 },
    { id: 'err', label: 'Mistakes tab: due cards', mins: 20 }] },
  '2026-11-09': { kind: 'MoD sprint · day 4 of 6', note: 'Last two real papers. ' + NEG_RULE, list: [
    { id: 'p19', label: 'Exams tab: MoD 2019 and DGFI 2025 papers', mins: 95 },
    { id: 'rev', label: 'Review both papers', mins: 45 },
    { id: 'eng2', label: 'English: idioms, phrasal verbs, synonyms and antonyms, spelling', mins: 60 },
    { id: 'math2', label: 'Math: algebra & indices, LCM & HCF, interest (notes + quiz)', mins: 60 },
    { id: 'err', label: 'Mistakes tab: due cards', mins: 20 }] },
  '2026-11-10': { kind: 'MoD sprint · day 5 of 6', note: 'Mock #2, then close the gaps. ' + NEG_RULE, list: [
    { id: 'mock2', label: 'Exams tab: MoD model test 3 (test 4 in the evening if you have time)', mins: 75 },
    { id: 'rev', label: 'Review the mock', mins: 60 },
    { id: 'weak', label: 'Practice tab: weak-topic quiz, twice', mins: 45 },
    { id: 'cur2', label: 'News check: Booker winner (9 Nov), COP31, UN Secretary-General race; re-read সাম্প্রতিক', mins: 30 },
    { id: 'err', label: 'Mistakes tab: all due cards', mins: 30 }] },
  '2026-11-11': { kind: 'MoD sprint · day 6 of 6', note: 'Last mock. From tomorrow, nothing new. ' + NEG_RULE, list: [
    { id: 'mock3', label: 'Exams tab: MoD model test 5 (test 6 in the evening if you have time)', mins: 75 },
    { id: 'rev', label: 'Review the mock', mins: 60 },
    { id: 'rep', label: 'Practice tab: most-repeated quiz, twice', mins: 45 },
    { id: 'rv', label: 'Study tab: revise lists of the notes you got wrong this week', mins: 45 },
    { id: 'err', label: 'Mistakes tab: all due cards', mins: 30 }] },
  '2026-11-12': { kind: 'Day before the MoD exam', note: 'No new topics. Sleep early.', list: [
    { id: 'light', label: 'Light revision: defence and current-affairs notes, math formulas, trap lists', mins: 90 },
    { id: 'docs', label: 'Print the admit card clearly; 2 black ballpoint pens; no phone, watch or calculator', mins: 20 },
    { id: 'route', label: 'Plan the route to Sher-e-Bangla Nagar Govt Boys\' High School (Agargaon); be there by 3:00 PM', mins: 10 }] },
  '2026-11-13': { kind: 'Exam day: MoD AD MCQ, 3:30 PM', note: 'Be in the hall by 3:00 PM (30 min early). Same signature as the application. ' + NEG_RULE, list: [] },
};

const SUBJECTS = ['English', 'Math', 'GK', 'Bangla', 'ICT / Mental ability', 'Written', 'Viva'];

const TEMPLATE = [
  ['Introduction', 'The author contends that … Although the argument may seem plausible at first glance, it rests on several unsubstantiated assumptions that seriously undermine it.'],
  ['Assumption 1', 'To begin with, the argument assumes that … However, the author offers no evidence that … To support this claim, the author would need to show …'],
  ['Assumption 2', 'Furthermore, the author takes for granted that … It is entirely possible that … (give a counterexample).'],
  ['Alternative explanations', 'Taken together, these gaps leave room for other explanations. For instance, … could equally account for …'],
  ['Concession', 'Admittedly, the argument could be persuasive if … but as it stands, none of this has been verified.'],
  ['Conclusion', 'In conclusion, the argument is insufficiently persuasive. To strengthen it, the author must provide evidence that … and rule out …'],
];
const NEGATION_TIP = 'Negation test: write the assumption, then negate it ("…does NOT…"). If the argument collapses when the assumption is false, it is a key assumption and deserves its own paragraph.';

const PROMPTS = [
  'Since the city corporation installed 500 new streetlights in Mirpur last year, reported thefts in the area fell by 20%. Therefore, installing streetlights across all of Dhaka will sharply reduce crime throughout the capital.',
  'A survey of 200 garment workers found that most prefer overtime pay to a shorter working week. Therefore, the government should not reduce the legal working hours in the RMG sector.',
  'Students at Green Valley School who use tablets in class scored 15% higher in final exams than those at a neighbouring school without tablets. All government schools should therefore buy tablets for every student.',
  'After a popular cricketer appeared in its advertisements, sales of FreshLife juice rose by 30%. The company should therefore spend its entire marketing budget on celebrity endorsements.',
  'The number of private universities in Bangladesh has doubled in ten years, yet graduate unemployment has also risen. Clearly, private universities are producing graduates who are not employable.',
  'Since the metro rail opened, the number of cars registered in Dhaka has kept rising. This proves that public transport projects do nothing to reduce traffic congestion.',
  'Employees at a logistics firm who completed an online training course were promoted more often than those who did not. The firm should make the course mandatory to improve staff performance.',
  'Fish production in the district rose after the new hatchery opened. To increase national fish production, the government should open a hatchery in every district.',
  'Most people who visited the new public library said they read more books than before. Therefore, building more libraries will improve the reading habits of the whole nation.',
  'Hospitals that adopted electronic patient records reported fewer prescription errors. Therefore, every upazila health complex should switch to electronic records immediately.',
  'Tourist arrivals at Cox\'s Bazar fell last year at the same time as hotel prices rose. To attract more tourists, hotels must lower their prices.',
  'A company that introduced flexible working hours saw staff turnover fall by half within a year. Every government office should introduce flexible hours to retain employees.',
];

const VIVA = [
  'Introduce yourself (in Bangla).',
  'Introduce yourself (in English).',
  'Why do you want a government job after working in the private sector?',
  'Why this organisation in particular? (MoD / BEPZA / Hi-Tech Park / NSI)',
  'Why did you come back from Canada?',
  'How will your HR and payroll experience help in this post?',
  'What is today\'s top news story? What is your view?',
  'Tell us about your home district: history, famous people, rivers, products.',
  'Who are the current heads of state and government of Bangladesh and of major countries?',
  'Who are the current ministers / advisers relevant to this organisation?',
  'What does this organisation do, and who is its current head?',
  'What are your weaknesses?',
];

const LINKS = [
  { group: 'Argument Class (13 Oct)', items: [
    ['Argument.docx: handout, template, negation test', 'https://drive.google.com/file/d/1b3lbF_xHxzrTxQbbEqzfAeQin3A_7Irj/view'],
    ['Class notes (PDF)', 'https://drive.google.com/file/d/1FdDNFe5Yv7jAnFW54dWqFvMpMXztB9KO/view'],
    ['Video: Part 01', 'https://drive.google.com/file/d/1SJWU05MWrc5QGBvjwzX7jUycCl3RUEBC/view'],
    ['Video: Part 02', 'https://drive.google.com/file/d/1QtDQZ61HlypFdGXCW3GBHNJcdPocchTq/view'],
  ]},
  { group: 'Practice', items: [
    ['VocabMaster: vocab with Bangla meanings', 'https://vocabmaster.online'],
  ]},
];
