const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');
const overlay = document.getElementById('game-over-overlay');
const gameStatusText = document.getElementById('game-status');
const scoreText = document.getElementById('score-text');
const playAgainButton = document.getElementById('play-again');

const gridSize = 20;
let tileCount; // Mover para o escopo global
const targetScore = 100;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameOver = false;
let gameWon = false;
let blinkCounter = 0;

const appleImg = new Image();
appleImg.src = 'asset/images/apple.png';
let appleImgLoaded = false;

appleImg.onload = function () {
  appleImgLoaded = true;
  gameLoop();
};

appleImg.onerror = function() {
  console.error("Erro ao carregar a imagem da maçã");
  appleImgLoaded = false;
  gameLoop();
};

// Funções do jogo
function resizeCanvas() {
  const size = Math.min(window.innerWidth, window.innerHeight) - 40;
  canvas.width = size;
  canvas.height = size;
  tileCount = Math.floor(canvas.width / gridSize);
  drawGame();
}

function drawGame() {
  clearCanvas();
  if (gameOver || gameWon) {
    showEndScreen();
  } else {
    moveSnake();
    drawSnake();
    drawFood();
    checkCollision();
    updateScore();
  }
}

function clearCanvas() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    generateFood();
    blinkCounter = 5; // Iniciar efeito de piscar
  } else {
    snake.pop();
  }

  if (score >= targetScore) {
    gameWon = true; // O jogo foi ganho
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#08f500e5' : '#10500ee5';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

    if (index === 0) {
      ctx.fillStyle = 'white';
      ctx.fillRect(segment.x * gridSize + 3, segment.y * gridSize + 3, 4, 4);
      ctx.fillRect(segment.x * gridSize + 12, segment.y * gridSize + 3, 4, 4);
    }
  });
}

function drawFood() {
  if (blinkCounter > 0) {
    blinkCounter--;
    if (blinkCounter % 2 === 0) return; // Pular desenho para criar efeito de piscar
  }

  if (appleImgLoaded) {
    try {
      ctx.drawImage(appleImg, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    } catch (error) {
      console.error("Erro ao desenhar a imagem da maçã:", error);
      drawFallbackFood();
    }
  } else {
    drawFallbackFood();
  }
}

function drawFallbackFood() {
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
  ctx.fill();
}

function generateFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

function checkCollision() {
  const head = snake[0];

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
  }

  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true;
    }
  }
}

function updateScore() {
  scoreElement.textContent = score;
}

function showEndScreen() {
  overlay.style.display = 'flex'; // Exibe a sobreposição

  if (gameOver) {
    gameStatusText.textContent = 'Game Over!';
    gameStatusText.style.color = '#e94560'; // Cor vermelha para Game Over
  } else if (gameWon) {
    gameStatusText.textContent = 'You Win!';
    gameStatusText.style.color = '#66ff66'; // Cor verde para Vitória
  }

  scoreText.textContent = `Score: ${score}`; // Exibe a pontuação final

  // Adiciona o ouvinte de clique para reiniciar o jogo
  playAgainButton.addEventListener('click', resetGame);
}

function gameLoop() {
  drawGame();
  if (!gameOver && !gameWon) {
    setTimeout(gameLoop, 100);
  }
}

document.addEventListener('keydown', changeDirection);
canvas.addEventListener('click', handleClick);

// Funções de controle
function changeDirection(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  if (gameOver || gameWon) return;

  const keyPressed = event.keyCode;

  const goingUp = dy === -1;
  const goingDown = dy === 1;
  const goingRight = dx === 1;
  const goingLeft = dx === -1;

  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -1;
    dy = 0;
  }

  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -1;
  }

  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 1;
    dy = 0;
  }

  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 1;
  }
}

// Funções de controle touch
document.getElementById('up').addEventListener('click', () => {
  if (dy === 0) {
    dx = 0;
    dy = -1;
  }
});

document.getElementById('down').addEventListener('click', () => {
  if (dy === 0) {
    dx = 0;
    dy = 1;
  }
});

document.getElementById('left').addEventListener('click', () => {
  if (dx === 0) {
    dx = -1;
    dy = 0;
  }
});

document.getElementById('right').addEventListener('click', () => {
  if (dx === 0) {
    dx = 1;
    dy = 0;
  }
});

function handleClick(event) {
  if (gameOver || gameWon) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Verifica se o clique foi no botão "Play Again"
    if (clickX > canvas.width / 2 - 60 && clickX < canvas.width / 2 + 60 &&
        clickY > canvas.height / 2 + 40 && clickY < canvas.height / 2 + 80) {
      resetGame();
    }
  }
}

function resetGame() {
  overlay.style.display = 'none';
  snake = [{ x: 10, y: 10 }];
  food = { x: 15, y: 15 };
  dx = 0;
  dy = 0;
  score = 0;
  gameOver = false;
  gameWon = false;
  gameLoop(); // Inicia o loop do jogo novamente
}

// Inicializa o canvas
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
