const gameArea = document.getElementById("gameArea");
const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const timerText = document.getElementById("timer");

let score = 0;

let combo = 0;

let highestCombo = 0;

let timeLeft = 30;

let currentTarget;

/*
Design Choice:

Only one target appears at a time.

This keeps attention focused on the
primary click interaction and avoids
visual overload.
*/

document
.getElementById("startBtn")
.addEventListener("click", startGame);

function startGame(){

    document.getElementById("startScreen")
    .style.display = "none";

    document.getElementById("gameUI")
    .style.display = "block";

    createTarget();

    startTimer();
}

/*
Design Choice:

Targets appear at random positions
to encourage active searching and
continuous engagement.
*/

function createTarget(){

    if(currentTarget){

        currentTarget.remove();
    }

    const target =
    document.createElement("div");

    target.classList.add("target");

    const size =
    getTargetSize();

    target.style.width =
    size + "px";

    target.style.height =
    size + "px";

    const maxX =
    window.innerWidth - size;

    const maxY =
    window.innerHeight - size;

    target.style.left =
    Math.random() * maxX + "px";

    target.style.top =
    Math.random() * maxY + "px";

    target.addEventListener(
        "click",
        hitTarget
    );

    gameArea.appendChild(target);

    currentTarget = target;

    moveTarget();
}

/*
Design Choice:

Difficulty increases through target
size reduction and movement rather
than introducing additional controls.
*/

function getTargetSize(){

    if(score < 10){

        return 120;
    }

    if(score < 25){

        return 90;
    }

    return 60;
}

function hitTarget(event){

    score++;

    combo++;

    highestCombo =
    Math.max(
        highestCombo,
        combo
    );

    scoreText.textContent = score;

    comboText.textContent = combo;

    currentTarget.classList.add("hit");

    showFloatingScore(
        event.clientX,
        event.clientY
    );

    if(combo % 5 === 0){

        showComboPopup();
    }

    setTimeout(() => {

        createTarget();

    },150);
}

/*
Design Choice:

Floating score text provides immediate
visual confirmation that the click
was successful.
*/

function showFloatingScore(x,y){

    const scorePopup =
    document.createElement("div");

    scorePopup.classList.add(
        "floatingScore"
    );

    scorePopup.textContent = "+1";

    scorePopup.style.left =
    x + "px";

    scorePopup.style.top =
    y + "px";

    document.body.appendChild(
        scorePopup
    );

    setTimeout(() => {

        scorePopup.remove();

    },700);
}

function showComboPopup(){

    const popup =
    document.createElement("div");

    popup.classList.add(
        "comboPopup"
    );

    popup.textContent =
    combo + " COMBO!";

    document.body.appendChild(
        popup
    );

    setTimeout(() => {

        popup.remove();

    },800);
}

/*
Design Choice:

Target movement introduces challenge
while preserving the click-only
interaction model.
*/

function moveTarget(){

    if(score < 15){

        return;
    }

    const interval =
    setInterval(() => {

        if(!currentTarget){

            clearInterval(interval);

            return;
        }

        const size =
        currentTarget.offsetWidth;

        currentTarget.style.left =
        Math.random() *
        (window.innerWidth-size)
        + "px";

        currentTarget.style.top =
        Math.random() *
        (window.innerHeight-size)
        + "px";

    },1000);
}

function startTimer(){

    const timer =
    setInterval(() => {

        timeLeft--;

        timerText.textContent =
        timeLeft;

        if(timeLeft <= 0){

            clearInterval(timer);

            endGame();
        }

    },1000);
}

function endGame(){

    document
    .getElementById("gameUI")
    .style.display = "none";

    document
    .getElementById("endScreen")
    .style.display = "flex";

    document
    .getElementById("finalScore")
    .textContent = score;

    document
    .getElementById("finalCombo")
    .textContent = highestCombo;
}