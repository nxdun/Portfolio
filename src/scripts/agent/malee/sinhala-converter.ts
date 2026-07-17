// @ts-nocheck
// Singlish to Sinhala conversion core functionality
// Character mapping and input processing logic

// Import the sinhalaPatternMap or define it inline
const sinhalaPatternMap = {
  // Independent vowels
  a: "අ",
  aa: "ආ",
  A: "ඇ",
  Aa: "ඈ",
  AA: "ඈ",
  i: "ඉ",
  ii: "ඊ",
  u: "උ",
  uu: "ඌ",
  R: "ඍ",
  Ru: "ඎ",
  e: "එ",
  ee: "ඒ",
  ai: "ඓ",
  o: "ඔ",
  oo: "ඕ",
  au: "ඖ",
  ou: "ඖ",

  // Special characters and markers
  x: "ං",
  z: "ං",
  X: "ඞ",
  H: "ඃ",
  Z: "්",

  // KA group - all combinations
  k: "ක්",
  ka: "ක",
  kha: "ඛ",
  kaa: "කා",
  kA: "කැ",
  kAa: "කෑ",
  kAA: "කෑ",
  ki: "කි",
  kii: "කී",
  ku: "කු",
  kuu: "කූ",
  kru: "කෘ",
  ke: "කෙ",
  kee: "කේ",
  kai: "කෛ",
  ko: "කො",
  koo: "කෝ",
  kau: "කෞ",
  kax: "කං",
  kaz: "කං",
  kaH: "කඃ",
  kya: "ක්‍ය",
  kra: "ක්‍ර",
  kraa: "ක්‍රා",
  krA: "ක්‍රැ",
  krAa: "ක්‍රෑ",
  krAA: "ක්‍රෑ",
  kri: "ක්‍රි",
  krii: "ක්‍රී",
  krI: "ක්‍රී",
  kru: "ක්‍රු",
  kruu: "ක්‍රූ",
  krU: "ක්‍රූ",
  kre: "ක්‍රෙ",
  kree: "ක්‍රේ",
  krE: "ක්‍රේ",
  krai: "ක්‍රෛ",
  kro: "ක්‍රො",
  kroo: "ක්‍රෝ",
  krO: "ක්‍රෝ",
  krau: "ක්‍රෞ",
  krou: "ක්‍රෞ",

  kh: "ඛ්",
  kha: "ඛ",
  khaa: "ඛා",
  khA: "ඛැ",
  khAa: "ඛෑ",
  khAA: "ඛෑ",
  khi: "ඛි",
  khii: "ඛී",
  khI: "ඛී",
  khu: "ඛු",
  khuu: "ඛූ",
  khU: "ඛූ",
  khR: "ඛෘ",
  khRu: "ඛෲ",
  khe: "ඛෙ",
  khee: "ඛේ",
  khE: "ඛේ",
  khai: "ඛෛ",
  kho: "ඛො",
  khoo: "ඛෝ",
  khO: "ඛෝ",
  khau: "ඛෞ",
  khou: "ඛෞ",
  khax: "ඛං",
  khaz: "ඛං",
  khaH: "ඛඃ",
  khya: "ඛ්‍ය",
  khYa: "ඛ්‍ය",
  khra: "ඛ්‍ර",
  khRa: "ඛ්‍ර",
  khraa: "ඛ්‍රා",
  khrA: "ඛ්‍රැ",
  khrAa: "ඛ්‍රෑ",
  khrAA: "ඛ්‍රෑ",
  khri: "ඛ්‍රි",
  khrii: "ඛ්‍රී",
  khrI: "ඛ්‍රී",
  khru: "ඛ්‍රු",
  khruu: "ඛ්‍රූ",
  khrU: "ඛ්‍රූ",
  khre: "ඛ්‍රෙ",
  khree: "ඛ්‍රේ",
  khrE: "ඛ්‍රේ",
  khrai: "ඛ්‍රෛ",
  khro: "ඛ්‍රො",
  khroo: "ඛ්‍රෝ",
  khrO: "ඛ්‍රෝ",
  khrau: "ඛ්‍රෞ",
  khrou: "ඛ්‍රෞ",
  K: "ඛ්",
  Ka: "ඛ",
  Kaa: "ඛා",

  // GA group - all combinations
  g: "ග්",
  ga: "ග",
  gha: "ඝ",
  gaa: "ගා",
  gA: "ගැ",
  gAa: "ගෑ",
  gAA: "ගෑ",
  gi: "ගි",
  gii: "ගී",
  gu: "ගු",
  guu: "ගූ",
  gru: "ගෘ",
  ge: "ගෙ",
  gee: "ගේ",
  gai: "ගෛ",
  go: "ගො",
  goo: "ගෝ",
  gau: "ගෞ",
  gax: "ගං",
  gaz: "ගං",
  gaH: "ගඃ",
  gya: "ග්‍ය",
  gra: "ග්‍ර",
  graa: "ග්‍රා",
  grA: "ග්‍රැ",
  grAa: "ග්‍රෑ",
  grAA: "ග්‍රෑ",
  gri: "ග්‍රි",
  grii: "ග්‍රී",
  grI: "ග්‍රී",
  gru: "ග්‍රු",
  gruu: "ග්‍රූ",
  grU: "ග්‍රූ",
  gre: "ග්‍රෙ",
  gree: "ග්‍රේ",
  grE: "ග්‍රේ",
  grai: "ග්‍රෛ",
  gro: "ග්‍රො",
  groo: "ග්‍රෝ",
  grO: "ග්‍රෝ",
  grau: "ග්‍රෞ",
  grou: "ග්‍රෞ",

  gh: "ඝ්",
  gha: "ඝ",
  ghaa: "ඝා",
  ghA: "ඝැ",
  ghAa: "ඝෑ",
  ghAA: "ඝෑ",
  ghi: "ඝි",
  ghii: "ඝී",
  ghI: "ඝී",
  ghu: "ඝු",
  ghuu: "ඝූ",
  ghU: "ඝූ",
  ghR: "ඝෘ",
  ghRu: "ඝෲ",
  ghe: "ඝෙ",
  ghee: "ඝේ",
  ghE: "ඝේ",
  ghai: "ඝෛ",
  gho: "ඝො",
  ghoo: "ඝෝ",
  ghO: "ඝෝ",
  ghau: "ඝෞ",
  ghou: "ඝෞ",
  ghax: "ඝං",
  ghaz: "ඝං",
  ghaH: "ඝඃ",
  ghya: "ඝ්‍ය",
  ghYa: "ඝ්‍ය",
  ghra: "ඝ්‍ර",
  ghRa: "ඝ්‍ර",
  ghraa: "ඝ්‍රා",
  ghrA: "ඝ්‍රැ",
  ghrAa: "ඝ්‍රෑ",
  ghrAA: "ඝ්‍රෑ",
  ghri: "ඝ්‍රි",
  ghrii: "ඝ්‍රී",
  ghrI: "ඝ්‍රී",
  ghru: "ඝ්‍රු",
  ghruu: "ඝ්‍රූ",
  ghrU: "ඝ්‍රූ",
  ghre: "ඝ්‍රෙ",
  ghree: "ඝ්‍රේ",
  ghrE: "ඝ්‍රේ",
  ghrai: "ඝ්‍රෛ",
  ghro: "ඝ්‍රො",
  ghroo: "ඝ්‍රෝ",
  ghrO: "ඝ්‍රෝ",
  ghrau: "ඝ්‍රෞ",
  ghrou: "ඝ්‍රෞ",
  G: "ඝ්",
  Ga: "ඝ",
  Gaa: "ඝා",

  zG: "ඟ්",
  zGa: "ඟ",
  zGaa: "ඟා",
  zGA: "ඟැ",
  zGAa: "ඟෑ",
  zGAA: "ඟෑ",
  zGi: "ඟි",
  zGii: "ඟී",
  zGI: "ඟී",
  zGu: "ඟු",
  zGuu: "ඟූ",
  zGU: "ඟූ",
  zGR: "ඟෘ",
  zGRu: "ඟෲ",
  zGe: "ඟෙ",
  zGee: "ඟේ",
  zGE: "ඟේ",
  zGai: "ඟෛ",
  zGo: "ඟො",
  zGoo: "ඟෝ",
  zGO: "ඟෝ",
  zGau: "ඟෞ",
  zGou: "ඟෞ",
  zGax: "ඟං",
  zGaz: "ඟං",
  zGaH: "ඟඃ",
  zGya: "ඟ්‍ය",
  zGYa: "ඟ්‍ය",
  zGra: "ඟ්‍ර",
  zGRa: "ඟ්‍ර",
  zGraa: "ඟ්‍රා",
  zGrA: "ඟ්‍රැ",
  zGrAa: "ඟ්‍රෑ",
  zGrAA: "ඟ්‍රෑ",
  zGri: "ඟ්‍රි",
  zGrii: "ඟ්‍රී",
  zGrI: "ඟ්‍රී",
  zGru: "ඟ්‍රු",
  zGruu: "ඟ්‍රූ",
  zGrU: "ඟ්‍රූ",
  zGre: "ඟ්‍රෙ",
  zGree: "ඟ්‍රේ",
  zGrE: "ඟ්‍රේ",
  zGrai: "ඟ්‍රෛ",
  zGro: "ඟ්‍රො",
  zGroo: "ඟ්‍රෝ",
  zGrO: "ඟ්‍රෝ",
  zGrau: "ඟ්‍රෞ",
  zGrou: "ඟ්‍රෞ",

  // CHA group - all combinations
  ch: "ච්",
  cha: "ච",
  chha: "ඡ",
  chaa: "චා",
  chA: "චැ",
  chAa: "චෑ",
  chAA: "චෑ",
  chi: "චි",
  chii: "චී",
  chu: "චු",
  chuu: "චූ",
  chru: "චෘ",
  che: "චෙ",
  chee: "චේ",
  chai: "චෛ",
  cho: "චො",
  choo: "චෝ",
  chau: "චෞ",
  chax: "චං",
  chaz: "චං",
  chaH: "චඃ",
  chya: "ච්‍ය",
  chra: "ච්‍ර",
  chraa: "ච්‍රා",
  chrA: "ච්‍රැ",
  chrAa: "ච්‍රෑ",
  chrAA: "ච්‍රෑ",
  chri: "ච්‍රි",
  chrii: "ච්‍රී",
  chrI: "ච්‍රී",
  chru: "ච්‍රු",
  chruu: "ච්‍රූ",
  chrU: "ච්‍රූ",
  chre: "ච්‍රෙ",
  chree: "ච්‍රේ",
  chrE: "ච්‍රේ",
  chrai: "ච්‍රෛ",
  chro: "ච්‍රො",
  chroo: "ච්‍රෝ",
  chrO: "ච්‍රෝ",
  chrau: "ච්‍රෞ",
  chrou: "ච්‍රෞ",

  chh: "ඡ්",
  chha: "ඡ",
  chhaa: "ඡා",
  chhA: "ඡැ",
  chhAa: "ඡෑ",
  chhAA: "ඡෑ",
  chhi: "ඡි",
  chhii: "ඡී",
  chhI: "ඡී",
  chhu: "ඡු",
  chhuu: "ඡූ",
  chhU: "ඡූ",
  chhR: "ඡෘ",
  chhRu: "ඡෲ",
  chhe: "ඡෙ",
  chhee: "ඡේ",
  chhE: "ඡේ",
  chhai: "ඡෛ",
  chho: "ඡො",
  chhoo: "ඡෝ",
  chhO: "ඡෝ",
  chhau: "ඡෞ",
  chhou: "ඡෞ",
  chhax: "ඡං",
  chhaz: "ඡං",
  chhaH: "ඡඃ",
  chhya: "ඡ්‍ය",
  chhYa: "ඡ්‍ය",
  chhra: "ඡ්‍ර",
  chhRa: "ඡ්‍ර",
  C: "ඡ්",
  Ca: "ඡ",
  Caa: "ඡා",

  zka: "ඤ",
  zKa: "ඤ",
  zk: "ඤ්",
  zK: "ඤ්",
  zcha: "ඦ",

  // JA group - all combinations
  j: "ජ්",
  ja: "ජ",
  jha: "ඣ",
  jaa: "ජා",
  jA: "ජැ",
  jAa: "ජෑ",
  jAA: "ජෑ",
  ji: "ජි",
  jii: "ජී",
  ju: "ජු",
  juu: "ජූ",
  jru: "ජෘ",
  je: "ජෙ",
  jee: "ජේ",
  jai: "ජෛ",
  jo: "ජො",
  joo: "ජෝ",
  jau: "ජෞ",
  jax: "ජං",
  jaz: "ජං",
  jaH: "ජඃ",
  jya: "ජ්‍ය",
  jra: "ජ්‍ර",

  jh: "ඣ්",
  jha: "ඣ",
  jhaa: "ඣා",
  jhA: "ඣැ",
  jhAa: "ඣෑ",
  jhAA: "ඣෑ",
  jhi: "ඣි",
  jhii: "ඣී",
  jhI: "ඣී",
  jhu: "ඣු",
  jhuu: "ඣූ",
  jhU: "ඣූ",
  jhR: "ඣෘ",
  jhRu: "ඣෲ",
  jhe: "ඣෙ",
  jhee: "ඣේ",
  jhE: "ඣේ",
  jhai: "ඣෛ",
  jho: "ඣො",
  jhoo: "ඣෝ",
  jhO: "ඣෝ",
  jhau: "ඣෞ",
  jhou: "ඣෞ",
  jhax: "ඣං",
  jhaz: "ඣං",
  jhaH: "ඣඃ",
  jhya: "ඣ්‍ය",
  jhYa: "ඣ්‍ය",
  jhra: "ඣ්‍ර",
  jhRa: "ඣ්‍ර",
  J: "ඣ්",
  Ja: "ඣ",
  Jaa: "ඣා",

  zJ: "ඦ්",
  zja: "ඦ",
  zJaa: "ඦා",
  zJA: "ඦැ",
  zJAa: "ඦෑ",
  zJAA: "ඦෑ",
  zJi: "ඦි",
  zJii: "ඦී",
  zJI: "ඦී",
  zJu: "ඦු",
  zJuu: "ඦූ",
  zJU: "ඦූ",
  zJR: "ඦෘ",
  zJRu: "ඦෲ",
  zJe: "ඦෙ",
  zJee: "ඦේ",
  zJE: "ඦේ",
  zJai: "ඦෛ",
  zJo: "ඦො",
  zJoo: "ඦෝ",
  zJO: "ඦෝ",
  zJau: "ඦෞ",
  zJou: "ඦෞ",
  zJax: "ඦං",
  zJaz: "ඦං",
  zJaH: "ඦඃ",
  zJya: "ඦ්‍ය",
  zJYa: "ඦ්‍ය",
  zJra: "ඦ්‍ර",
  zJRa: "ඦ්‍ර",

  GYa: "ඥ",
  jna: "ඥ",
  gna: "ඥ",
  zNa: "ඥ",
  zha: "ඥ",
  GY: "ඥ්",
  jn: "ඥ්",
  gn: "ඥ්",
  zN: "ඥ්",
  zh: "ඥ්",

  // TA group (retroflex) - all combinations
  t: "ට්",
  ta: "ට",
  Ta: "ඨ",
  taa: "ටා",
  tA: "ටැ",
  tAa: "ටෑ",
  tAA: "ටෑ",
  ti: "ටි",
  tii: "ටී",
  tu: "ටු",
  tuu: "ටූ",
  tru: "ටෘ",
  te: "ටෙ",
  tee: "ටේ",
  tai: "ටෛ",
  to: "ටො",
  too: "ටෝ",
  tau: "ටෞ",
  tax: "ටං",
  taz: "ටං",
  taH: "ටඃ",
  tya: "ට්‍ය",
  tra: "ට්‍ර",

  T: "ඨ්",
  Ta: "ඨ",
  Taa: "ඨා",
  TA: "ඨැ",
  TAa: "ඨෑ",
  TAA: "ඨෑ",
  Ti: "ඨි",
  Tii: "ඨී",
  TI: "ඨී",
  Tu: "ඨු",
  Tuu: "ඨූ",
  TU: "ඨූ",
  TR: "ඨෘ",
  TRu: "ඨෲ",
  Te: "ඨෙ",
  Tee: "ඨේ",
  TE: "ඨේ",
  Tai: "ඨෛ",
  To: "ඨො",
  Too: "ඨෝ",
  TO: "ඨෝ",
  Tau: "ඨෞ",
  Tou: "ඨෞ",
  Tax: "ඨං",
  Taz: "ඨං",
  TaH: "ඨඃ",
  Tya: "ඨ්‍ය",
  TYa: "ඨ්‍ය",
  Tra: "ඨ්‍ර",
  TRa: "ඨ්‍ර",
  TTa: "ට්ඨ",

  // DA group (retroflex) - all combinations
  d: "ඩ්",
  da: "ඩ",
  Da: "ඪ",
  daa: "ඩා",
  dA: "ඩැ",
  dAa: "ඩෑ",
  dAA: "ඩෑ",
  di: "ඩි",
  dii: "ඩී",
  du: "ඩු",
  duu: "ඩූ",
  dru: "ඩෘ",
  de: "ඩෙ",
  dee: "ඩේ",
  dai: "ඩෛ",
  do: "ඩො",
  doo: "ඩෝ",
  dau: "ඩෞ",
  dax: "ඩං",
  daz: "ඩං",
  daH: "ඩඃ",
  dya: "ඩ්‍ය",
  dra: "ඩ්‍ර",
  D: "ඪ්",
  Daa: "ඪා",
  zda: "ඬ",
  zD: "ඬ්",
  zDa: "ඬ",

  D: "ඪ්",
  Da: "ඪ",
  Daa: "ඪා",
  DA: "ඪැ",
  DAa: "ඪෑ",
  DAA: "ඪෑ",
  Di: "ඪි",
  Dii: "ඪී",
  DI: "ඪී",
  Du: "ඪු",
  Duu: "ඪූ",
  DU: "ඪූ",
  DR: "ඪෘ",
  DRu: "ඪෲ",
  De: "ඪෙ",
  Dee: "ඪේ",
  DE: "ඪේ",
  Dai: "ඪෛ",
  Do: "ඪො",
  Doo: "ඪෝ",
  DO: "ඪෝ",
  Dau: "ඪෞ",
  Dou: "ඪෞ",
  Dax: "ඪං",
  Daz: "ඪං",
  DaH: "ඪඃ",
  Dya: "ඪ්‍ය",
  DYa: "ඪ්‍ය",
  Dra: "ඪ්‍ර",
  DRa: "ඪ්‍ර",
  DDa: "ඪ්ඪ",

  zD: "ඬ්",
  zda: "ඬ",
  zDaa: "ඬා",
  zDA: "ඬැ",
  zDAa: "ඬෑ",
  zDAA: "ඬෑ",
  zDi: "ඬි",
  zDii: "ඬී",
  zDI: "ඬී",
  zDu: "ඬු",
  zDuu: "ඬූ",
  zDU: "ඬූ",
  zDR: "ඬෘ",
  zDRu: "ඬෲ",
  zDe: "ඬෙ",
  zDee: "ඬේ",
  zDE: "ඬේ",
  zDai: "ඬෛ",
  zDo: "ඬො",
  zDoo: "ඬෝ",
  zDO: "ඬෝ",
  zDau: "ඬෞ",
  zDou: "ඬෞ",
  zDax: "ඬං",
  zDaz: "ඬං",
  zDaH: "ඬඃ",
  zDya: "ඬ්‍ය",
  zDYa: "ඬ්‍ය",
  zDra: "ඬ්‍ර",
  zDRa: "ඬ්‍ර",

  // THA group (dental) - all combinations
  th: "ත්",
  tha: "ත",
  thha: "ථ",
  thaa: "තා",
  thA: "තැ",
  thAa: "තෑ",
  thAA: "තෑ",
  thi: "ති",
  thii: "තී",
  thu: "තු",
  thuu: "තූ",
  thru: "තෘ",
  the: "තෙ",
  thee: "තේ",
  thai: "තෛ",
  tho: "තො",
  thoo: "තෝ",
  thau: "තෞ",
  thax: "තං",
  thaz: "තං",
  thaH: "තඃ",
  thya: "ත්‍ය",
  thra: "ත්‍ර",

  Th: "ථ්",
  Tha: "ථ",
  Thaa: "ථා",
  ThA: "ථැ",
  ThAa: "ථෑ",
  ThAA: "ථෑ",
  Thi: "ථි",
  Thii: "ථී",
  ThI: "ථී",
  Thu: "ථු",
  Thuu: "ථූ",
  ThU: "ථූ",
  ThR: "ථෘ",
  ThRu: "ථෲ",
  The: "ථෙ",
  Thee: "ථේ",
  ThE: "ථේ",
  Thai: "ථෛ",
  Tho: "ථො",
  Thoo: "ථෝ",
  ThO: "ථෝ",
  Thau: "ථෞ",
  Thou: "ථෞ",
  Thax: "ථං",
  Thaz: "ථං",
  ThaH: "ථඃ",
  Thya: "ථ්‍ය",
  ThYa: "ථ්‍ය",
  Thra: "ථ්‍ර",
  ThRa: "ථ්‍ර",

  // DHA group (dental) - all combinations
  dh: "ද්",
  dha: "ද",
  dhha: "ධ",
  dhaa: "දා",
  dhA: "දැ",
  dhAa: "දෑ",
  dhAA: "දෑ",
  dhi: "දි",
  dhii: "දී",
  dhu: "දු",
  dhuu: "දූ",
  dhru: "දෘ",
  dhe: "දෙ",
  dhee: "දේ",
  dhai: "දෛ",
  dho: "දො",
  dhoo: "දෝ",
  dhau: "දෞ",
  dhax: "දං",
  dhaz: "දං",
  dhaH: "දඃ",
  dhya: "ද්‍ය",
  dhra: "ද්‍ර",

  Dh: "ධ්",
  Dha: "ධ",
  Dhaa: "ධා",
  DhA: "ධැ",
  DhAa: "ධෑ",
  DhAA: "ධෑ",
  Dhi: "ධි",
  Dhii: "ධී",
  DhI: "ධී",
  Dhu: "ධු",
  Dhuu: "ධූ",
  DhU: "ධූ",
  DhR: "ධෘ",
  DhRu: "ධෲ",
  Dhe: "ධෙ",
  Dhee: "ධේ",
  DhE: "ධේ",
  Dhai: "ධෛ",
  Dho: "ධො",
  Dhoo: "ධෝ",
  DhO: "ධෝ",
  Dhau: "ධෞ",
  Dhou: "ධෞ",
  Dhax: "ධං",
  Dhaz: "ධං",
  DhaH: "ධඃ",
  Dhya: "ධ්‍ය",
  DhYa: "ධ්‍ය",
  Dra: "ධ්‍ර",
  DhRa: "ධ්‍ර",

  zDh: "ඳ්",
  zDha: "ඳ",
  zDhaa: "ඳා",
  zDhA: "ඳැ",
  zDhAa: "ඳෑ",
  zDhAA: "ඳෑ",
  zDhi: "ඳි",
  zDhii: "ඳී",
  zDhI: "ඳී",
  zDhu: "ඳු",
  zDhuu: "ඳූ",
  zDhU: "ඳූ",
  zDhR: "ඳෘ",
  zDhRu: "ඳෲ",
  zDhe: "ඳෙ",
  zDhee: "ඳේ",
  zDhE: "ඳේ",
  zDhai: "ඳෛ",
  zDho: "ඳො",
  zDhoo: "ඳෝ",
  zDhO: "ඳෝ",
  zDhau: "ඳෞ",
  zDhou: "ඳෞ",
  zDhax: "ඳං",
  zDhaz: "ඳං",
  zDhaH: "ඳඃ",
  zDhya: "ඳ්‍ය",
  zDhYa: "ඳ්‍ය",
  zDhra: "ඳ්‍ර",
  zDhRa: "ඳ්‍ර",
  qa: "ද",
  q: "ද්",
  zqa: "ඳ",
  zq: "ඳ්",

  // NA group - all combinations
  n: "න්",
  na: "න",
  Na: "ණ",
  naa: "නා",
  nA: "නැ",
  nAa: "නෑ",
  nAA: "නෑ",
  ni: "නි",
  nii: "නී",
  nu: "නු",
  nuu: "නූ",
  nru: "නෘ",
  ne: "නෙ",
  nee: "නේ",
  nai: "නෛ",
  no: "නො",
  noo: "නෝ",
  nau: "නෞ",
  nax: "නං",
  naz: "නං",
  naH: "නඃ",
  nya: "න්‍ය",
  nra: "න්‍ර",

  N: "ණ්",
  Na: "ණ",
  Naa: "ණා",
  NA: "ණැ",
  NAa: "ණෑ",
  NAA: "ණෑ",
  Ni: "ණි",
  Nii: "ණී",
  NI: "ණී",
  Nu: "ණු",
  Nuu: "ණූ",
  NU: "ණූ",
  NR: "ණෘ",
  NRu: "ණෲ",
  Ne: "ණෙ",
  Nee: "ණේ",
  NE: "ණේ",
  Nai: "ණෛ",
  No: "ණො",
  Noo: "ණෝ",
  NO: "ණෝ",
  Nau: "ණෞ",
  Nou: "ණෞ",
  Nax: "ණං",
  Naz: "ණං",
  NaH: "ණඃ",
  Nya: "ණ්‍ය",
  NYa: "ණ්‍ය",
  Nra: "ණ්‍ර",
  NRa: "ණ්‍ර",

  zna: "ඥ",
  zN: "ඥ්",
  zNa: "ඥ",
  zha: "ඥ",

  // PA group - all combinations
  p: "ප්",
  pa: "ප",
  pha: "ඵ",
  paa: "පා",
  pA: "පැ",
  pAa: "පෑ",
  pAA: "පෑ",
  pi: "පි",
  pii: "පී",
  pu: "පු",
  puu: "පූ",
  pru: "පෘ",
  pe: "පෙ",
  pee: "පේ",
  pai: "පෛ",
  po: "පො",
  poo: "පෝ",
  pau: "පෞ",
  pax: "පං",
  paz: "පං",
  paH: "පඃ",
  pya: "ප්‍ය",
  pra: "ප්‍ර",
  praa: "ප්‍රා",
  prA: "ප්‍රැ",
  prAa: "ප්‍රෑ",
  prAA: "ප්‍රෑ",
  pri: "ප්‍රි",
  prii: "ප්‍රී",
  pru: "ප්‍රු",
  pruu: "ප්‍රූ",
  pre: "ප්‍රෙ",
  pree: "ප්‍රේ",
  prai: "ප්‍රෛ",
  pro: "ප්‍රො",
  proo: "ප්‍රෝ",
  prau: "ප්‍රෞ",

  ph: "ඵ්",
  pha: "ඵ",
  phaa: "ඵා",
  phA: "ඵැ",
  phAa: "ඵෑ",
  phAA: "ඵෑ",
  phi: "ඵි",
  phii: "ඵී",
  phI: "ඵී",
  phu: "ඵු",
  phuu: "ඵූ",
  phU: "ඵූ",
  phR: "ඵෘ",
  phRu: "ඵෲ",
  phe: "ඵෙ",
  phee: "ඵේ",
  phE: "ඵේ",
  phai: "ඵෛ",
  pho: "ඵො",
  phoo: "ඵෝ",
  phO: "ඵෝ",
  phau: "ඵෞ",
  phou: "ඵෞ",
  phax: "ඵං",
  phaz: "ඵං",
  phaH: "ඵඃ",
  phya: "ඵ්‍ය",
  phYa: "ඵ්‍ය",
  phra: "ඵ්‍ර",
  phRa: "ඵ්‍ර",
  phraa: "ඵ්‍රා",
  phraA: "ඵ්‍රැ",
  phraAa: "ඵ්‍රෑ",
  phraAA: "ඵ්‍රෑ",
  phri: "ඵ්‍රි",
  phrii: "ඵ්‍රී",
  phru: "ඵ්‍රු",
  phruu: "ඵ්‍රූ",
  phre: "ඵ්‍රෙ",
  phree: "ඵ්‍රේ",
  phrai: "ඵ්‍රෛ",
  phro: "ඵ්‍රො",
  phroo: "ඵ්‍රෝ",
  phrau: "ඵ්‍රෞ",

  P: "ඵ්",
  Pa: "ඵ",
  Paa: "ඵා",

  // BA group - all combinations
  b: "බ්",
  ba: "බ",
  bha: "භ",
  baa: "බා",
  bA: "බැ",
  bAa: "බෑ",
  bAA: "බෑ",
  bi: "බි",
  bii: "බී",
  bu: "බු",
  buu: "බූ",
  bru: "බෘ",
  be: "බෙ",
  bee: "බේ",
  bai: "බෛ",
  bo: "බො",
  boo: "බෝ",
  bau: "බෞ",
  bax: "බං",
  baz: "බං",
  baH: "බඃ",
  bya: "බ්‍ය",
  bra: "බ්‍ර",

  bh: "භ්",
  bha: "භ",
  bhaa: "භා",
  bhA: "භැ",
  bhAa: "භෑ",
  bhAA: "භෑ",
  bhi: "භි",
  bhii: "භී",
  bhI: "භී",
  bhu: "භු",
  bhuu: "භූ",
  bhU: "භූ",
  bhR: "භෘ",
  bhRu: "භෲ",
  bhe: "භෙ",
  bhee: "භේ",
  bhE: "භේ",
  bhai: "භෛ",
  bho: "භො",
  bhoo: "භෝ",
  bhO: "භෝ",
  bhau: "භෞ",
  bhou: "භෞ",
  bhax: "භං",
  bhaz: "භං",
  bhaH: "භඃ",
  bhya: "භ්‍ය",
  bhYa: "භ්‍ය",
  bhra: "භ්‍ර",
  bhRa: "භ්‍ර",

  B: "භ්",
  Ba: "භ",
  Baa: "භා",

  zB: "ඹ්",
  zba: "ඹ",
  zBaa: "ඹා",
  zBA: "ඹැ",
  zBAa: "ඹෑ",
  zBAA: "ඹෑ",
  zBi: "ඹි",
  zBii: "ඹී",
  zBI: "ඹී",
  zBu: "ඹු",
  zBuu: "ඹූ",
  zBU: "ඹූ",
  zBR: "ඹෘ",
  zBRu: "ඹෲ",
  zBe: "ඹෙ",
  zBee: "ඹේ",
  zBE: "ඹේ",
  zBai: "ඹෛ",
  zBo: "ඹො",
  zBoo: "ඹෝ",
  zBO: "ඹෝ",
  zBau: "ඹෞ",
  zBou: "ඹෞ",
  zBax: "ඹං",
  zBaz: "ඹං",
  zBaH: "ඹඃ",
  zBya: "ඹ්‍ය",
  zBYa: "ඹ්‍ය",
  zBra: "ඹ්‍ර",
  zBRa: "ඹ්‍ර",

  // MA group - all combinations
  m: "ම්",
  ma: "ම",
  maa: "මා",
  mA: "මැ",
  mAa: "මෑ",
  mAA: "මෑ",
  mi: "මි",
  mii: "මී",
  mu: "මු",
  muu: "මූ",
  mru: "මෘ",
  me: "මෙ",
  mee: "මේ",
  mai: "මෛ",
  mo: "මො",
  moo: "මෝ",
  mau: "මෞ",
  max: "මං",
  maz: "මං",
  maH: "මඃ",
  mya: "ම්‍ය",
  mra: "ම්‍ර",

  // YA group - all combinations
  y: "ය්",
  ya: "ය",
  yaa: "යා",
  yA: "යැ",
  yAa: "යෑ",
  yAA: "යෑ",
  yi: "යි",
  yii: "යී",
  yu: "යු",
  yuu: "යූ",
  yru: "යෘ",
  ye: "යෙ",
  yee: "යේ",
  yai: "යෛ",
  yo: "යො",
  yoo: "යෝ",
  yau: "යෞ",
  yax: "යං",
  yaz: "යං",
  yaH: "යඃ",
  yya: "ය්‍ය",
  yra: "ය්‍ර",

  // RA group - all combinations
  r: "ර්",
  ra: "ර",
  raa: "රා",
  rA: "රැ",
  rAa: "රෑ",
  rAA: "රෑ",
  ri: "රි",
  rii: "රී",
  ru: "රු",
  ruu: "රූ",
  rru: "රෘ",
  re: "රෙ",
  ree: "රේ",
  rai: "රෛ",
  ro: "රො",
  roo: "රෝ",
  rau: "රෞ",
  rax: "රං",
  raz: "රං",
  raH: "රඃ",
  rya: "ර්‍ය",
  rra: "ර්‍ර",

  // LA group - all combinations
  l: "ල්",
  la: "ල",
  La: "ළ",
  laa: "ලා",
  lA: "ලැ",
  lAa: "ලෑ",
  lAA: "ලෑ",
  li: "ලි",
  lii: "ලී",
  lu: "ලු",
  luu: "ලූ",
  lru: "ලෘ",
  le: "ලෙ",
  lee: "ලේ",
  lai: "ලෛ",
  lo: "ලො",
  loo: "ලෝ",
  lau: "ලෞ",
  lax: "ලං",
  laz: "ලං",
  laH: "ලඃ",
  lya: "ල්‍ය",
  lra: "ල්‍ර",

  L: "ළ්",
  La: "ළ",
  Laa: "ළා",
  LA: "ළැ",
  LAa: "ළෑ",
  LAA: "ළෑ",
  Li: "ළි",
  Lii: "ළී",
  LI: "ළී",
  Lu: "ළු",
  Luu: "ළූ",
  LU: "ළූ",
  LR: "ළෘ",
  LRu: "ළෲ",
  Le: "ළෙ",
  Lee: "ළේ",
  LE: "ළේ",
  Lai: "ළෛ",
  Lo: "ළො",
  Loo: "ළෝ",
  LO: "ළෝ",
  Lau: "ළෞ",
  Lou: "ළෞ",
  Lax: "ළං",
  Laz: "ළං",
  LaH: "ළඃ",
  Lya: "ළ්‍ය",
  LYa: "ළ්‍ය",
  Lra: "ළ්‍ර",
  LRa: "ළ්‍ර",

  // VA/WA group - all combinations
  v: "ව්",
  w: "ව්",
  va: "ව",
  wa: "ව",
  vaa: "වා",
  waa: "වා",
  vA: "වැ",
  wA: "වැ",
  vAa: "වෑ",
  wAa: "වෑ",
  vAA: "වෑ",
  wAA: "වෑ",
  vi: "වි",
  wi: "වි",
  vii: "වී",
  wii: "වී",
  vu: "වු",
  wu: "වු",
  vuu: "වූ",
  wuu: "වූ",
  vru: "වෘ",
  wru: "වෘ",
  ve: "වෙ",
  we: "වෙ",
  vee: "වේ",
  wee: "වේ",
  vai: "වෛ",
  wai: "වෛ",
  vo: "වො",
  wo: "වො",
  voo: "වෝ",
  woo: "වෝ",
  vau: "වෞ",
  wau: "වෞ",
  vax: "වං",
  wax: "වං",
  vaz: "වං",
  waz: "වං",
  vaH: "වඃ",
  waH: "වඃ",
  vya: "ව්‍ය",
  wya: "ව්‍ය",
  vra: "ව්‍ර",
  wra: "ව්‍ර",

  // SA group - all combinations
  s: "ස්",
  sa: "ස",
  sha: "ශ",
  Sa: "ෂ",
  Sha: "ෂ",
  saa: "සා",
  sA: "සැ",
  sAa: "සෑ",
  sAA: "සෑ",
  si: "සි",
  sii: "සී",
  su: "සු",
  suu: "සූ",
  sru: "සෘ",
  se: "සෙ",
  see: "සේ",
  sai: "සෛ",
  so: "සො",
  soo: "සෝ",
  sau: "සෞ",
  sax: "සං",
  saz: "සං",
  saH: "සඃ",
  sya: "ස්‍ය",
  sra: "ස්‍ර",
  sh: "ශ්",
  S: "ෂ්",
  Sh: "ෂ්",
  sha: "ශ",
  shaa: "ශා",
  shA: "ශැ",
  shAa: "ශෑ",
  shAA: "ශෑ",
  shi: "ශි",
  shii: "ශී",
  shu: "ශු",
  shuu: "ශූ",
  shru: "ශෘ",
  she: "ශෙ",
  shee: "ශේ",
  shai: "ශෛ",
  sho: "ශො",
  shoo: "ශෝ",
  shau: "ශෞ",
  shax: "ශං",
  shaz: "ශං",
  shaH: "ශඃ",
  shya: "ශ්‍ය",
  shra: "ශ්‍ර",
  Sa: "ෂ",
  Saa: "ෂා",
  SA: "ෂැ",
  SAa: "ෂෑ",
  SAA: "ෂෑ",
  Si: "ෂි",
  Sii: "ෂී",
  Su: "ෂු",
  Suu: "ෂූ",
  Sru: "ෂෘ",
  Se: "ෂෙ",
  See: "ෂේ",
  Sai: "ෂෛ",
  So: "ෂො",
  Soo: "ෂෝ",
  Sau: "ෂෞ",
  Sax: "ෂං",
  Saz: "ෂං",
  SaH: "ෂඃ",
  Sya: "ෂ්‍ය",
  Sra: "ෂ්‍ර",

  // HA group - all combinations
  h: "හ්",
  ha: "හ",
  haa: "හා",
  hA: "හැ",
  hAa: "හෑ",
  hAA: "හෑ",
  hi: "හි",
  hii: "හී",
  hu: "හු",
  huu: "හූ",
  hru: "හෘ",
  he: "හෙ",
  hee: "හේ",
  hai: "හෛ",
  ho: "හො",
  hoo: "හෝ",
  hau: "හෞ",
  hax: "හං",
  haz: "හං",
  haH: "හඃ",
  hya: "හ්‍ය",
  hra: "හ්‍ර",

  // FA group - all combinations
  f: "ෆ්",
  fa: "ෆ",
  faa: "ෆා",
  fA: "ෆැ",
  fAa: "ෆෑ",
  fAA: "ෆෑ",
  fi: "ෆි",
  fii: "ෆී",
  fu: "ෆු",
  fuu: "ෆූ",
  fru: "ෆෘ",
  fe: "ෆෙ",
  fee: "ෆේ",
  fai: "ෆෛ",
  fo: "ෆො",
  foo: "ෆෝ",
  fau: "ෆෞ",
  fax: "ෆං",
  faz: "ෆං",
  faH: "ෆඃ",
  fya: "ෆ්‍ය",
  fra: "ෆ්‍ර",

  // Special consonant combinations
  nda: "න්ද",
  ndha: "න්ධ",
  ndra: "න්ද්‍ර",
  ndhra: "න්ධ්‍ර",
  nsa: "න්ස",
  mba: "ම්බ",
  mbha: "ම්භ",
  mpa: "ම්ප",
  mpha: "ම්ඵ",
  lla: "ල්ල",
  ksha: "ක්ෂ",
  kSa: "ක්ෂ",
  gna: "ඥ",
  jna: "ඥ",

  // Nasalized consonants
  zka: "ඤ",
  zKa: "ඤ",
  zk: "ඤ්",
  zK: "ඤ්",
  nga: "ඞ්ග",
  nka: "ඞ්ක",

  // Additional common combinations and special forms
  kSha: "ක්ෂ",
  kS: "ක්ෂ්",
  kSh: "ක්ෂ්",
  kSa: "ක්ෂ",
  GYa: "ඥ",

  // Additional "ra" combinations for various consonants
  jra: "ජ්‍ර",
  jraa: "ජ්‍රා",
  jrA: "ජ්‍රැ",
  jrAa: "ජ්‍රෑ",
  jrAA: "ජ්‍රෑ",
  jri: "ජ්‍රි",
  jrii: "ජ්‍රී",
  jrI: "ජ්‍රී",
  jru: "ජ්‍රු",
  jruu: "ජ්‍රූ",
  jrU: "ජ්‍රූ",
  jre: "ජ්‍රෙ",
  jree: "ජ්‍රේ",
  jrE: "ජ්‍රේ",
  jrai: "ජ්‍රෛ",
  jro: "ජ්‍රො",
  jroo: "ජ්‍රෝ",
  jrO: "ජ්‍රෝ",
  jrau: "ජ්‍රෞ",
  jrou: "ජ්‍රෞ",

  tra: "ට්‍ර",
  traa: "ට්‍රා",
  trA: "ට්‍රැ",
  trAa: "ට්‍රෑ",
  trAA: "ට්‍රෑ",
  tri: "ට්‍රි",
  trii: "ට්‍රී",
  trI: "ට්‍රී",
  tru: "ට්‍රු",
  truu: "ට්‍රූ",
  trU: "ට්‍රූ",
  tre: "ට්‍රෙ",
  tree: "ට්‍රේ",
  trE: "ට්‍රේ",
  trai: "ට්‍රෛ",
  tro: "ට්‍රො",
  troo: "ට්‍රෝ",
  trO: "ට්‍රෝ",
  trau: "ට්‍රෞ",
  trou: "ට්‍රෞ",

  dra: "ඩ්‍ර",
  draa: "ඩ්‍රා",
  drA: "ඩ්‍රැ",
  drAa: "ඩ්‍රෑ",
  drAA: "ඩ්‍රෑ",
  dri: "ඩ්‍රි",
  drii: "ඩ්‍රී",
  drI: "ඩ්‍රී",
  dru: "ඩ්‍රු",
  druu: "ඩ්‍රූ",
  drU: "ඩ්‍රූ",
  dre: "ඩ්‍රෙ",
  dree: "ඩ්‍රේ",
  drE: "ඩ්‍රේ",
  drai: "ඩ්‍රෛ",
  dro: "ඩ්‍රො",
  droo: "ඩ්‍රෝ",
  drO: "ඩ්‍රෝ",
  drau: "ඩ්‍රෞ",
  drou: "ඩ්‍රෞ",

  nra: "න්‍ර",
  nraa: "න්‍රා",
  nrA: "න්‍රැ",
  nrAa: "න්‍රෑ",
  nrAA: "න්‍රෑ",
  nri: "න්‍රි",
  nrii: "න්‍රී",
  nrI: "න්‍රී",
  nru: "න්‍රු",
  nruu: "න්‍රූ",
  nrU: "න්‍රූ",
  nre: "න්‍රෙ",
  nree: "න්‍රේ",
  nrE: "න්‍රේ",
  nrai: "න්‍රෛ",
  nro: "න්‍රො",
  nroo: "න්‍රෝ",
  nrO: "න්‍රෝ",
  nrau: "න්‍රෞ",
  nrou: "න්‍රෞ",

  bra: "බ්‍ර",
  braa: "බ්‍රා",
  brA: "බ්‍රැ",
  brAa: "බ්‍රෑ",
  brAA: "බ්‍රෑ",
  bri: "බ්‍රි",
  brii: "බ්‍රී",
  brI: "බ්‍රී",
  bru: "බ්‍රු",
  bruu: "බ්‍රූ",
  brU: "බ්‍රූ",
  bre: "බ්‍රෙ",
  bree: "බ්‍රේ",
  brE: "බ්‍රේ",
  brai: "බ්‍රෛ",
  bro: "බ්‍රො",
  broo: "බ්‍රෝ",
  brO: "බ්‍රෝ",
  brau: "බ්‍රෞ",
  brou: "බ්‍රෞ",

  mra: "ම්‍ර",
  mraa: "ම්‍රා",
  mrA: "ම්‍රැ",
  mrAa: "ම්‍රෑ",
  mrAA: "ම්‍රෑ",
  mri: "ම්‍රි",
  mrii: "ම්‍රී",
  mrI: "ම්‍රී",
  mru: "ම්‍රු",
  mruu: "ම්‍රූ",
  mrU: "ම්‍රූ",
  mre: "ම්‍රෙ",
  mree: "ම්‍රේ",
  mrE: "ම්‍රේ",
  mrai: "ම්‍රෛ",
  mro: "ම්‍රො",
  mroo: "ම්‍රෝ",
  mrO: "ම්‍රෝ",
  mrau: "ම්‍රෞ",
  mrou: "ම්‍රෞ",

  yra: "ය්‍ර",
  yraa: "ය්‍රා",
  yrA: "ය්‍රැ",
  yrAa: "ය්‍රෑ",
  yrAA: "ය්‍රෑ",
  yri: "ය්‍රි",
  yrii: "ය්‍රී",
  yrI: "ය්‍රී",
  yru: "ය්‍රු",
  yruu: "ය්‍රූ",
  yrU: "ය්‍රූ",
  yre: "ය්‍රෙ",
  yree: "ය්‍රේ",
  yrE: "ය්‍රේ",
  yrai: "ය්‍රෛ",
  yro: "ය්‍රො",
  yroo: "ය්‍රෝ",
  yrO: "ය්‍රෝ",
  yrau: "ය්‍රෞ",
  yrou: "ය්‍රෞ",

  rra: "ර්‍ර",
  rraa: "ර්‍රා",
  rrA: "ර්‍රැ",
  rrAa: "ර්‍රෑ",
  rrAA: "ර්‍රෑ",
  rri: "ර්‍රි",
  rrii: "ර්‍රී",
  rrI: "ර්‍රී",
  rru: "ර්‍රු",
  rruu: "ර්‍රූ",
  rrU: "ර්‍රූ",
  rre: "ර්‍රෙ",
  rree: "ර්‍රේ",
  rrE: "ර්‍රේ",
  rrai: "ර්‍රෛ",
  rro: "ර්‍රො",
  rroo: "ර්‍රෝ",
  rrO: "ර්‍රෝ",
  rrau: "ර්‍රෞ",
  rrou: "ර්‍රෞ",

  lra: "ල්‍ර",
  lraa: "ල්‍රා",
  lrA: "ල්‍රැ",
  lrAa: "ල්‍රෑ",
  lrAA: "ල්‍රෑ",
  lri: "ල්‍රි",
  lrii: "ල්‍රී",
  lrI: "ල්‍රී",
  lru: "ල්‍රු",
  lruu: "ල්‍රූ",
  lrU: "ල්‍රූ",
  lre: "ල්‍රෙ",
  lree: "ල්‍රේ",
  lrE: "ල්‍රේ",
  lrai: "ල්‍රෛ",
  lro: "ල්‍රො",
  lroo: "ල්‍රෝ",
  lrO: "ල්‍රෝ",
  lrau: "ල්‍රෞ",
  lrou: "ල්‍රෞ",

  wra: "ව්‍ර",
  vra: "ව්‍ර",
  wraa: "ව්‍රා",
  vraa: "ව්‍රා",
  wrA: "ව්‍රැ",
  vrA: "ව්‍රැ",
  wrAa: "ව්‍රෑ",
  vrAa: "ව්‍රෑ",
  wrAA: "ව්‍රෑ",
  vrAA: "ව්‍රෑ",
  wri: "ව්‍රි",
  vri: "ව්‍රි",
  wrii: "ව්‍රී",
  vrii: "ව්‍රී",
  wrI: "ව්‍රී",
  vrI: "ව්‍රී",
  wru: "ව්‍රු",
  vru: "ව්‍රු",
  wruu: "ව්‍රූ",
  vruu: "ව්‍රූ",
  wrU: "ව්‍රූ",
  vrU: "ව්‍රූ",
  wre: "ව්‍රෙ",
  vre: "ව්‍රෙ",
  wree: "ව්‍රේ",
  vree: "ව්‍රේ",
  wrE: "ව්‍රේ",
  vrE: "ව්‍රේ",
  wrai: "ව්‍රෛ",
  vrai: "ව්‍රෛ",
  wro: "ව්‍රො",
  vro: "ව්‍රො",
  wroo: "ව්‍රෝ",
  vroo: "ව්‍රෝ",
  wrO: "ව්‍රෝ",
  vrO: "ව්‍රෝ",
  wrau: "ව්‍රෞ",
  vrau: "ව්‍රෞ",
  wrou: "ව්‍රෞ",
  vrou: "ව්‍රෞ",

  Sra: "ෂ්‍ර",
  Sraa: "ෂ්‍රා",
  SrA: "ෂ්‍රැ",
  SrAa: "ෂ්‍රෑ",
  SrAA: "ෂ්‍රෑ",
  Sri: "ෂ්‍රි",
  Srii: "ෂ්‍රී",
  SrI: "ෂ්‍රී",
  Sru: "ෂ්‍රු",
  Sruu: "ෂ්‍රූ",
  SrU: "ෂ්‍රූ",
  Sre: "ෂ්‍රෙ",
  Sree: "ෂ්‍රේ",
  SrE: "ෂ්‍රේ",
  Srai: "ෂ්‍රෛ",
  Sro: "ෂ්‍රො",
  Sroo: "ෂ්‍රෝ",
  SrO: "ෂ්‍රෝ",
  Srau: "ෂ්‍රෞ",
  Srou: "ෂ්‍රෞ",

  shra: "ශ්‍ර",
  shraa: "ශ්‍රා",
  shrA: "ශ්‍රැ",
  shrAa: "ශ්‍රෑ",
  shrAA: "ශ්‍රෑ",
  shri: "ශ්‍රි",
  shrii: "ශ්‍රී",
  shrI: "ශ්‍රී",
  shru: "ශ්‍රු",
  shruu: "ශ්‍රූ",
  shrU: "ශ්‍රූ",
  shre: "ශ්‍රෙ",
  shree: "ශ්‍රේ",
  shrE: "ශ්‍රේ",
  shrai: "ශ්‍රෛ",
  shro: "ශ්‍රො",
  shroo: "ශ්‍රෝ",
  shrO: "ශ්‍රෝ",
  shrau: "ශ්‍රෞ",
  shrou: "ශ්‍රෞ",

  hra: "හ්‍ර",
  hraa: "හ්‍රා",
  hrA: "හ්‍රැ",
  hrAa: "හ්‍රෑ",
  hrAA: "හ්‍රෑ",
  hri: "හ්‍රි",
  hrii: "හ්‍රී",
  hrI: "හ්‍රී",
  hru: "හ්‍රු",
  hruu: "හ්‍රූ",
  hrU: "හ්‍රූ",
  hre: "හ්‍රෙ",
  hree: "හ්‍රේ",
  hrE: "හ්‍රේ",
  hrai: "හ්‍රෛ",
  hro: "හ්‍රො",
  hroo: "හ්‍රෝ",
  hrO: "හ්‍රෝ",
  hrau: "හ්‍රෞ",
  hrou: "හ්‍රෞ",

  fra: "ෆ්‍ර",
  fraa: "ෆ්‍රා",
  frA: "ෆ්‍රැ",
  frAa: "ෆ්‍රෑ",
  frAA: "ෆ්‍රෑ",
  fri: "ෆ්‍රි",
  frii: "ෆ්‍රී",
  frI: "ෆ්‍රී",
  fru: "ෆ්‍රු",
  fruu: "ෆ්‍රූ",
  frU: "ෆ්‍රූ",
  fre: "ෆ්‍රෙ",
  free: "ෆ්‍රේ",
  frE: "ෆ්‍රේ",
  frai: "ෆ්‍රෛ",
  fro: "ෆ්‍රො",
  froo: "ෆ්‍රෝ",
  frO: "ෆ්‍රෝ",
  frau: "ෆ්‍රෞ",
  frou: "ෆ්‍රෞ",
};

// Vowel modifiers that can be applied after a consonant
const vowelModifiers = {
  a: "", // No change (remove hal)
  A: "ැ", // æ
  aa: "ා", // ā
  AA: "ෑ", // ǣ
  Aa: "ෑ", // ǣ (alternate)
  i: "ි", // i
  ii: "ී", // ī
  I: "ී", // ī (alternate)
  u: "ු", // u
  uu: "ූ", // ū
  U: "ූ", // ū (alternate)
  e: "ෙ", // e
  ee: "ේ", // ē
  E: "ේ", // ē (alternate)
  ai: "ෛ", // ai
  o: "ො", // o
  oo: "ෝ", // ō
  O: "ෝ", // ō (alternate)
  au: "ෞ", // au
  ou: "ෞ", // au (alternate)
  ru: "ෘ", // ṛ
  Ru: "ෲ", // ṝ
  ax: "ං", // aṁ
  az: "ං", // aṁ (alternate)
  aH: "ඃ", // aḥ
};

// Special modifiers that can be applied after a consonant
const specialModifiers = {
  ya: "්‍ය", // consonant + ya (ZWNJ in middle)
  ra: "්‍ර", // consonant + ra (ZWNJ in middle)
  Y: "්‍ය", // alternate
  R: "්‍ර", // alternate
};

// Initialize state variables
let sinhalaInputEnabled = false;
let keyBuffer = []; // Array of individual keypresses for current word
let lastOutputLength = 0;

// Remove typing delay function entirely

// Track elements that already have listeners to prevent duplicates
const elementsWithListeners = new WeakSet();

// Prepare consonant bases for easier lookup
function initializeConsonantBases() {
  // Automatically extract base forms from the singleKeyMap entries with hal
  for (const key in sinhalaPatternMap) {
    const value = sinhalaPatternMap[key];
    if (value && value.endsWith("්")) {
      value.slice(0, -1); // Remove hal
    }
  }
}

/**
 * Initialize the Sinhala input functionality
 * @param {boolean} startEnabled - Whether to start with the feature enabled
 */
function initializeSinhalaInput(startEnabled = false) {
  // Initialize consonant bases
  initializeConsonantBases();

  // Set initial state
  sinhalaInputEnabled = startEnabled;

  // Set up event listeners
  setupKeyboardMapping();
}

// Helper to convert speed setting to ms
function getTypingDelayFromSpeed$1(speed) {
  switch (speed) {
    case "fast":
      return 250;
    case "moderate":
      return 500;
    case "slow":
      return 750;
    default:
      return 500; // Default to moderate
  }
}

// Reset state with proper cleanup
function resetState() {
  keyBuffer = [];
  lastOutputLength = 0;
}

// Setup real-time keyboard mapping
function setupKeyboardMapping() {
  console.log("Setting up keyboard mapping event listeners");

  // Attach direct listeners to all input elements without duplicating
  document
    .querySelectorAll(
      'input[type="text"], input[type="search"], textarea, [contenteditable="true"]'
    )
    .forEach(element => {
      attachKeyListenerIfNeeded(element);
    });

  // Watch for new input elements using MutationObserver
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (
            node.nodeName === "INPUT" ||
            node.nodeName === "TEXTAREA" ||
            (node.getAttribute &&
              node.getAttribute("contenteditable") === "true")
          ) {
            attachKeyListenerIfNeeded(node);
          }

          // Check for descendants that might be input elements
          if (node.querySelectorAll) {
            node
              .querySelectorAll(
                'input[type="text"], input[type="search"], textarea, [contenteditable="true"]'
              )
              .forEach(element => {
                attachKeyListenerIfNeeded(element);
              });
          }
        });
      }
    });
  });

  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });

  // Handle focus to reset state
  document.addEventListener("click", function (e) {
    resetState();
  });
}

// Helper to avoid adding duplicate listeners
function attachKeyListenerIfNeeded(element) {
  if (!elementsWithListeners.has(element)) {
    element.addEventListener("keydown", handleKeyEvent, true);
    elementsWithListeners.add(element);
  }
}

// Modified function to handle real-time retroactive typing (no delay)
function handleKeyEvent(e) {
  if (!sinhalaInputEnabled) return;

  // Only process in input fields
  const target = e.target;
  if (
    !(
      target.tagName === "INPUT" &&
      (target.type === "text" || target.type === "search")
    ) &&
    target.tagName !== "TEXTAREA" &&
    target.contentEditable !== "true"
  ) {
    return;
  }

  // Handle special keys
  if (e.key === "Backspace") {
    if (keyBuffer.length > 0) {
      keyBuffer.pop();
      e.preventDefault();

      // Re-evaluate the new shorter buffer
      const newOutput = convertBufferToString(keyBuffer);
      deleteLastCharacters(target, lastOutputLength);

      if (newOutput) {
        insertCharacter(target, newOutput);
        lastOutputLength = newOutput.length;
      } else {
        lastOutputLength = 0;
      }
      return false;
    }
    return;
  }

  // Space is a delimiter - commit word then add space
  if (e.key === " ") {
    resetState();
    return;
  }

  // Handle other control keys - reset state immediately
  if (
    e.key === "Enter" ||
    e.key === "Tab" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "Escape" ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
  ) {
    resetState();
    return;
  }

  // Only handle single characters with retroactive replacement
  if (e.key.length === 1) {
    keyBuffer.push(e.key);
    e.preventDefault();

    const newOutput = convertBufferToString(keyBuffer);

    deleteLastCharacters(target, lastOutputLength);
    insertCharacter(target, newOutput);

    lastOutputLength = newOutput.length;
    return false;
  }
}

// Convert a buffer array to Sinhala string without modifying DOM
function convertBufferToString(buffer) {
  if (buffer.length === 0) return "";

  let result = "";
  let position = 0;

  while (position < buffer.length) {
    let longestMatch = null;
    let longestMatchLength = 0;
    let longestMatchValue = null;

    // Try finding the longest match starting at the current position
    // Limit to maximum 5 characters since no pattern exceeds this length
    const maxPatternLength = Math.min(5, buffer.length - position);

    for (
      let patternLength = maxPatternLength;
      patternLength > 0;
      patternLength--
    ) {
      const slice = buffer.slice(position, position + patternLength).join("");

      if (sinhalaPatternMap[slice]) {
        longestMatch = slice;
        longestMatchLength = patternLength;
        longestMatchValue = sinhalaPatternMap[slice];
        break; // Found the longest match, stop searching
      }
    }

    // If no direct match found, check for consonant + vowel combinations
    if (!longestMatch && position < buffer.length - 1) {
      const consonantKey = buffer[position];

      if (isConsonantWithHal(consonantKey)) {
        // Try to find the longest vowel modifier after this consonant
        // Limit to maximum 4 characters for vowel modifiers (since longest consonant+vowel could be 5)
        const maxVowelLength = Math.min(4, buffer.length - position - 1);

        for (let vowelLength = maxVowelLength; vowelLength > 0; vowelLength--) {
          const vowelModifier = buffer
            .slice(position + 1, position + 1 + vowelLength)
            .join("");

          if (vowelModifiers[vowelModifier]) {
            const consonantWithHal = sinhalaPatternMap[consonantKey];
            const base = getConsonantBase(consonantWithHal);
            const modifier = vowelModifiers[vowelModifier];

            longestMatch = consonantKey + vowelModifier;
            longestMatchLength = 1 + vowelLength;
            longestMatchValue = base + modifier;
            break;
          }
        }
      }
    }

    // Special case for consonant + special modifier (ra, ya)
    if (!longestMatch && position < buffer.length - 1) {
      const consonantKey = buffer[position];

      if (isConsonantWithHal(consonantKey)) {
        const maxSpecialLength = Math.min(2, buffer.length - position - 1);

        for (
          let specialLength = maxSpecialLength;
          specialLength > 0;
          specialLength--
        ) {
          const specialModifier = buffer
            .slice(position + 1, position + 1 + specialLength)
            .join("");

          if (specialModifiers[specialModifier]) {
            const consonantWithHal = sinhalaPatternMap[consonantKey];
            const base = getConsonantBase(consonantWithHal);
            const modifier = specialModifiers[specialModifier];

            longestMatch = consonantKey + specialModifier;
            longestMatchLength = 1 + specialLength;
            longestMatchValue = base + modifier;
            break;
          }
        }
      }
    }

    if (longestMatch) {
      result += longestMatchValue;
      position += longestMatchLength;
    } else {
      result += buffer[position];
      position++;
    }
  }

  return result;
}

// Delete characters before the cursor
function deleteLastCharacters(target, count) {
  if (count <= 0) return;

  if (target.contentEditable === "true") {
    const selection = window.getSelection();
    for (let i = 0; i < count; i++) {
      document.execCommand("delete", false, null);
    }
  } else {
    const end = target.selectionEnd;
    const start = end - count;
    if (start >= 0) {
      const value = target.value;
      target.value = value.substring(0, start) + value.substring(end);
      target.selectionStart = start;
      target.selectionEnd = start;
    }
  }
}

// Helper function to check if a character represents a consonant with hal
function isConsonantWithHal(char) {
  const mappedChar = sinhalaPatternMap[char];
  return mappedChar && mappedChar.endsWith("්");
}

// Helper function to get consonant base (remove hal)
function getConsonantBase(consonantWithHal) {
  if (consonantWithHal && consonantWithHal.endsWith("්")) {
    return consonantWithHal.slice(0, -1);
  }
  return consonantWithHal;
}

// Insert a character at the current position
function insertCharacter(target, char) {
  if (target.contentEditable === "true") {
    // For contenteditable elements
    insertIntoContentEditable(target, char);
  } else {
    // For input and textarea elements
    insertIntoInput(target, char);
  }
}

// Insert text into a contenteditable element
function insertIntoContentEditable(target, text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  // Delete any selected text
  range.deleteContents();

  // Insert the new text
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // Move cursor to the end
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.setStartAfter(textNode);
  newRange.collapse(true);
  selection.addRange(newRange);
}

// Insert text into an input or textarea
function insertIntoInput(target, text) {
  const start = target.selectionStart;
  const end = target.selectionEnd;
  const value = target.value;

  // Replace selected text or insert at cursor
  target.value = value.substring(0, start) + text + value.substring(end);

  // Move cursor to the right position
  const newPosition = start + text.length;
  target.selectionStart = newPosition;
  target.selectionEnd = newPosition;
}

// Main entry point for the Singlish to Sinhala converter package

/**
 * Initialize the Singlish to Sinhala converter
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoAddToggle - Automatically add the toggle button (default: true)
 * @param {string} options.togglePosition - Position of toggle ('bottom-right', 'bottom-left', 'top-right', 'top-left') (default: 'bottom-right')
 * @param {boolean} options.startEnabled - Start with conversion enabled (default: false)
 * @returns {Object} - API object with control methods
 */
export function initSinglishToSinhala(startEnabled = false) {
  // Initialize the input processor
  initializeSinhalaInput(startEnabled);

  // Return API object
  return {
    enable: () => {
      sinhalaInputEnabled = true;
    },
    disable: () => {
      sinhalaInputEnabled = false;
      resetState();
    },
    isEnabled: () => {
      return sinhalaInputEnabled;
    },
  };
}
