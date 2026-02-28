const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Raindrop settings
const raindrops = [];
const dropCount = 200; 
const dropSpeedMin = 4;
const dropSpeedMax = 10;

// Generate raindrops
for (let i = 0; i < dropCount; i++) {
    raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * (dropSpeedMax - dropSpeedMin) + dropSpeedMin,
        width: Math.random() * 1.5 + 0.5
    });
}

// Draw raindrops with blur trail
function drawRain() {
    // Slightly fade previous frame for motion blur effect
    ctx.fillStyle = "rgba(20,20,25,0.2)"; // matches your dark grey background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#3ea6ff"; // Blue color
    ctx.lineCap = "round";

    raindrops.forEach(drop => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.lineWidth = drop.width;
        ctx.stroke();

        drop.y += drop.speed;

        // Reset drop when off-screen
        if (drop.y > canvas.height) {
            drop.y = -drop.length;
            drop.x = Math.random() * canvas.width;
            drop.speed = Math.random() * (dropSpeedMax - dropSpeedMin) + dropSpeedMin;
            drop.length = Math.random() * 20 + 10;
        }
    });

    requestAnimationFrame(drawRain);
}

drawRain();

// Handle resizing
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
