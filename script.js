/* =====================================================

PIXEL AIR DEFENCE

DESIGN DOCUMENTATION

This project uses a simple state-machine structure.

Game Flow:

Start Screen
↓
Playing
↓
Game Over
↓
Restart

Reason:

Separating game states improves readability
and scalability.

Future expansions could include:

- Multiple levels
- Additional aircraft types
- Boss stages
- Upgrade systems
- Sound settings

This structure avoids needing to rewrite large
sections of code later.

===================================================== */



/* =====================================================
    DOM REFERENCES
===================================================== */

const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const gameArea = document.getElementById("gameArea");

const scoreText = document.getElementById("score");
const comboText = document.getElementById("combo");
const timerText = document.getElementById("timer");
const finalScore = document.getElementById("finalScore");

const crosshair = document.getElementById("crosshair");



/* =====================================================
    GAME VARIABLES
===================================================== */

/*
Design Choice:

Variables are kept globally accessible
because this is a small-scale project.

For larger productions:

A GameManager class would be preferable.
*/

let score = 0;
let combo = 0;

let gameTime = 60;

let gameRunning = false;

let spawnInterval;
let timerInterval;



/* =====================================================
    START GAME
===================================================== */

startBtn.addEventListener("click", startGame);

function startGame() {

    startScreen.style.display = "none";

    gameContainer.style.display = "block";

    score = 0;
    combo = 0;
    gameTime = 60;

    updateHUD();

    gameRunning = true;

    startTimer();

    startSpawning();
}



/* =====================================================
    RESTART GAME
===================================================== */

restartBtn.addEventListener("click", () => {

    gameOverScreen.style.display = "none";

    startGame();

});



/* =====================================================
    GAME OVER
===================================================== */

function endGame() {

    gameRunning = false;

    clearInterval(spawnInterval);
    clearInterval(timerInterval);

    document
        .querySelectorAll(
            ".fighter,.elite,.explosion,.floatingScore"
        )
        .forEach(element => element.remove());

    gameContainer.style.display = "none";

    gameOverScreen.style.display = "flex";

    finalScore.textContent = score;
}



/* =====================================================
    HUD UPDATE
===================================================== */

function updateHUD() {

    scoreText.textContent = score;

    comboText.textContent = combo;

    timerText.textContent = gameTime;
}



/* =====================================================
    TIMER SYSTEM
===================================================== */

/*
Design Choice:

60 seconds was chosen because it creates
a short arcade-style gameplay session.

This encourages replayability.

Players can quickly restart and attempt
to beat previous scores.
*/

function startTimer() {

    timerInterval = setInterval(() => {

        gameTime--;

        updateHUD();

        if (gameTime <= 0) {

            endGame();

        }

    }, 1000);

}



/* =====================================================
    CROSSHAIR SYSTEM
===================================================== */

/*
Design Choice:

Cursor is hidden during gameplay.

A custom crosshair improves immersion and
supports the military air-defense theme.

Visual feedback reinforces player role.

Potential Improvement:

Animated radar-style crosshair.
*/

document.addEventListener("mousemove", (e) => {

    crosshair.style.left = e.clientX + "px";
    crosshair.style.top = e.clientY + "px";

});



/* =====================================================
    SPAWN SYSTEM
===================================================== */

/*
Enemy Distribution:

80% Fighter
20% Elite

Elite aircraft create gameplay variety
without requiring complex AI.

The player immediately understands:

Small plane = quick points
Large plane = higher reward

This improves readability.
*/

function startSpawning() {

    spawnInterval = setInterval(() => {

        let random = Math.random();

        if(random < 0.8){

            spawnFighter();

        } else {

            spawnElite();

        }

    }, 900);

}



/* =====================================================
    CREATE FIGHTER
===================================================== */

function spawnFighter() {

    const fighter = document.createElement("img");

    fighter.src = "assets/fighter.png";

    fighter.classList.add("fighter");



    /*
    Spawn Direction

    Aircraft may enter from either side.

    This increases unpredictability and
    player engagement.
    */

    const fromLeft = Math.random() > 0.5;

    const y =
        Math.random() *
        (window.innerHeight - 300);

    fighter.style.top = y + "px";



    if(fromLeft){

        fighter.style.left = "-120px";

    }else{

        fighter.style.left =
            window.innerWidth + "px";

        fighter.style.transform =
            "scaleX(-1)";
    }



    gameArea.appendChild(fighter);



    let speed =
        3 +
        Math.random() * 3;



    let hp = 1;



    fighter.addEventListener("click", () => {

        destroyEnemy(
            fighter,
            10
        );

    });



    const movement = setInterval(() => {

        let currentX =
            parseFloat(
                fighter.style.left
            );



        if(fromLeft){

            fighter.style.left =
                currentX + speed + "px";

        }else{

            fighter.style.left =
                currentX - speed + "px";

        }



        if(
            currentX < -200 ||
            currentX > window.innerWidth + 200
        ){

            fighter.remove();

            clearInterval(movement);

            combo = 0;

            updateHUD();
        }

    },16);

}
/* =====================================================
    ELITE AIRCRAFT
===================================================== */

/*
Design Choice:

Elite aircraft function as mini-bosses.

Reasoning:

A game consisting only of single-click
targets quickly becomes repetitive.

Adding aircraft with multiple hit points:

- increases tension
- introduces prioritisation
- rewards accuracy

This creates a deeper interaction loop
without significantly increasing code
complexity.

Future Possibility:

Elite aircraft could gain attack patterns,
missiles or defensive behaviours.
*/

function spawnElite() {

    const elite = document.createElement("img");

    elite.src = "assets/elite.png";

    elite.classList.add("elite");



    const fromLeft = Math.random() > 0.5;

    const y =
        Math.random() *
        (window.innerHeight - 350);

    elite.style.top = y + "px";



    if(fromLeft){

        elite.style.left = "-180px";

    }else{

        elite.style.left =
            window.innerWidth + "px";

        elite.style.transform =
            "scaleX(-1)";
    }



    gameArea.appendChild(elite);



    let hp = 5;

    let speed = 2;



    elite.addEventListener("click", () => {

        hp--;

        createHitFlash(elite);

        if(hp <= 0){

            destroyEnemy(
                elite,
                50
            );

            clearInterval(move);
        }

    });



    const move = setInterval(() => {

        let currentX =
            parseFloat(
                elite.style.left
            );



        if(fromLeft){

            elite.style.left =
                currentX + speed + "px";

        }else{

            elite.style.left =
                currentX - speed + "px";

        }



        if(
            currentX < -300 ||
            currentX > window.innerWidth + 300
        ){

            elite.remove();

            clearInterval(move);

            combo = 0;

            updateHUD();
        }

    },16);

}



/* =====================================================
    HIT FEEDBACK
===================================================== */

/*
Feedback Design:

When a player hits an elite aircraft,
a brief flash effect confirms the hit.

Immediate feedback is important because
the enemy does not disappear instantly.

Without this effect, users may think
their click was not registered.
*/

function createHitFlash(enemy){

    enemy.classList.add("hitFlash");

    setTimeout(() => {

        enemy.classList.remove("hitFlash");

    },100);

}



/* =====================================================
    DESTROY ENEMY
===================================================== */

/*
Interaction Loop:

Click
→ Explosion
→ Score Gain
→ Combo Increase
→ Audio/Visual Reward

Providing multiple feedback channels
creates a satisfying player experience.
*/

function destroyEnemy(enemy, points){

    if(!gameRunning) return;

    combo++;

    score += points;

    score += combo;

    updateHUD();

    createExplosion(enemy);

    createFloatingText(
        "+" + (points + combo),
        enemy.offsetLeft,
        enemy.offsetTop
    );

    screenShake();

    enemy.remove();

}



/* =====================================================
    EXPLOSION EFFECT
===================================================== */

/*
Visual Feedback:

Explosions communicate success.

A simple sprite-based effect was chosen
instead of particle simulation because:

- easier implementation
- lower performance cost
- suits pixel-art aesthetic
*/

function createExplosion(enemy){

    const explosion =
        document.createElement("img");

    explosion.src =
        "assets/explosion.png";

    explosion.classList.add(
        "explosion"
    );



    explosion.style.left =
        enemy.offsetLeft + "px";

    explosion.style.top =
        enemy.offsetTop + "px";



    gameArea.appendChild(explosion);



    setTimeout(() => {

        explosion.remove();

    },400);

}



/* =====================================================
    FLOATING SCORE
===================================================== */

/*
Design Choice:

Floating score indicators reinforce
positive player actions.

The reward appears exactly where
the interaction occurred.

This creates stronger action-result
association.
*/

function createFloatingText(
    text,
    x,
    y
){

    const popup =
        document.createElement("div");

    popup.classList.add(
        "floatingScore"
    );

    popup.textContent = text;

    popup.style.left = x + "px";

    popup.style.top = y + "px";



    gameArea.appendChild(popup);



    setTimeout(() => {

        popup.remove();

    },1000);

}



/* =====================================================
    SCREEN SHAKE
===================================================== */

/*
Design Choice:

Screen shake increases impact.

Used sparingly because excessive camera
movement can reduce usability.

A short duration creates excitement
without causing frustration.
*/

function screenShake(){

    gameContainer.classList.add(
        "shake"
    );

    setTimeout(() => {

        gameContainer.classList.remove(
            "shake"
        );

    },150);

}



/* =====================================================
    DIFFICULTY SCALING
===================================================== */

/*
Game Design Reflection:

Difficulty scaling encourages long-term
engagement.

As time decreases:

- enemy speed increases
- player workload increases

This creates an escalating challenge.

Potential Issue:

If scaling becomes too aggressive,
new players may feel overwhelmed.

Future testing would be required to
determine optimal values.
*/

setInterval(() => {

    if(!gameRunning) return;

    if(gameTime < 45){

        spawnRateFast();

    }

},5000);



function spawnRateFast(){

    clearInterval(spawnInterval);

    spawnInterval = setInterval(() => {

        let random = Math.random();

        if(random < 0.7){

            spawnFighter();

        }else{

            spawnElite();

        }

    },600);

}



/* =====================================================
    FUTURE PROJECT REFLECTION
===================================================== */

/*

BENEFITS OF THIS PROTOTYPE

1.

Strong visual clarity.

Targets, crosshair and score elements
are clearly separated.

2.

Expandable architecture.

Additional enemy classes can be added
without changing existing systems.

3.

Simple onboarding.

Players understand the objective
immediately.

4.

Short play sessions.

Supports replayability and score chasing.



IMPLEMENTATION CHALLENGES

1.

Balancing enemy spawn rates.

Too many enemies may overwhelm users.

Too few may reduce engagement.

2.

Asset consistency.

All aircraft and effects must share
the same pixel-art style.

3.

Performance.

Large numbers of simultaneous DOM
elements could eventually affect frame
rate on low-end devices.

A Canvas-based approach might be more
appropriate for a larger-scale game.

4.

Accessibility.

Some players may struggle with rapid
mouse movement requirements.

Future versions could include:

- sensitivity settings
- larger targets
- difficulty options



CONCLUSION

The final design successfully combines
pixel-art aesthetics with arcade-style
interaction.

The use of immediate feedback,
score progression and target variation
helps maintain player engagement while
remaining technically achievable within
the scope of the assignment.

*/
