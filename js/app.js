// app.js
import { auth, db } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  // Global Loader Fadeout
  const loader = document.getElementById("global-loader");
  if (loader) {
    setTimeout(() => {
      loader.style.transition = "opacity 0.5s ease";
      loader.style.opacity = 0;
      setTimeout(() => loader.style.display = "none", 500);
    }, 1000);
  }

  // Handle Authentication State Changes
  auth.onAuthStateChanged((user) => {
    const loginBtn = document.getElementById("login-nav-btn");
    const userDisplay = document.getElementById("user-display-name");

    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (userDisplay) {
        userDisplay.textContent = user.displayName || user.email.split("@")[0];
        userDisplay.style.display = "inline-block";
      }
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (userDisplay) userDisplay.style.display = "none";
    }
  });

  // Render Core Games Grid on homepage
  const gamesContainer = document.getElementById("featured-games-container");
  if (gamesContainer) {
    const games = [
      {
        id: "core-battle",
        title: "Block Strike: Core Battle",
        description: "Defend your Energy Core while building skyway bridges to smash the opposition. Real-time dynamic block placement.",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=350&auto=format&fit=crop",
        tags: ["3D Action", "Real-Time", "Multiplayer", "Strategy"]
      }
    ];

    gamesContainer.innerHTML = games.map(game => `
      <div class="game-card">
        <div class="game-thumb" style="background-image: url('${game.image}')"></div>
        <div class="game-info">
          <h3>${game.title}</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 5px;">${game.description}</p>
          <div class="game-tags">
            ${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <button onclick="window.location.href='rooms.html'" class="btn-cyber" style="width:100%; margin-top:15px; padding:8px 0; font-size:0.85rem;">PLAY NOW</button>
        </div>
      </div>
    `).join('');
  }
});

// Clean custom Notification utility
export function notify(msg, type = "info") {
  const container = document.body;
  const alertEl = document.createElement("div");
  alertEl.style.position = "fixed";
  alertEl.style.bottom = "20px";
  alertEl.style.right = "20px";
  alertEl.style.backgroundColor = type === "error" ? "var(--neon-pink)" : "var(--bg-secondary)";
  alertEl.style.border = `1px solid ${type === "error" ? "#ff0000" : "var(--neon-blue)"}`;
  alertEl.style.boxShadow = "var(--glow-shadow)";
  alertEl.style.color = "var(--text-main)";
  alertEl.style.padding = "12px 24px";
  alertEl.style.borderRadius = "4px";
  alertEl.style.fontFamily = "var(--font-cyber)";
  alertEl.style.fontSize = "0.85rem";
  alertEl.style.zIndex = "99999";
  alertEl.textContent = msg;

  container.appendChild(alertEl);
  setTimeout(() => {
    alertEl.remove();
  }, 3500);
}
