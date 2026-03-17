// 字母数据
const LETTERS = [
  {upper:'A',lower:'a',word:'Apple',emoji:'🍎'},{upper:'B',lower:'b',word:'Ball',emoji:'⚽'},
  {upper:'C',lower:'c',word:'Cat',emoji:'🐱'},{upper:'D',lower:'d',word:'Dog',emoji:'🐕'},
  {upper:'E',lower:'e',word:'Egg',emoji:'🥚'},{upper:'F',lower:'f',word:'Fish',emoji:'🐟'},
  {upper:'G',lower:'g',word:'Grape',emoji:'🍇'},{upper:'H',lower:'h',word:'Hat',emoji:'🎩'},
  {upper:'I',lower:'i',word:'Ice',emoji:'🧊'},{upper:'J',lower:'j',word:'Juice',emoji:'🧃'},
  {upper:'K',lower:'k',word:'Kite',emoji:'🪁'},{upper:'L',lower:'l',word:'Lion',emoji:'🦁'},
  {upper:'M',lower:'m',word:'Moon',emoji:'🌙'},{upper:'N',lower:'n',word:'Nose',emoji:'👃'},
  {upper:'O',lower:'o',word:'Orange',emoji:'🍊'},{upper:'P',lower:'p',word:'Pig',emoji:'🐷'},
  {upper:'Q',lower:'q',word:'Queen',emoji:'👸'},{upper:'R',lower:'r',word:'Rabbit',emoji:'🐰'},
  {upper:'S',lower:'s',word:'Sun',emoji:'☀️'},{upper:'T',lower:'t',word:'Tree',emoji:'🌳'},
  {upper:'U',lower:'u',word:'Umbrella',emoji:'☂️'},{upper:'V',lower:'v',word:'Violin',emoji:'🎻'},
  {upper:'W',lower:'w',word:'Water',emoji:'💧'},{upper:'X',lower:'x',word:'Box',emoji:'📦'},
  {upper:'Y',lower:'y',word:'Yellow',emoji:'💛'},{upper:'Z',lower:'z',word:'Zebra',emoji:'🦓'}
];

// 单词家族数据
const FAMILIES = [
  {ending:'at',words:['cat','bat','hat','mat','rat'],emojis:['🐱','🦇','🎩','🟫','🐭']},
  {ending:'an',words:['can','fan','man','pan','van'],emojis:['🥫','🌀','👨','🍳','🚐']},
  {ending:'it',words:['sit','bit','hit','kit','pit'],emojis:['💺','🍪','🎯','🧰','🕳️']},
  {ending:'og',words:['dog','fog','log','hog','jog'],emojis:['🐕','🌫️','🪵','🐗','🏃']},
  {ending:'ug',words:['bug','hug','mug','rug','jug'],emojis:['🐛','🤗','☕','🧶','🏺']}
];

// 语音合成（Web Speech API）
let _ttsTimer = null;

function speakUK(text, rate = 0.8) {
  if (!window.speechSynthesis) return;

  // 清除上一个还未执行的计划，防止快速点击时声音排队
  clearTimeout(_ttsTimer);
  window.speechSynthesis.cancel();

  _ttsTimer = setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate  = rate;
    u.pitch = 1;
    u.volume = 1;
    u.onerror = (e) => console.error('speakUK error:', e.error, '|', text);

    // 在 setTimeout 内部取语音列表，确保取到加载完毕后的结果
    const voices = window.speechSynthesis.getVoices();
    const voice  = voices.find(v => v.lang === 'en-GB')
                || voices.find(v => v.lang === 'en-US')
                || voices.find(v => /^en/i.test(v.lang))
                || voices[0];   // 兜底：用系统第一个可用语音

    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else        { u.lang = 'en-US'; }

    window.speechSynthesis.speak(u);
  }, 150);  // 150ms 让 cancel() 完全生效后再 speak
}

// Tab切换功能
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(targetId).classList.add('active');
  });
});

// 导航链接平滑滚动
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetTab = document.querySelector(`[data-tab="${targetId}"]`);
    if (targetTab) targetTab.click();
  });
});

// 渲染字母认读
function renderLetters() {
  const container = document.getElementById('letters');
  container.innerHTML = '<div class="letter-grid"></div>';
  const grid = container.querySelector('.letter-grid');

  LETTERS.forEach(l => {
    const card = document.createElement('div');
    card.className = 'letter-card';
    card.innerHTML = `
      <div class="letter-upper">${l.upper}</div>
      <div class="letter-lower">${l.lower}</div>
      <div class="letter-emoji">${l.emoji}</div>
      <div class="letter-word">${l.word}</div>
    `;
    card.onclick = () => speakUK(`${l.upper}. ${l.word}`);
    grid.appendChild(card);
  });
}

// 渲染单词家族
function renderFamilies() {
  const container = document.getElementById('families');
  container.innerHTML = '<div class="families-grid"></div>';
  const grid = container.querySelector('.families-grid');

  FAMILIES.forEach(f => {
    const group = document.createElement('div');
    group.className = 'family-group';
    group.innerHTML = `<h3>-${f.ending} 词族</h3><div class="family-words"></div>`;
    const wordsDiv = group.querySelector('.family-words');

    f.words.forEach((w, i) => {
      const wordCard = document.createElement('div');
      wordCard.className = 'word-card';
      wordCard.innerHTML = `<span>${f.emojis[i]}</span><span>${w}</span>`;
      wordCard.onclick = () => speakUK(w);
      wordsDiv.appendChild(wordCard);
    });

    grid.appendChild(group);
  });
}

// 初始化
renderLetters();
renderFamilies();

// ============ 阶段三：音标学习模块 ============

// 单元音数据
const MONOPHTHONGS = [
  {ipa:'iː',name:'长元音 i',mouth:'😁',desc:'嘴角向两边拉开，舌尖抵下齿，发"衣"的长音',tip:'像微笑时说"cheese"',words:['see','tea','eat','bee']},
  {ipa:'ɪ',name:'短元音 i',mouth:'🙂',desc:'嘴角微微向两边拉开，舌头稍低于/iː/',tip:'比/iː/更短更轻，像快速说"it"',words:['sit','bit','hit','big']},
  {ipa:'e',name:'短元音 e',mouth:'😶',desc:'嘴微开，舌前部稍抬，发"诶"的短音',tip:'像说"bed"中的e',words:['bed','red','ten','pen']},
  {ipa:'æ',name:'短元音 ae',mouth:'😮',desc:'嘴张大，嘴角向两侧拉，舌前低位',tip:'张大嘴说"cat"',words:['cat','bag','man','hat']},
  {ipa:'ʌ',name:'短元音 uh',mouth:'😐',desc:'嘴半开，舌后中部稍抬，发"啊"的短音',tip:'放松嘴巴说"cup"',words:['cup','sun','bus','fun']},
  {ipa:'ʊ',name:'短元音 u',mouth:'😗',desc:'嘴唇圆形微凸，舌后部抬起',tip:'嘴巴圆圆的，轻轻说"book"',words:['book','cook','look','foot']},
  {ipa:'ə',name:'中央元音 schwa',mouth:'😌',desc:'嘴巴放松，舌居中，发模糊的"啊"音',tip:'最常见的英语元音，在非重读音节中出现',words:['about','over','butter','teacher']},
  {ipa:'ɒ',name:'短元音 o',mouth:'🔵',desc:'嘴张大，嘴唇圆形，舌后低位',tip:'嘴圆圆的，像惊讶的"oh"',words:['hot','dog','top','box']},
  {ipa:'ɑː',name:'长元音 ah',mouth:'😲',desc:'嘴张大，舌后低位，发"啊"的长音',tip:'张大嘴，像医生让你说"啊"',words:['car','far','star','park']},
  {ipa:'ɔː',name:'长元音 aw',mouth:'⭕',desc:'嘴唇圆形，舌后中部，发"哦"的长音',tip:'嘴唇圆圆的向前凸',words:['door','four','more','walk']},
  {ipa:'uː',name:'长元音 oo',mouth:'😙',desc:'嘴唇圆形向前凸，舌后高位',tip:'嘴巴圆圆的，像吹口哨',words:['food','moon','blue','true']},
  {ipa:'ɜː',name:'长元音 er',mouth:'😐',desc:'嘴微开，舌居中，发"额"的长音',tip:'像说"her"，嘴巴放松',words:['bird','girl','work','turn']}
];

// 双元音数据
const DIPHTHONGS = [
  {ipa:'eɪ',name:'双元音 ay',mouth:'😐→😁',desc:'从"诶"滑向"衣"，嘴型从半开到微笑',tip:'就像汉语"诶"加上"衣"',words:['day','say','play','make']},
  {ipa:'aɪ',name:'双元音 eye',mouth:'😲→😁',desc:'从"啊"滑向"衣"，嘴从大开到微笑',tip:'就像汉语"爱"',words:['my','high','like','time']},
  {ipa:'ɔɪ',name:'双元音 oy',mouth:'⭕→😁',desc:'从"哦"滑向"衣"，嘴从圆形到微笑',tip:'就像汉语"哦衣"',words:['boy','toy','oil','join']},
  {ipa:'aʊ',name:'双元音 ow',mouth:'😲→😗',desc:'从"啊"滑向"哦"，嘴从大开到圆形',tip:'像汉语"啊呜"连读',words:['now','how','out','found']},
  {ipa:'əʊ',name:'双元音 oh',mouth:'😌→😙',desc:'从模糊"啊"滑向"哦"，嘴由松到圆',tip:'英式英语中"go"的发音',words:['go','home','know','boat']},
  {ipa:'ɪə',name:'双元音 ear',mouth:'🙂→😌',desc:'从"衣"滑向中央元音，嘴放松',tip:'就像"here"的发音',words:['here','ear','near','fear']},
  {ipa:'eə',name:'双元音 air',mouth:'😶→😌',desc:'从"诶"滑向中央元音',tip:'就像"there"的发音',words:['there','hair','care','bear']},
  {ipa:'ʊə',name:'双元音 oor',mouth:'😗→😌',desc:'从"哦"滑向中央元音，嘴由圆到松',tip:'就像"tour"的发音',words:['tour','poor','sure','cure']}
];

// 辅音数据
const CONSONANTS = [
  {group:'爆破音',pairs:[
    {voiceless:{ipa:'p',desc:'双唇紧闭后突然打开，无声带振动',words:['pen','cup','top']},voiced:{ipa:'b',desc:'双唇紧闭后突然打开，声带振动',words:['bed','cab','rob']}},
    {voiceless:{ipa:'t',desc:'舌尖抵上齿龈后弹开，无声带振动',words:['tea','cat','bit']},voiced:{ipa:'d',desc:'舌尖抵上齿龈后弹开，声带振动',words:['dog','bad','red']}},
    {voiceless:{ipa:'k',desc:'舌后部抵软腭后弹开，无声带振动',words:['cat','back','key']},voiced:{ipa:'g',desc:'舌后部抵软腭后弹开，声带振动',words:['go','bag','big']}}
  ]},
  {group:'摩擦音',pairs:[
    {voiceless:{ipa:'f',desc:'上齿轻触下唇，气流通过，无声带振动',words:['fish','off','leaf']},voiced:{ipa:'v',desc:'上齿轻触下唇，气流通过，声带振动',words:['van','love','give']}},
    {voiceless:{ipa:'θ',desc:'舌尖置于上下齿之间，气流通过，无声带振动',words:['think','bath','tooth']},voiced:{ipa:'ð',desc:'舌尖置于上下齿之间，气流通过，声带振动',words:['this','that','there']}},
    {voiceless:{ipa:'s',desc:'舌尖接近上齿龈，气流从中间通过',words:['sun','bus','rice']},voiced:{ipa:'z',desc:'舌尖接近上齿龈，气流从中间通过，声带振动',words:['zoo','buzz','rose']}},
    {voiceless:{ipa:'ʃ',desc:'舌尖离开上齿龈，气流较宽，无声带振动',words:['she','fish','wash']},voiced:{ipa:'ʒ',desc:'舌尖离开上齿龈，气流较宽，声带振动',words:['treasure','measure','vision']}},
    {voiceless:{ipa:'h',desc:'声门轻微收缩，气流通过，无声带振动',words:['hat','home','help']},voiced:null}
  ]},
  {group:'破擦音',pairs:[
    {voiceless:{ipa:'tʃ',desc:'舌尖抵上齿龈，然后滑移，无声带振动',words:['chin','chat','watch']},voiced:{ipa:'dʒ',desc:'舌尖抵上齿龈，然后滑移，声带振动',words:['job','edge','judge']}}
  ]},
  {group:'鼻音',singles:[
    {ipa:'m',desc:'双唇紧闭，气流从鼻腔通过',words:['man','moon','come']},
    {ipa:'n',desc:'舌尖抵上齿龈，气流从鼻腔通过',words:['net','sun','on']},
    {ipa:'ŋ',desc:'舌后部抵软腭，气流从鼻腔通过',words:['sing','king','long']}
  ]},
  {group:'边音和半元音',singles:[
    {ipa:'l',desc:'舌尖抵上齿龈，气流从两侧通过',words:['let','ball','fall']},
    {ipa:'r',desc:'舌尖上翘或后缩，气流通过',words:['red','car','try']},
    {ipa:'w',desc:'嘴唇圆形，迅速滑向下一个元音',words:['wet','win','swim']},
    {ipa:'j',desc:'舌前部抬向硬腭，迅速滑向下一个元音',words:['yes','year','you']}
  ]}
];

// 音标详情弹窗
function createPhonemeModal() {
  const modal = document.createElement('dialog');
  modal.id = 'phonemeModal';
  modal.className = 'phoneme-modal';
  modal.innerHTML = `
    <div class="modal-header">
      <span id="modalIpa" class="modal-ipa"></span>
      <span id="modalName" class="modal-name"></span>
      <button class="modal-close" id="modalClose">×</button>
    </div>
    <div class="modal-body">
      <div class="modal-mouth" id="modalMouth"></div>
      <p class="modal-desc" id="modalDesc"></p>
      <p class="modal-tip" id="modalTip"></p>
      <div class="modal-words" id="modalWords"></div>
      <button class="play-ipa-btn" id="playIpa">▶ 播放音标发音</button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#modalClose').onclick = () => modal.close();
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  return modal;
}

const phonemeModal = createPhonemeModal();

function showPhonemeModal(phoneme) {
  document.getElementById('modalIpa').textContent = `/${phoneme.ipa}/`;
  document.getElementById('modalName').textContent = phoneme.name;
  document.getElementById('modalMouth').textContent = phoneme.mouth;
  document.getElementById('modalDesc').textContent = phoneme.desc;
  document.getElementById('modalTip').textContent = `💡 ${phoneme.tip}`;

  const wordsDiv = document.getElementById('modalWords');
  wordsDiv.innerHTML = '<p>示例单词：</p>';
  phoneme.words.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'word-btn';
    btn.textContent = `🔊 ${w}`;
    btn.onclick = () => speakUK(w);
    wordsDiv.appendChild(btn);
  });

  const playBtn = document.getElementById('playIpa');
  playBtn.onclick = () => speakUK(phoneme.words[0], 0.6);

  phonemeModal.showModal();
}

// 渲染单元音
function renderMonophthongs() {
  const container = document.getElementById('monophthongs');
  container.innerHTML = '<h2 class="section-title">单元音（12个）</h2><div class="phoneme-grid"></div>';
  const grid = container.querySelector('.phoneme-grid');

  MONOPHTHONGS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'phoneme-card';
    card.innerHTML = `
      <div class="phoneme-ipa">/${p.ipa}/</div>
      <div class="phoneme-mouth">${p.mouth}</div>
      <div class="phoneme-name">${p.name}</div>
      <div class="phoneme-sample">${p.words[0]}</div>
    `;
    card.onclick = () => showPhonemeModal(p);
    grid.appendChild(card);
  });
}

// 渲染双元音
function renderDiphthongs() {
  const container = document.getElementById('diphthongs');
  container.innerHTML = '<h2 class="section-title">双元音（8个）</h2><div class="phoneme-grid"></div>';
  const grid = container.querySelector('.phoneme-grid');

  DIPHTHONGS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'phoneme-card diphthong-card';
    card.innerHTML = `
      <div class="phoneme-ipa">/${p.ipa}/</div>
      <div class="phoneme-mouth">${p.mouth}</div>
      <div class="phoneme-name">${p.name}</div>
      <div class="phoneme-sample">${p.words[0]}</div>
    `;
    card.onclick = () => showPhonemeModal(p);
    grid.appendChild(card);
  });
}

// 渲染辅音
function renderConsonants() {
  const container = document.getElementById('consonants');
  container.innerHTML = '<h2 class="section-title">辅音（24个）</h2>';

  CONSONANTS.forEach(group => {
    const section = document.createElement('div');
    section.className = 'consonant-section';
    section.innerHTML = `<h3 class="consonant-group-title">${group.group}</h3>`;

    if (group.pairs) {
      const pairsDiv = document.createElement('div');
      pairsDiv.className = 'consonant-pairs';

      group.pairs.forEach(pair => {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'consonant-pair';
        pairDiv.innerHTML = `
          <div class="pair-header">
            <span>清辅音</span>
            <span>浊辅音</span>
          </div>
        `;
        const voicelessCard = buildConsonantCard(pair.voiceless, false);
        const voicedCard = pair.voiced ? buildConsonantCard(pair.voiced, true) : '<div class="consonant-card empty">—</div>';
        pairDiv.appendChild(voicelessCard);
        if (typeof voicedCard === 'string') {
          pairDiv.innerHTML += voicedCard;
        } else {
          pairDiv.appendChild(voicedCard);
        }
        pairsDiv.appendChild(pairDiv);
      });

      section.appendChild(pairsDiv);
    }

    if (group.singles) {
      const singlesDiv = document.createElement('div');
      singlesDiv.className = 'consonant-singles';
      group.singles.forEach(c => {
        singlesDiv.appendChild(buildConsonantCard(c, null));
      });
      section.appendChild(singlesDiv);
    }

    container.appendChild(section);
  });
}

function buildConsonantCard(c, isVoiced) {
  const card = document.createElement('div');
  card.className = `consonant-card ${isVoiced === true ? 'voiced' : isVoiced === false ? 'voiceless' : ''}`;
  card.innerHTML = `
    <div class="cons-ipa">/${c.ipa}/</div>
    <div class="cons-words">${c.words.slice(0, 2).join(' · ')}</div>
    <button class="cons-play">🔊</button>
  `;
  card.querySelector('.cons-play').addEventListener('click', (e) => {
    e.stopPropagation();
    speakUK(c.words[0]);
  });
  return card;
}

// 初始化音标模块
renderMonophthongs();
renderDiphthongs();
renderConsonants();

// ============ 阶段四：测验模块 ============

// 学习数据管理（LocalStorage）
const LearningData = {
  getData() {
    const raw = localStorage.getItem('engLearning');
    return raw ? JSON.parse(raw) : { daily: {}, mistakes: [], lastVisit: null };
  },
  saveData(data) {
    localStorage.setItem('engLearning', JSON.stringify(data));
  },
  recordAnswer(module, question, correct, wrongAnswer) {
    const data = this.getData();
    const today = new Date().toISOString().split('T')[0];
    if (!data.daily[today]) data.daily[today] = { count: 0, correct: 0 };
    data.daily[today].count++;
    if (correct) data.daily[today].correct++;
    else {
      const existing = data.mistakes.find(m => m.module === module && m.question === question);
      if (existing) {
        existing.count++;
        existing.lastDate = today;
        existing.wrongAnswer = wrongAnswer;
      } else {
        data.mistakes.push({ module, question, wrongAnswer, count: 1, firstDate: today, lastDate: today });
      }
    }
    this.saveData(data);
  }
};

// 听音选词测验
const QUIZ_WORDS = [
  ...LETTERS.map(l => ({ word: l.word, display: `${l.upper}${l.lower} - ${l.word}` })),
  ...FAMILIES.flatMap(f => f.words.map(w => ({ word: w, display: w })))
];

let quizState = { questions: [], index: 0, score: 0, answered: false };

function initQuiz() {
  const shuffled = [...QUIZ_WORDS].sort(() => Math.random() - 0.5).slice(0, 10);
  quizState = { questions: shuffled, index: 0, score: 0, answered: false };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz');
  const q = quizState.questions[quizState.index];
  if (!q) return showQuizResult();

  // 生成3个选项
  const others = QUIZ_WORDS.filter(w => w.word !== q.word).sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [q, ...others].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="quiz-box">
      <div class="quiz-progress">第 ${quizState.index + 1} / 10 题　得分：${quizState.score}</div>
      <button class="quiz-play-btn" id="quizPlayBtn">▶ 播放单词</button>
      <div class="quiz-options" id="quizOptions">
        ${options.map(o => `<button class="quiz-option" data-word="${o.word}">${o.display}</button>`).join('')}
      </div>
    </div>
  `;

  container.querySelector('#quizPlayBtn').onclick = () => speakUK(q.word);
  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.onclick = () => {
      if (quizState.answered) return;
      quizState.answered = true;
      const isCorrect = btn.dataset.word === q.word;
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        container.querySelector(`[data-word="${q.word}"]`).classList.add('correct');
      }
      if (isCorrect) {
        quizState.score++;
        showConfetti();
      }
      LearningData.recordAnswer('quiz', q.word, isCorrect, btn.dataset.word);
      setTimeout(() => {
        quizState.index++;
        quizState.answered = false;
        renderQuizQuestion();
      }, 1200);
    };
  });
}

function showQuizResult() {
  const container = document.getElementById('quiz');
  const score = quizState.score;
  const msg = score >= 9 ? '🏆 太棒了！满分！' : score >= 7 ? '🌟 非常好！' : score >= 5 ? '👍 继续加油！' : '💪 再练一次吧！';
  container.innerHTML = `
    <div class="quiz-result">
      <div class="result-score">${score} / 10</div>
      <div class="result-msg">${msg}</div>
      <button class="retry-btn">🔄 再来一次</button>
    </div>
  `;
  container.querySelector('.retry-btn').onclick = initQuiz;
}

function renderQuiz() {
  const container = document.getElementById('quiz');
  container.innerHTML = `
    <div class="quiz-start">
      <h2>🎮 听音选词</h2>
      <p>播放单词发音，从3个选项中找出正确的单词</p>
      <button class="start-btn">开始测验</button>
    </div>
  `;
  container.querySelector('.start-btn').onclick = initQuiz;
}

// 音标听辨挑战
const PHONICS_POOL = [...MONOPHTHONGS, ...DIPHTHONGS];
let phonicsState = { questions: [], index: 0, score: 0, answered: false };

function initPhonicsQuiz() {
  const shuffled = [...PHONICS_POOL].sort(() => Math.random() - 0.5).slice(0, 10);
  phonicsState = { questions: shuffled, index: 0, score: 0, answered: false };
  renderPhonicsQuestion();
}

function renderPhonicsQuestion() {
  const container = document.getElementById('phonics-quiz');
  const q = phonicsState.questions[phonicsState.index];
  if (!q) return showPhonicsResult();

  const others = PHONICS_POOL.filter(p => p.ipa !== q.ipa).sort(() => Math.random() - 0.5).slice(0, 2);
  const options = [q, ...others].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="quiz-box">
      <div class="quiz-progress">第 ${phonicsState.index + 1} / 10 题　得分：${phonicsState.score}</div>
      <p class="phonics-hint">听单词，选出正确的音标</p>
      <button class="quiz-play-btn" id="phonicsPlayBtn">▶ 播放发音</button>
      <div class="quiz-options phonics-options" id="phonicsOptions">
        ${options.map(o => `<button class="quiz-option phonics-opt" data-ipa="${o.ipa}">/${o.ipa}/</button>`).join('')}
      </div>
    </div>
  `;

  container.querySelector('#phonicsPlayBtn').onclick = () => speakUK(q.words[0]);
  container.querySelectorAll('.phonics-opt').forEach(btn => {
    btn.onclick = () => {
      if (phonicsState.answered) return;
      phonicsState.answered = true;
      const isCorrect = btn.dataset.ipa === q.ipa;
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) {
        container.querySelector(`[data-ipa="${q.ipa}"]`).classList.add('correct');
      }
      if (isCorrect) {
        phonicsState.score++;
        showConfetti();
      }
      LearningData.recordAnswer('phonics', `/${q.ipa}/`, isCorrect, btn.dataset.ipa);
      setTimeout(() => {
        phonicsState.index++;
        phonicsState.answered = false;
        renderPhonicsQuestion();
      }, 1200);
    };
  });
}

function showPhonicsResult() {
  const container = document.getElementById('phonics-quiz');
  const score = phonicsState.score;
  const msg = score >= 9 ? '🏆 太棒了！' : score >= 7 ? '🌟 非常好！' : score >= 5 ? '👍 继续加油！' : '💪 再练一次吧！';
  container.innerHTML = `
    <div class="quiz-result">
      <div class="result-score">${score} / 10</div>
      <div class="result-msg">${msg}</div>
      <button class="retry-btn">🔄 再来一次</button>
    </div>
  `;
  container.querySelector('.retry-btn').onclick = initPhonicsQuiz;
}

function renderPhonicsQuiz() {
  const container = document.getElementById('phonics-quiz');
  container.innerHTML = `
    <div class="quiz-start">
      <h2>🎯 听辨挑战</h2>
      <p>播放单词发音，从3个音标中找出正确的音标</p>
      <button class="start-btn">开始挑战</button>
    </div>
  `;
  container.querySelector('.start-btn').onclick = initPhonicsQuiz;
}

// 撒花特效
function showConfetti() {
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.className = 'confetti-star';
    star.textContent = ['⭐','🌟','✨','🎉','🎊'][Math.floor(Math.random() * 5)];
    star.style.cssText = `
      position: fixed;
      left: ${20 + Math.random() * 60}%;
      top: -40px;
      font-size: ${16 + Math.random() * 20}px;
      animation: confettiFall ${1 + Math.random()}s ease-in forwards;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 2000);
  }
}

// 初始化测验模块
renderQuiz();
renderPhonicsQuiz();

// ============ 阶段六：学习热力图 ============

function renderHeatmap() {
  const container = document.getElementById('heatmap');
  const data = LearningData.getData();
  const today = new Date();

  // 统计数据
  const total = Object.values(data.daily).reduce((s, d) => s + d.count, 0);
  const totalDays = Object.keys(data.daily).length;
  const streak = calcStreak(data.daily);
  const weakModules = getWeakModules(data.mistakes);

  container.innerHTML = `
    <h2 class="section-title">📊 学习热力图</h2>
    <div class="heatmap-stats">
      <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">总练习次数</div></div>
      <div class="stat-card"><div class="stat-num">${totalDays}</div><div class="stat-label">累计学习天数</div></div>
      <div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-label">连续学习天数</div></div>
    </div>
    <div class="heatmap-container">
      <div class="heatmap-labels">
        <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
      </div>
      <div class="heatmap-grid" id="heatmapGrid"></div>
    </div>
    <div class="heatmap-legend">
      <span>少</span>
      <div class="legend-cell level-0"></div>
      <div class="legend-cell level-1"></div>
      <div class="legend-cell level-2"></div>
      <div class="legend-cell level-3"></div>
      <span>多</span>
    </div>
    ${weakModules.length ? `<div class="weak-modules"><h3>⚠️ 薄弱模块</h3><ul>${weakModules.map(m => `<li>${m}</li>`).join('')}</ul></div>` : ''}
  `;

  const grid = container.querySelector('#heatmapGrid');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayData = data.daily[dateStr] || { count: 0 };
    const cell = document.createElement('div');
    cell.className = 'heat-cell';
    const lvl = dayData.count === 0 ? 0 : dayData.count <= 3 ? 1 : dayData.count <= 6 ? 2 : 3;
    cell.classList.add(`level-${lvl}`);
    cell.title = `${dateStr}：${dayData.count} 次练习`;
    grid.appendChild(cell);
  }
}

function calcStreak(daily) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    if (daily[ds] && daily[ds].count > 0) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getWeakModules(mistakes) {
  const moduleCount = {};
  mistakes.forEach(m => { moduleCount[m.module] = (moduleCount[m.module] || 0) + m.count; });
  return Object.entries(moduleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mod, cnt]) => `${mod === 'quiz' ? '听音选词' : '音标听辨'} (${cnt} 次错误)`);
}

// ============ 阶段七：错题本和智能复习 ============

function renderMistakes() {
  const container = document.getElementById('mistakes');
  const data = LearningData.getData();
  const mistakes = data.mistakes;

  container.innerHTML = `<h2 class="section-title">📝 错题本</h2>`;

  if (!mistakes.length) {
    container.innerHTML += `<div class="empty-state">🎉 暂无错题，继续保持！</div>`;
    return;
  }

  const quizMistakes = mistakes.filter(m => m.module === 'quiz');
  const phonicsMistakes = mistakes.filter(m => m.module === 'phonics');

  if (quizMistakes.length) {
    const section = document.createElement('div');
    section.className = 'mistake-section';
    section.innerHTML = `<h3>🎮 听音选词（${quizMistakes.length} 道）</h3>`;
    quizMistakes.sort((a, b) => b.count - a.count).forEach(m => {
      section.appendChild(buildMistakeCard(m));
    });
    container.appendChild(section);
  }

  if (phonicsMistakes.length) {
    const section = document.createElement('div');
    section.className = 'mistake-section';
    section.innerHTML = `<h3>🎯 音标听辨（${phonicsMistakes.length} 道）</h3>`;
    phonicsMistakes.sort((a, b) => b.count - a.count).forEach(m => {
      section.appendChild(buildMistakeCard(m));
    });
    container.appendChild(section);
  }

  const clearBtn = document.createElement('button');
  clearBtn.className = 'clear-btn';
  clearBtn.textContent = '🗑️ 清空错题本';
  clearBtn.onclick = () => {
    if (confirm('确认清空所有错题？')) {
      const d = LearningData.getData();
      d.mistakes = [];
      LearningData.saveData(d);
      renderMistakes();
      renderReview();
    }
  };
  container.appendChild(clearBtn);
}

function buildMistakeCard(m) {
  const card = document.createElement('div');
  card.className = 'mistake-card';
  card.innerHTML = `
    <div class="mistake-info">
      <span class="mistake-q">${m.question}</span>
      <span class="mistake-count">错误 ${m.count} 次</span>
      <span class="mistake-date">${m.lastDate}</span>
    </div>
    <button class="mistake-play">🔊</button>
    <button class="mistake-del">✕</button>
  `;
  card.querySelector('.mistake-play').addEventListener('click', () => speakUK(m.question.replace(/\//g, '')));
  card.querySelector('.mistake-del').addEventListener('click', () => deleteMistake(m.module, m.question));
  return card;
}

function deleteMistake(module, question) {
  const data = LearningData.getData();
  data.mistakes = data.mistakes.filter(m => !(m.module === module && m.question === question));
  LearningData.saveData(data);
  renderMistakes();
  renderReview();
}

function renderReview() {
  const container = document.getElementById('review');
  const data = LearningData.getData();
  const today = new Date();
  const recommendations = [];

  data.mistakes.forEach(m => {
    const daysSince = Math.floor((today - new Date(m.lastDate)) / 86400000);
    const priority = m.count * 2 + daysSince;
    recommendations.push({ ...m, daysSince, priority });
  });

  recommendations.sort((a, b) => b.priority - a.priority);
  const high = recommendations.slice(0, 2);
  const mid = recommendations.slice(2, 4);
  const low = recommendations.slice(4, 6);

  container.innerHTML = `<h2 class="section-title">💡 智能复习</h2>`;

  if (!recommendations.length) {
    container.innerHTML += `<div class="empty-state">🌟 暂无复习推荐，完成测验后会自动生成！</div>`;
    return;
  }

  const tasksDiv = document.createElement('div');
  tasksDiv.className = 'review-tasks';

  const desc = document.createElement('p');
  desc.className = 'review-desc';
  desc.textContent = '根据您的学习记录，以下内容需要重点复习：';
  tasksDiv.appendChild(desc);

  const buildGroup = (title, color, items) => {
    if (!items.length) return;
    const group = document.createElement('div');
    group.className = 'review-group';

    const h3 = document.createElement('h3');
    h3.className = 'review-group-title';
    h3.style.color = color;
    h3.textContent = title;
    group.appendChild(h3);

    items.forEach(r => {
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <span class="review-q">${r.question}</span>
        <span class="review-reason">${r.module === 'quiz' ? '听音选词' : '音标听辨'} · 错误${r.count}次 · ${r.daysSince}天前</span>
        <button class="review-play">🔊</button>
      `;
      item.querySelector('.review-play').onclick = () => speakUK(r.question.replace(/\//g, ''));
      group.appendChild(item);
    });

    tasksDiv.appendChild(group);
  };

  buildGroup('🔴 高优先级', '#FF6584', high);
  buildGroup('🟡 中优先级', '#FFB300', mid);
  buildGroup('🟢 低优先级', '#4CAF50', low);

  const startBtn = document.createElement('button');
  startBtn.className = 'start-btn';
  startBtn.style.marginTop = '24px';
  startBtn.textContent = '开始复习测验';
  startBtn.onclick = startReviewQuiz;
  tasksDiv.appendChild(startBtn);

  container.appendChild(tasksDiv);
}

function startReviewQuiz() {
  const data = LearningData.getData();
  const mistakes = data.mistakes;
  if (!mistakes.length) { alert('暂无错题可复习！'); return; }

  // 切换到quiz标签并运行错题练习
  const quizMistakes = mistakes.filter(m => m.module === 'quiz');
  const quizTab = document.querySelector('[data-tab="quiz"]');
  quizTab.click();

  if (quizMistakes.length) {
    const reviewWords = quizMistakes.map(m => ({
      word: m.question,
      display: m.question
    }));
    quizState = { questions: reviewWords.slice(0, 10), index: 0, score: 0, answered: false };
    renderQuizQuestion();
  }
}

// 初始化数据分析模块
renderHeatmap();
renderMistakes();
renderReview();
