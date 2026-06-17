/* ==================================================
   DOM REFERENCES
================================================== */

const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");
const gameArea = document.getElementById("gameArea");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const gameOverScreen = document.getElementById("gameOverScreen");

const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const timerText = document.getElementById("timer");

const finalScore = document.getElementById("finalScore");

const crosshair = document.getElementById("crosshair");


/* ==================================================
   GAME VARIABLES

   DESIGN COMMENT

   The game uses only a small number of
   variables to improve readability and
   maintainability.

   Simplicity was prioritised because the
   project focuses on interaction design
   rather than complex game systems.
================================================== */

let score = 0;

let combo = 0;

let gameRunning = false;

let gameTime = 60;

let spawnLoop;
let timerLoop;


/* ==================================================
   CROSSHAIR FOLLOW

   DESIGN COMMENT

   A custom crosshair was used instead of
   the default mouse cursor to strengthen
   the fantasy of controlling an anti-aircraft
   targeting system.
================================================== */

document.addEventListener("mousemove", (event) => {

    crosshair.style.left = event.clientX + "px";
    crosshair.style.top = event.clientY + "px";

});


/* ==================================================
   START GAME
================================================== */

startBtn.addEventListener("click", () => {

    startScreen.style.display = "none";

    gameContainer.style.display = "block";

    startGame();

});


/* ==================================================
   START FUNCTION
================================================== */

function startGame() {

    score = 0;
    combo = 0;

    gameTime = 60;

    scoreText.textContent = score;
    comboText.textContent = combo;
    timerText.textContent = gameTime;

    gameRunning = true;

    spawnLoop = setInterval(spawnAircraft, 1800);

    timerLoop = setInterval(updateTimer, 1000);

}


/* ==================================================
   TIMER SYSTEM

   DESIGN COMMENT

   A fixed 60-second session was selected
   because it provides a complete gameplay
   loop while remaining suitable for casual
   play and classroom demonstrations.
================================================== */

function updateTimer() {

    gameTime--;

    timerText.textContent = gameTime;

    if(gameTime <= 0){

        endGame();

    }

}


/* ==================================================
   SPAWN SYSTEM

   DESIGN COMMENT

   Aircraft are randomly selected to create
   variety and uncertainty.

   Probabilities:

   Fighter = 70%
   Bomber = 25%
   Boss = 5%

   This creates moments of surprise while
   keeping the gameplay accessible.
================================================== */

function spawnAircraft(){

    if(!gameRunning) return;

    const roll = Math.random();

    if(roll < 0.70){

        createAircraft("fighter");

    }

    else if(roll < 0.95){

        createAircraft("bomber");

    }

    else{

        createAircraft("boss");

    }

}


/* ==================================================
   CREATE AIRCRAFT
================================================== */

function createAircraft(type){

    const aircraft = document.createElement("div");

    aircraft.classList.add("aircraft");


    let hp;
    let points;
    let image;
    let size;
    let speed;


    /* ==========================================
       AIRCRAFT TYPES
    ========================================== */

    if(type === "fighter"){

        hp = 1;
        points = 100;

        image = Math.random() > 0.5
        ? "images/plane1.png"
        : "images/plane2.png";

        size = 90;

        speed = 1.5;

        aircraft.classList.add("fighter");
    }

    else if(type === "bomber"){

        hp = 3;

        points = 400;

        image = "images/bomber.png";

        size = 150;

        speed = 1;

        aircraft.classList.add("bomber");
    }

    else{

        hp = 5;

        points = 1000;

        image = "images/ace.png";

        size = 220;

        speed = 0.7;

        aircraft.classList.add("boss");
    }


    aircraft.dataset.hp = hp;
    aircraft.dataset.maxHp = hp;
    aircraft.dataset.points = points;


    /* ==========================================
       IMAGE
    ========================================== */

    const img = document.createElement("img");

    img.src = image;

    img.style.width = "100%";

    aircraft.appendChild(img);


    /* ==========================================
       HEALTH BAR
    ========================================== */

    const healthContainer =
    document.createElement("div");

    healthContainer.classList.add("healthContainer");


    const healthBar =
    document.createElement("div");

    healthBar.classList.add("healthBar");


    healthContainer.appendChild(healthBar);

    aircraft.appendChild(healthContainer);


    /* ==========================================
       START SIDE
    ========================================== */

    let fromLeft = Math.random() > 0.5;

    let startX = fromLeft
        ? -size
        : window.innerWidth;

    let endX = fromLeft
        ? window.innerWidth + size
        : -size;

    let posY =
        Math.random() *
        (window.innerHeight - 250)
        + 100;


    aircraft.style.left = startX + "px";
    aircraft.style.top = posY + "px";

    if(!fromLeft){

        aircraft.style.transform =
        "scaleX(-1)";
    }


    gameArea.appendChild(aircraft);


    /* ==========================================
       HIT DETECTION

       DESIGN COMMENT

       Larger aircraft require multiple
       successful clicks.

       This creates a simple risk-reward
       system and encourages player
       decision making.
    ========================================== */

    aircraft.addEventListener("click",(event)=>{

        event.stopPropagation();

        let currentHP =
        parseInt(aircraft.dataset.hp);

        currentHP--;

        aircraft.dataset.hp = currentHP;

        let maxHP =
        parseInt(aircraft.dataset.maxHp);

        let percent =
        (currentHP/maxHP)*100;

        healthBar.style.width =
        percent + "%";


        if(currentHP <= 0){

            destroyAircraft(
                aircraft,
                points
            );

        }

    });


    /* ==========================================
       MOVEMENT

       AI COMMENT

       ChatGPT was used to understand
       requestAnimationFrame and improve
       movement smoothness compared with
       using setInterval.
    ========================================== */

    let currentX = startX;

    function moveAircraft(){

        if(!gameRunning){

            aircraft.remove();
            return;
        }

        if(fromLeft){

            currentX += speed;

        }

        else{

            currentX -= speed;

        }

        aircraft.style.left =
        currentX + "px";


        if(
            (fromLeft && currentX > endX) ||
            (!fromLeft && currentX < endX)
        ){

            aircraft.remove();

            combo = 0;

            comboText.textContent = combo;

            return;
        }

        requestAnimationFrame(moveAircraft);

    }

    moveAircraft();

}


/* ==================================================
   DESTROY AIRCRAFT
================================================== */

function destroyAircraft(aircraft, points){

    score += points;

    combo++;

    scoreText.textContent = score;

    comboText.textContent = combo;

    comboText.classList.add("comboFlash");

    setTimeout(()=>{

        comboText.classList.remove(
            "comboFlash"
        );

    },300);


    createExplosion(
        aircraft.offsetLeft,
        aircraft.offsetTop
    );

    createFloatingScore(
        aircraft.offsetLeft,
        aircraft.offsetTop,
        points
    );


    if(points >= 400){

        gameContainer.classList.add("shake");

        setTimeout(()=>{

            gameContainer.classList.remove(
                "shake"
            );

        },300);

    }

    aircraft.remove();

}


/* ==================================================
   EXPLOSION EFFECT

   IMAGE LOCATION

   images/explosion.png
================================================== */

function createExplosion(x,y){

    const explosion =
    document.createElement("img");

    explosion.src =
    "images/explosion.png";

    explosion.classList.add("explosion");

    explosion.style.left = x + "px";
    explosion.style.top = y + "px";

    gameArea.appendChild(explosion);

    setTimeout(()=>{

        explosion.remove();

    },500);

}


/* ==================================================
   FLOATING SCORE
================================================== */

function createFloatingScore(x,y,points){

    const scorePopup =
    document.createElement("div");

    scorePopup.classList.add(
        "floatingScore"
    );

    scorePopup.innerText =
    "+" + points;

    scorePopup.style.left = x + "px";
    scorePopup.style.top = y + "px";

    gameArea.appendChild(scorePopup);

    setTimeout(()=>{

        scorePopup.remove();

    },1000);

}


/* ==================================================
   MISS CLICK

   DESIGN COMMENT

   Missing a target resets the combo.

   This encourages accuracy while avoiding
   harsh penalties.
================================================== */

gameArea.addEventListener("click",()=>{

    combo = 0;

    comboText.textContent = combo;

});


/* ==================================================
   END GAME
================================================== */

function endGame(){

    gameRunning = false;

    clearInterval(spawnLoop);

    clearInterval(timerLoop);

    finalScore.textContent = score;

    gameOverScreen.style.display =
    "flex";

}


/* ==================================================
   RESTART GAME
================================================== */

restartBtn.addEventListener("click",()=>{

    location.reload();

});


/* ==================================================
   AI USAGE COMMENT

   ChatGPT assisted with:

   - Debugging aircraft spawn logic.

   - Understanding requestAnimationFrame.

   - Improving code structure.

   - Refactoring repetitive functions.

   - Learning best practices for DOM
     manipulation and animation.

   The final design decisions, testing,
   balancing and implementation choices
   were made by the designer.
================================================== */