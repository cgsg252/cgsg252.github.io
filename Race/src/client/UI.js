let btnPause, btnContinue, btnMenu, btnPlay, btnSign, btnBlack, btnYellow, btnWhite, btnRenault, btnBackToMenu, btnChangeCar, btnStartRace;
let gameUI, pauseUI, mainMenu, gameCanvas, minimapCanvas, signIn, changeCar;

export let isPause = true;

export function initUI(socket, username) {
    /* canvases */
    gameCanvas = document.getElementById("gameCanvas");
    minimapCanvas = document.getElementById("minimapCanvas");

    /* game */
    btnPause = document.getElementById("pause-btn");
    btnStartRace = document.getElementById("startRace-btn");
    gameUI = document.getElementById("gameUI");

    /* pause */
    btnContinue = document.getElementById("continue-btn");
    btnMenu = document.getElementById("menu-btn");
    pauseUI = document.getElementById("pauseUI");

    /* menu */
    mainMenu = document.getElementById("mainMenu");
    btnPlay = document.getElementById("play-btn");
    btnChangeCar = document.getElementById("change_car-btn");

    /* registration */
    btnSign = document.getElementById("sign-btn");
    signIn = document.getElementById("sign_in");

    /* change car */
    btnBackToMenu = document.getElementById("backToMainMenu-btn");
    btnBlack = document.getElementById("blackCar-btn");
    btnRenault = document.getElementById("renaultCar-btn");
    btnYellow = document.getElementById("yellowCar-btn");
    btnWhite = document.getElementById("whiteCar-btn");
    changeCar = document.getElementById("changeCar");

    /* game UI */
    btnPause.addEventListener("click", () => {
        gameUI.classList.add('hidden');
        pauseUI.classList.remove('hidden');
        isPause = true;
    });

    btnStartRace.addEventListener("click", () => {
        socket.emit("startRace", username);
    });

    /* pause UI */
    btnContinue.addEventListener("click", () => {
        pauseUI.classList.add('hidden');
        gameUI.classList.remove('hidden');
        isPause = false;
    });

    btnMenu.addEventListener("click", () => {
        pauseUI.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        minimapCanvas.classList.add('hidden');
        gameCanvas.classList.add('hidden');
        isPause = true;
    });

    /* main menu */
    btnPlay.addEventListener("click", () => {
        mainMenu.classList.add('hidden');
        gameUI.classList.remove('hidden');
        minimapCanvas.classList.remove('hidden');
        gameCanvas.classList.remove('hidden');
        isPause = false;
    });

    btnChangeCar.addEventListener("click", () => {
        mainMenu.classList.add('hidden');
        changeCar.classList.remove('hidden');
        isPause = false;
    });

    /* change car menu */
    btnBackToMenu.addEventListener("click", () => {
        mainMenu.classList.remove('hidden');
        changeCar.classList.add('hidden');
        isPause = false;
    });

    btnBlack.addEventListener("click", () => {
        socket.emit("changeCar", username, "black");
        changeCar.classList.add('hidden');
        gameUI.classList.remove('hidden');
        minimapCanvas.classList.remove('hidden');
        gameCanvas.classList.remove('hidden');
    });

    btnRenault.addEventListener("click", () => {
        socket.emit("changeCar", username, "renault");
        changeCar.classList.add('hidden');
        gameUI.classList.remove('hidden');
        minimapCanvas.classList.remove('hidden');
        gameCanvas.classList.remove('hidden');
    });

    btnYellow.addEventListener("click", () => {
        socket.emit("changeCar", username, "yellow");
        changeCar.classList.add('hidden');
        gameUI.classList.remove('hidden');
        minimapCanvas.classList.remove('hidden');
        gameCanvas.classList.remove('hidden');
    });

    btnWhite.addEventListener("click", () => {
        socket.emit("changeCar", username, "white");
        changeCar.classList.add('hidden');
        gameUI.classList.remove('hidden');
        minimapCanvas.classList.remove('hidden');
        gameCanvas.classList.remove('hidden');
    });
}