// Select DOM elements
const startScreen = document.querySelector('.start');
const startCards = document.querySelectorAll('.start .card'); 
const startButton = document.querySelector('#start-b'); 
const playground = document.querySelector('.playground');
const restartButton = document.querySelector('.fa-repeat');
const backButton = document.querySelector('.fa-left-long');
const gameTitle = document.querySelector('h1');

const clearStorageButton = document.querySelector(".fa-eraser");


const flipSound = document.getElementById("flipSound");
const matchSound = document.getElementById("matchSound");
const unMatchSound = document.getElementById("unMatchSound");
const winSound = document.getElementById("winSound");
const volumeHighIcon = document.querySelector(".fa-volume-high");
const volumeMuteIcon = document.querySelector(".fa-volume-xmark");


// Game state variables
let gridSize=0,
    level=0,
    matched = 0,
    moveCount = 0,
    time = 0,
    timer,
    firstSelectedCard = null,
    secondSelectedCard = null,
    boardLocked = false;

// Select game difficulty
startCards.forEach(function(card) {
    card.addEventListener("click", selectDifficulty);
});
function selectDifficulty(event) {
    // Remove "active" class from all cards
    startCards.forEach(function(el) {el.classList.remove("active")});

    event.target.parentElement.classList.add("active");
    
    gridSize = Number(event.target.parentElement.getAttribute("grid"));
    level = Number(event.target.parentElement.getAttribute("level"));
}


// Start the game
startButton.addEventListener("click",startGame) 
function startGame() {
    if (gridSize === 0 || level === 0) {
        alert("Please select a difficulty level before starting the game!");
        return;
    }
    setupGameBoard();
    startTimer();
    setTimeout( enableCardClicks, 500);
    createCards();
}

// Setup the game board
function setupGameBoard() {
    startScreen.style.display = "none";
    playground.style.display = "grid";

    let cardSize;
    if (level === 8) {
        cardSize = "100px"; 
    } else if (level === 18) {
        cardSize = "80px"; 
    } else {
        cardSize = "60px";
    }

    playground.style.setProperty("--card-size", cardSize);
    playground.style.gridTemplateColumns = `repeat(${gridSize}, ${cardSize})`;
    playground.style.gridTemplateRows = `repeat(${gridSize}, ${cardSize})`;
}


// Create and shuffle cards
function createCards() {
    const cardArray = [
        "spotify", "soundcloud", "pinterest", "playstation", "xbox",
        "apple", "github", "google", "android", "windows",
        "ubuntu", "whatsapp", "instagram", "facebook", "telegram",
        "x-twitter", "linkedin", "youtube", "discord", "tiktok",
        "stack-overflow", "paypal", "internet-explorer", "google-play",
        "cc-visa", "skype", "twitch", "yahoo", "threads",
        "js", "html5", "css3"
    ];
    // Select the required number of cards and duplicate them
    let cardPairs = [...cardArray.slice(0, level), ...cardArray.slice(0, level)];
    // Shuffle the duplicated cards
    shuffleArray(cardPairs);
    // Pass shuffled cards to the shuffleCards function
    shuffleCards(cardPairs);
}

// Shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        let randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap the current element with the random element
        let temp = array[i]; 
        array[i] = array[randomIndex]; 
        array[randomIndex] = temp; 
    }

}


// Generate shuffled cards on the board
function shuffleCards(cards) {
    playground.innerHTML = "";        
    cards.forEach(function(icon) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div class="front"><i class="fa-solid fa-question"></i></div>
            <div class="back"><i class="fa-brands fa-${icon}"></i></div>
        `;
        playground.appendChild(card);
    });

    restartButton.style.display = "inline-block";
    backButton.style.display = "inline-block";
}


// Start the timer
function startTimer() {
    clearInterval(timer);
    time = 0;
    moveCount = 0;
    updateHeader();
    timer = setInterval(function(){
        time++;
        updateHeader();
    }, 1000);
}

// Update game header with time and moveCount

// Format time as mm:ss
function formatTime(seconds) {
    // Get the number of minutes
    let minutes = Math.floor(seconds / 60); 
    let secs = seconds % 60; 

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (secs < 10) {
        secs = "0" + secs;
    }
    return minutes + ":" + secs;
}

// Update game header with time and move count
function updateHeader() {
    gameTitle.innerHTML = `
        Time : ${formatTime(time)} [ Top: ${getBestScore("time")} ] &nbsp;&nbsp;||&nbsp;&nbsp; 
        Moves : ${moveCount} [ TOP: ${getBestScore("moves")} ]
    `;
}



// Flip a card
function flipCard(card) {
    if ( boardLocked || card === firstSelectedCard || card.classList.contains("flip")) return;
    card.classList.add("flip");
    playSound(flipSound); //Play flip sound


    if (!firstSelectedCard) {
        firstSelectedCard = card;
        return;
    }
    secondSelectedCard = card;

    moveCount++;

    updateHeader();
    checkMatch();
}

// Check if two cards match
function checkMatch() {
    // Check if the two flipped cards
    if ( firstSelectedCard.innerHTML === secondSelectedCard.innerHTML) {
        // If they match, keep them flipped
        lockMatchedCards();
    } else {
        unflipCards();
    }
}

// Disable matched cards
function lockMatchedCards() {
    // Remove the click event listener from both matched cards
    firstSelectedCard.removeEventListener("click", flipCard);
    secondSelectedCard.removeEventListener("click", flipCard);
    // Increment the count of matched cards
    playSound(matchSound); //Play match sound
    matched += 2;
    // Reset variables for the next turn
    resetBoard();
    saveBestScore(time, moveCount);


    // Check if all cards are matched
    if (matched === level * 2) {
        clearInterval(timer);
        playSound(winSound); //Play win sound

    // Show win screen
    document.querySelector(".win-message").innerHTML = 
        `<h2>🎉 You Win! 🎉</h2>
        <p>Your Time: ${formatTime(time)}</p>
        <p>Your Moves: ${moveCount}</p>`;

        
        document.querySelector(".win-screen").style.display = "block";
    }

}

// Unflip unmatched cards
function unflipCards() {
    boardLocked = true;
    playSound(unMatchSound); // Play un-match sound

    setTimeout(() => {
        firstSelectedCard.classList.remove("flip");
        secondSelectedCard.classList.remove("flip");
        resetBoard();
    }, 1000);
}

// Reset board variables
function resetBoard() {
    [firstSelectedCard, secondSelectedCard,  boardLocked] = [null, null, false];
}

// Add event listeners to cards
function  enableCardClicks() {
    // Get all cards inside the game area
    let cards = document.querySelectorAll(".playground .card");

    // Loop through each card and add a click event
    cards.forEach(function(card) {
        card.addEventListener("click", function() {
            flipCard(card); 
        });
    });
}


// restartGame game
var restartGame = function() {
    document.querySelector(".win-screen").style.display = "none";
    startScreen.style.display = "grid";
    playground.style.display = "none";
    restartButton.style.display = "none";
    backButton.style.display = "none";
    
    // Reset all game variables
    matched = moveCount = time = 0;
    clearInterval(timer);
    gameTitle.textContent = "Memory Card Game";

    // Reset all cards (remove 'flip' class)
    document.querySelectorAll(".playground .card").forEach(card => {
        card.classList.remove("flip");
    });

    // Reset board state
    resetBoard();
};

// Update restart button event listener
restartButton.addEventListener("click", function(){
    restartGame();
    startGame();
});

restartButton.addEventListener("click", function(){
    restartGame();
    startGame();
});
backButton.addEventListener("click", restartGame);
document.querySelector(".restart-btn").addEventListener("click", restartGame)



function saveBestScore(currentTime, currentMoves) {
    if (matched !== level * 2) return; // score saved only when player wins

    let bestTimeKey = `bestTime_${level}`;
    let bestMovesKey = `bestMoves_${level}`;

    let bestTime = localStorage.getItem(bestTimeKey);
    let bestMoves = localStorage.getItem(bestMovesKey);

    bestTime = bestTime ? Number(bestTime) : Infinity;
    bestMoves = bestMoves ? Number(bestMoves) : Infinity;

    if (currentTime < bestTime) {
        localStorage.setItem(bestTimeKey, currentTime);
    }
    if (currentMoves < bestMoves) {
        localStorage.setItem(bestMovesKey, currentMoves);
    }
}

function getBestScore(type) {
    let key = `best${type.charAt(0).toUpperCase() + type.slice(1)}_${level}`;
    let value = localStorage.getItem(key);
    if (!value) return ""; 
    return type === "time" ? formatTime(Number(value)) : value;}


// Get mute state from localStorage
let isMuted = localStorage.getItem("isMuted") === "true";

// Function to play sound only if not muted
function playSound(sound) {
    if (!isMuted) {
        sound.currentTime = 0; // Reset audio to start
        sound.play();
    }
}

// Toggle mute/unmute
function toggleMute() {
    isMuted = !isMuted; // Switch state
    localStorage.setItem("isMuted", isMuted); // Save preference

    if (isMuted) {
        volumeHighIcon.style.display = "none";
        volumeMuteIcon.style.display = "inline-block";

    } else {
        volumeHighIcon.style.display = "inline-block";
        volumeMuteIcon.style.display = "none";
    }
}

// Apply saved mute state on page load
if (isMuted) {
    volumeHighIcon.style.display = "none";
    volumeMuteIcon.style.display = "inline-block";
} else {
    volumeHighIcon.style.display = "inline-block";
    volumeMuteIcon.style.display = "none";
}

// Add event listeners for mute toggle
volumeHighIcon.addEventListener("click", toggleMute);
volumeMuteIcon.addEventListener("click", toggleMute);


clearStorageButton.addEventListener("click", function(){localStorage.clear(); });