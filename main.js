const buttonFractal = document.getElementById("Fractal-btn");
const button3dvis = document.getElementById("vis3d-btn");

buttonFractal.addEventListener("click", (event) => {
    window.location.href = './Fractal/dist/index.html';
});

button3dvis.addEventListener("click", (event) => {
    window.location.href = './3D_Visualization/dist/index.html';
});

