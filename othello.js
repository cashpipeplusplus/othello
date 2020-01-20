const grid = [];
let turn = 'white';
let blackScoreSpan;
let whiteScoreSpan;

function init() {
  const peer = new Peer();
  peer.on('open', () => {
    peer.id;
  });

  blackScoreSpan = setupScore('black');
  whiteScoreSpan = setupScore('white');
  setupBoard();
  takeScore();
}

function createStone() {
  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  svg.setAttributeNS(null, 'viewBox', '0 0 100 100');

  const circle = document.createElementNS(xmlns, 'circle');
  circle.setAttributeNS(null, 'cx', '50');
  circle.setAttributeNS(null, 'cy', '50');
  circle.setAttributeNS(null, 'r', '45');
  svg.appendChild(circle);

  return svg;
}

function setupScore(color) {
  const span = document.createElement('span');
  span.classList.add('score-wrapper');
  const innerSpan = document.createElement('span');
  span.appendChild(innerSpan);

  innerSpan.classList.add('stone');
  innerSpan.classList.add(color);
  innerSpan.appendChild(createStone());

  const scoreSpan = document.createElement('span');
  scoreSpan.classList.add('score-text');
  span.appendChild(scoreSpan);
  window.score.appendChild(span);

  scoreSpan.addEventListener('animationend', () => {
    scoreSpan.classList.remove('animated-text');
  });

  return scoreSpan;
}

function setupBoard() {
  for (let y = 0; y < 8; ++y) {
    const row = [];
    grid.push(row);

    for (let x = 0; x < 8; ++x) {
      const div = document.createElement('div');
      div.classList.add('square');
      div.dataset['x'] = x;
      div.dataset['y'] = y;
      div.addEventListener('click', onClick);
      div.appendChild(createStone());
      window.board.appendChild(div);
      row.push(div);
    }
  }

  grid[3][3].classList.add('white');
  grid[3][4].classList.add('black');
  grid[4][4].classList.add('white');
  grid[4][3].classList.add('black');
}

function takeScore() {
  let blackTotal = 0;
  let whiteTotal = 0;

  for (let y = 0; y < 8; ++y) {
    for (let x = 0; x < 8; ++x) {
      if (grid[y][x].classList.contains('black')) {
        blackTotal += 1;
      }

      if (grid[y][x].classList.contains('white')) {
        whiteTotal += 1;
      }
    }
  }

  blackScoreSpan.textContent = blackTotal;
  blackScoreSpan.classList.remove('animated-text');
  blackScoreSpan.classList.add('animated-text');

  whiteScoreSpan.textContent = whiteTotal;
  whiteScoreSpan.classList.remove('animated-text');
  whiteScoreSpan.classList.add('animated-text');
}

function *scanDirection(x, y, dx, dy, color) {
  x += dx;
  y += dy;

  for (; y >= 0 && y <= 7 && x >= 0 && x <= 7; y += dy, x += dx) {
    yield grid[y][x];
  }
}

function *allDirections() {
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      // Never yield direction [0, 0] (in place)
      if (dx || dy) {
        yield [dx, dy];
      }
    }
  }
}

function isEmpty(div) {
  return !div.classList.contains('black') && !div.classList.contains('white');
}

function isColor(div, color) {
  return div.classList.contains(color);
}

function oppositeColor(color) {
  return color == 'white' ? 'black' : 'white';
}

function isValidInDirection(x, y, dx, dy, color) {
  let first = true;
  for (const div of scanDirection(x, y, dx, dy)) {
    if (first) {
      if (!isColor(div, oppositeColor(color))) {
        return false;
      }

      first = false;
    }

    if (isEmpty(div)) {
      return false;
    }

    if (isColor(div, color)) {
      return true;
    }
  }
  return false;
}

function isValidPlay(x, y, color) {
  if (!isEmpty(grid[y][x])) {
    return false;
  }

  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (isValidInDirection(x, y, dx, dy, color)) {
        return true;
      }
    }
  }

  return false;
}

function playStone(x, y, color) {
  if (!isValidPlay(x, y, color)) {
    console.log('invalid play', x, y, color);
    return false;
  }

  console.log('play', x, y, color);
  grid[y][x].classList.add(color);

  for (const [dx, dy] of allDirections()) {
    if (isValidInDirection(x, y, dx, dy, color)) {
      for (const div of scanDirection(x, y, dx, dy)) {
        if (isEmpty(div) || isColor(div, color)) {
          break;
        }

        div.classList.add('flip');
        div.classList.add(color);
        div.classList.remove(oppositeColor(color));
      }
    }
  }

  return true;
}

function onClick(event) {
  const div = event.currentTarget;
  const {x, y} = div.dataset;
  const ok = playStone(parseInt(x), parseInt(y), turn);
  if (ok) {
    turn = oppositeColor(turn);
    takeScore();
  }
}

document.addEventListener('DOMContentLoaded', init);