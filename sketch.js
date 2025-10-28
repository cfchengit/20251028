// 測驗題庫
let quizTable;
// 所有題目
let allQuestions = [];
// 本次測驗的5個題目
let quizQuestions = [];
// 按鈕
let optionButtons = [];
let restartButton;

// 測驗狀態
let gameState = 'start'; // 'start', 'quiz', 'result'
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// 互動效果的粒子
let particles = [];

// 預先載入資源
function preload() {
  // 載入CSV題庫，並指定包含標頭
  quizTable = loadTable('quiz.csv', 'csv', 'header', 'quotes');
}

function setup() {
  createCanvas(windowWidth * 0.8, windowHeight * 0.9);
  textFont('Noto Sans TC');
  textAlign(CENTER, CENTER);

  // 從表格中讀取所有題目
  for (let r = 0; r < quizTable.getRowCount(); r++) {
    allQuestions.push(quizTable.getRow(r));
  }

  // 顯示開始畫面
  showStartScreen();
}

function draw() {
  // 根據遊戲狀態顯示不同畫面
  switch (gameState) {
    case 'start':
      drawStartScreen();
      break;
    case 'quiz':
      drawQuizScreen();
      break;
    case 'result':
      drawResultScreen();
      break;
  }
}

// 顯示開始畫面
function showStartScreen() {
  // 建立開始按鈕
  restartButton = createButton('開始測驗');
  restartButton.position(width / 2 - restartButton.width / 2, height / 2 + 50);
  restartButton.mousePressed(startQuiz);
}

// 繪製開始畫面
function drawStartScreen() {
  background(230, 240, 255);
  textSize(32);
  fill(0);
  text('p5.js 選擇題測驗', width / 2, height / 2 - 40);
  textSize(18);
  text('準備好挑戰了嗎？', width / 2, height / 2);
}

// 開始測驗
function startQuiz() {
  // 隱藏開始按鈕
  restartButton.hide();
  // 重置測驗
  resetQuiz();
  // 隨機選題
  selectQuestions();
  // 顯示第一題
  displayQuestion();
  // 進入測驗狀態
  gameState = 'quiz';
}

// 重置測驗狀態
function resetQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  quizQuestions = [];
  particles = [];
}

// 隨機選取5題
function selectQuestions() {
  let shuffled = allQuestions.slice(); // 複製陣列
  // 洗牌演算法
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  quizQuestions = shuffled.slice(0, 5);
}

// 繪製測驗畫面
function drawQuizScreen() {
  background('#dda15e');
  // 繪製問題
  let q = quizQuestions[currentQuestionIndex];
  if (q) {
    // 題號
    textSize(20);
    fill(50);
    text(`第 ${currentQuestionIndex + 1} / ${quizQuestions.length} 題`, width / 2, 50);

    // 題目
    textSize(28); // 題目文字大小調整為 28px
    fill('#283618'); // 題目文字顏色調整為 #283618
    text(q.getString('題目'), width * 0.1, 120, width * 0.8, 100);
  }
}

// 顯示問題與選項按鈕
function displayQuestion() {
  // 清除舊的按鈕 (保持不變)
  optionButtons.forEach(btn => btn.remove()); 
  optionButtons = []; 

  if (currentQuestionIndex < quizQuestions.length) {
    let q = quizQuestions[currentQuestionIndex];
    let options = ['A', 'B', 'C', 'D'];
    
    for (let i = 0; i < options.length; i++) {
      let optionKey = `選項${options[i]}`;
      let optionText = `${options[i]}. ${q.getString(optionKey)}`; // 按鈕文字由 CSS 調整樣式
      let btn = createButton(optionText);
      btn.position(width / 2 - 150, 160 + i * 60); // 調整選項按鈕起始位置，與題目保持距離
      btn.size(300, 50);
      btn.mousePressed(() => checkAnswer(options[i]));
      optionButtons.push(btn);
    }
  } else {
    // 測驗結束
    showResultScreen();
  }
}

// 檢查答案
function checkAnswer(selectedOption) {
  let q = quizQuestions[currentQuestionIndex];
  let correct = q.getString('正確答案') === selectedOption;

  userAnswers.push({
    question: q.getString('題目'),
    selected: selectedOption,
    correctAnswer: q.getString('正確答案'),
    isCorrect: correct
  });

  if (correct) {
    score++;
    // 答對的視覺回饋
    createParticles(100, color(0, 255, 0));
  } else {
    // 答錯的視覺回饋
    createParticles(50, color(255, 0, 0));
  }

  // 下一題
  currentQuestionIndex++;
  displayQuestion();
}

// 顯示結果畫面
function showResultScreen() {
  gameState = 'result';
  // 建立重新開始按鈕
  restartButton = createButton('再測一次');
  restartButton.position(width / 2 - restartButton.width / 2, height - 80);
  restartButton.mousePressed(startQuiz);
}

// 繪製結果畫面
function drawResultScreen() {
  background(255, 245, 230);
  
  // 繪製與更新粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isFinished()) {
      particles.splice(i, 1);
    }
  }

  // 顯示分數
  textSize(48);
  fill(0);
  text(`你的成績: ${score} / ${quizQuestions.length}`, width / 2, 100); // 分數文字顏色調整為 #283618

  // 顯示回饋用語
  textSize(24);
  let feedback = getFeedback();
  text(feedback, width / 2, 180); // 回饋用語文字顏色調整為 #283618

  // 顯示答案回顧
  textAlign(LEFT, TOP);
  textSize(16);
  let yPos = 250;
  userAnswers.forEach((ans, index) => {
    if (ans.isCorrect) {
      fill(0, 150, 0);
    } else {
      fill(200, 0, 0);
    }
    text(
      `${index + 1}. ${ans.question}\n   你的答案: ${ans.selected}, 正確答案: ${ans.correctAnswer}`,
      width * 0.1, yPos, width * 0.8
    );
    yPos += 60;
  });
  textAlign(CENTER, CENTER);
}

// 根據分數取得回饋用語
function getFeedback() {
  let percentage = score / quizQuestions.length;
  if (percentage === 1) {
    return "太棒了，全部答對！你是p5.js大師！";
  } else if (percentage >= 0.8) {
    return "表現優異，非常接近完美！";
  } else if (percentage >= 0.6) {
    return "不錯喔，繼續努力！";
  } else if (percentage >= 0.4) {
    return "還有進步空間，再接再厲！";
  } else {
    return "別灰心，多練習幾次就會更好！";
  }
}

// 建立粒子效果
function createParticles(count, col) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(width / 2, height / 2, col));
  }
}

// 粒子類別
class Particle {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(2, 7));
    this.acc = createVector(0, 0.1); // 重力
    this.lifespan = 255;
    this.col = col;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 3;
  }

  show() {
    noStroke();
    fill(this.col.levels[0], this.col.levels[1], this.col.levels[2], this.lifespan);
    ellipse(this.pos.x, this.pos.y, 8, 8);
  }

  isFinished() {
    return this.lifespan < 0;
  }
}
