document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");

    startBtn.addEventListener("click", () => {

        // Disable button
        startBtn.disabled = true;

        // Create loading animation
        let dots = "";
        startBtn.innerText = "GAME BEGINNING.........";

        const loadingInterval = setInterval(() => {
            dots = dots.length < 3 ? dots + "." : "";
            startBtn.innerText = "GAME BEGINNING........." + dots;
        }, 300);

        // Add glow + pulse effect
        startBtn.style.boxShadow = "0 0 20px #22c55e";
        startBtn.style.animation = "pulse 1s infinite";

        // Redirect after delay
        setTimeout(() => {
            clearInterval(loadingInterval);
            window.location.href = "game.html";
            alert("WELCOME TO AI TIC-TAC-TOE!"); // Alert message
        }, 2500);
    });
});