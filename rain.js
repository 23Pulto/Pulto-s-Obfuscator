const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let letters = "01";
let fontSize = 14;
let columns = canvas.width / fontSize;
let drops = [];

for (let x = 0; x < columns; x++)
    drops[x] = 1;

function draw() {
    ctx.fillStyle = "rgba(18,20,24,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#3ea6ff";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        let text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
            drops[i] = 0;

        drops[i]++;
    }
}

setInterval(draw, 33);
