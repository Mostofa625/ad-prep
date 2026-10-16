// What comes up most in past papers. From my analysis of past AD papers and job-exam question books
// (counts and summaries only — no book text is stored here).
const PATTERNS = {
  source: 'past AD papers',
  note: 'Based on past Assistant Director papers I read in full: Ministry of Defence 2018, NSI 2017 and NSI 2015, plus the PMO 2013 written paper. Topic shares from all the question books are added below as the analysis finishes.',
  papers: [
    { name: 'NSI – Assistant Director (2017)', info: '100 MCQ · 1 hour', mix: [['Bangla', 20], ['English', 20], ['GK (Bangladesh + international + current)', 36], ['ICT (asked in English)', 10], ['Math', 14]] },
    { name: 'Ministry of Defence – Assistant Director (2018)', info: '80 MCQ', mix: [['Bangla', 19], ['English', 21], ['Math', 20], ['GK (with defence questions)', 20]] },
    { name: 'NSI – Assistant Director (2015)', info: '100 MCQ · approx. split, BCS-style', mix: [['Bangla', 16], ['English', 9], ['Bangladesh affairs', 25], ['International affairs', 10], ['Geography & disaster', 4], ['Science & ICT', 11], ['Math', 17], ['Mental ability', 5], ['Ethics & good governance', 3]] },
  ],
  insights: [
    'Every paper asks about the recruiting organisation itself: NSI papers ask about intelligence agencies (NSI, DGFI, CIA, Mossad, RAW); Ministry of Defence papers ask about the armed forces, peacekeeping, Armed Forces Day and defence departments. Practise the "Organisation GK" topic.',
    'Bangla is mostly grammar, not literature: বানান, শুদ্ধ বাক্য, সন্ধি, সমাস, কারক, সমার্থক/বিপরীত শব্দ, বাগধারা, এক কথায় প্রকাশ and পারিভাষিক শব্দ. Literature questions are usually "who wrote this line / book".',
    'English is short and practical: word meaning, synonyms, idioms, prepositions, correct sentence, verb form ("had better", "it is time", "as if"), voice and spelling, plus 1–2 literature questions (Shakespeare, Milton).',
    'Math is the class 6–10 syllabus: percentage, profit-loss and discount, interest, ratio and age problems, LCM/HCF, pipes and work, area and volume, algebra (x + 1/x), indices and logs.',
    'GK mixes Bangladesh (Liberation War, 1952–70, constitution, national days, projects) with international organisations, recent events (sports winners, new agreements) and everyday science.',
    'NSI asks ICT questions in English: ALU, USB, Wi-Fi, web browsers, memory, open-source software.',
    'The written stage (PMO 2013 AD): translation Bangla ↔ English, ভাব-সম্প্রসারণ, an essay (e.g. on the Liberation War) and math (polynomials, a geometry proof, area). Practise these on Saturdays.',
  ],
  subjects: [],
  repeats: [],
};
