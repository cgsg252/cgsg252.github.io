const buttonFractal = document.getElementById("Fractal-btn");
const button3dvis = document.getElementById("vis3d-btn");
const buttonChat = document.getElementById("chat-btn");
const buttonRace = document.getElementById("race-btn");

buttonFractal.addEventListener("click", (event) => {
    window.location.href = './Fractal/dist/index.html';
});

button3dvis.addEventListener("click", (event) => {
    window.location.href = './3D_Visualization/dist/index.html';
});

buttonChat.addEventListener("click", (event) => {
    window.location.href = 'http://91.107.122.249:6767';
});

buttonRace.addEventListener("click", (event) => {
    window.location.href = 'http://91.107.122.249:3300';
});
