// Variables

let board = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
];

let winner = false;
let currentPlayer = "🔴";
let redScore = 0;
let blueScore = 0;
let rollAgain = false;

let newPieceIdx;
let oldPieceIdx;
let squareElsArray;
let spacesToMove;

const squareEls = document.querySelectorAll(".cell");
const turnMessageEl = document.querySelector(".turn-message");
const rollMessageEl = document.querySelector(".roll-message");
const playerRedScore = document.querySelector("#player-red-score");
const playerBlueScore = document.querySelector("#player-blue-score");
const rollBtn = document.querySelector(".roll");
const resetBtn = document.querySelector(".reset");

const dialogEl = document.querySelector("dialog");
const openDialogBtn = document.querySelector("#dialog-btn-open");
const closeDialogBtn = document.querySelector("#dialog-btn-close");

const stick = document.querySelectorAll(".stick");
const numFlatSticks = document.getElementsByClassName("flat");

const stickOne = document.querySelector("#stick-one");
const stickTwo = document.querySelector("#stick-two");
const stickThree = document.querySelector("#stick-three");
const stickFour = document.querySelector("#stick-four");

const playerRed = "🔴";
const playerBlue = "🔵";

const turnMessage = () => `It's ${currentPlayer}'s turn!`;
const winMessage = `${currentPlayer} has won!`;

const normalPath = {
  0: 1,
  1: 2,
  2: 3,
  3: 4,
  4: 5, // Top row
  5: 6,
  6: 7,
  7: 8,
  8: 9,
  9: 10, // Right column
  10: 11,
  11: 12,
  12: 13,
  13: 14,
  14: 15, // Bottom row
  15: 16,
  16: 17,
  17: 18,
  18: 19,
  19: 29, // Left column (>29 means piece is moved off the board and that player gets +1 score)
};

const shortcuts = {
  5: 20, // Top-right corner sends you diagonal-down
  10: 25, // Bottom-right corner sends you diagonal-up
  22: 27, // The center square sends you toward the bottom-left
};

const backwardsPath = {
  0: 19, // From start, go back to the last square
  20: 5, // From the first diagonal square, go back to the corner
  25: 10, // From the second diagonal corner, go back to that corner
};

// FUNCTIONS

const init = () => {
  board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  squareEls.forEach((cell) => (cell.textContent = ""));
  winner = false;
  rollAgain = false;
  currentPlayer = "🔴";
  let redScore = 0;
  let blueScore = 0;
  playerRedScore.textContent = `🔴: ${redScore}`;
  playerBlueScore.textContent = `🔵: ${blueScore}`;
  turnMessageEl.textContent = turnMessage();
  rollMessageEl.textContent = "";
  rollBtn.disabled = false;
  resetBtn.textContent = "Reset";

  removeFlatClass(stickOne);
  removeFlatClass(stickTwo);
  removeFlatClass(stickThree);
  removeFlatClass(stickFour);
};

const handleWin = () => {
  winner = true;
  turnMessageEl.textContent = `${currentPlayer} has scored and won!`;
  rollBtn.disabled = true;
  resetBtn.textContent = "Play again?";
  
  if (currentPlayer === "🔴") {
    redScore++;
    playerRedScore.textContent = `🔴: ${redScore}`;
  } else {
    blueScore++;
    playerBlueScore.textContent = `🔵: ${blueScore}`;
  }
};

const rollSticks = (e) => {
  const randomNum = Math.random();
  if (randomNum < 0.5) {
    // <--- will make sticks flat side up
    e.classList.add("flat");
  } else {
    return; // <--- will default to round side up
  }
};

const removeFlatClass = (e) => {
  e.classList.remove("flat");
};

const getNextIdx = (currentIdx, isStartingTurn) => {
  // check if player piece is on corner or center square at start of turn, can take shortcut
  if (isStartingTurn && shortcuts[currentIdx]) {
    return shortcuts[currentIdx];
  }

  return normalPath[currentIdx];
};

const updateBoard = () => {
  // if (oldPieceIdx.textContent !== "") {
  //   board[oldPieceIdx] = "";
  // }
  // board.forEach((cell, idx) => {
  //   squareEls[idx].textContent = cell;
  // });

  board.forEach((cellValue, idx) => {
    squareEls[idx].textContent = "";
    if (cellValue !== "") {
      squareEls[idx].textContent = cellValue;
    }
  });
};

const updateState = (oldIdx, newIdx) => {
  if (oldIdx !== -1) board[oldIdx] = "";
  board[newIdx] = currentPlayer;         
  updateBoard();                         
};

const placePiece = () => {
  squareElsArray = Array.from(squareEls);
  let currentPos = board.findIndex((val) => val === currentPlayer);
  let newPos = currentPos;

  // if piece is not on board, start at index 0
  if (currentPos === -1) {
    if (spacesToMove === -1) return; // can't move backwards if not on board
    newPos = 0;
    for (let i = 0; i < spacesToMove - 1; i++) {
      newPos = getNextIdx(newPos, false);
    }
    updateState(-1, newPos);
  } else if (spacesToMove === -1) {
    if (backwardsPath[currentPos] !== undefined) {
      newPos = backwardsPath[currentPos];
    } else {
      newPos = currentPos - 1;
    }
    updateState(currentPos, newPos);
  } else {
    for (let i = 0; i < spacesToMove; i++) {
      const isFirstStep = (i === 0);
      newPos = getNextIdx(newPos, isFirstStep);

      if (newPos === undefined || newPos >= 29) {
        handleWin();
        board[currentPos] = "";
        updateBoard();
        return;
      }
    }
    updateState(currentPos, newPos);
  };
};

//If player rolls a yut or mo, player will roll again
const handleRollAgain = () => {
  if (numFlatSticks.length === 0 || numFlatSticks.length === 4) {
    rollAgain = true;
  } else {
    rollAgain = false;
  }
};

const switchPlayerTurn = () => {
  currentPlayer = currentPlayer === "🔴" ? "🔵" : "🔴";
  turnMessageEl.innerText = turnMessage();
};

// EVENT LISTENERS

rollBtn.addEventListener("click", () => {
  //reset the stick for the roll
  removeFlatClass(stickOne);
  removeFlatClass(stickTwo);
  removeFlatClass(stickThree);
  removeFlatClass(stickFour);

  rollSticks(stickOne);
  rollSticks(stickTwo);
  rollSticks(stickThree);
  rollSticks(stickFour);

  // check for yut or mo roll
  handleRollAgain();

  //calcate roll results
  if (numFlatSticks.length === 0) {
    rollMessageEl.textContent = `${currentPlayer} rolled a yut! Move forward 4 spaces and roll again!`;
    spacesToMove = 4;
  } else if (
    numFlatSticks.length === 1 &&
    !stickOne.classList.contains("flat")
  ) {
    rollMessageEl.textContent = `${currentPlayer} rolled a do! Move forward 1 space!`;
    spacesToMove = 1;
  } else if (
    numFlatSticks.length === 1 &&
    stickOne.classList.contains("flat")
  ) {
    rollMessageEl.textContent = `${currentPlayer} rolled a back do! Move backwards 1 space!`;
    spacesToMove = -1;
  } else if (numFlatSticks.length === 2) {
    rollMessageEl.textContent = `${currentPlayer} rolled a ge! Move forward 2 spaces!`;
    spacesToMove = 2;
  } else if (numFlatSticks.length === 3) {
    rollMessageEl.textContent = `${currentPlayer} rolled a geol! Move forward 3 spaces!`;
    spacesToMove = 3;
  } else {
    rollMessageEl.textContent = `${currentPlayer} rolled a mo! Move forward 5 spaces and roll again!`;
    spacesToMove = 5;
  }

  placePiece();
  setTimeout(() => {
    updateBoard();
  }, "1000");

  if (!winner && !rollAgain) {
    switchPlayerTurn();
  } else;
});

resetBtn.addEventListener("click", init);

openDialogBtn.addEventListener("click", () => {
  dialogEl.showModal();
});

closeDialogBtn.addEventListener("click", () => {
  dialogEl.close();
});

init();
