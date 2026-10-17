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
  { id: 'mod', name: 'Ministry of Defence – AD (non-technical)', date: '', status: 'Applied' },
  { id: 'bepza', name: 'BEPZA – AD (Admin)', date: '', status: 'Applied' },
  { id: 'bhtpa', name: 'Bangladesh Hi-Tech Park Authority – AD', date: '', status: 'Applied' },
  { id: 'nsi', name: 'NSI – AD', date: '', status: 'Circular expected (check age limit, likely 32)' },
];

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
