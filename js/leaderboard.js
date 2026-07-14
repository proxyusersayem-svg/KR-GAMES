// leaderboard.js
import { db, collection, query, orderBy, limit, getDocs } from "./firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
  const sidebar = document.getElementById("leaderboard-sidebar");
  if (!sidebar) return;

  try {
    // Query high ranking records from Firestore Database
    const recordsQuery = query(collection(db, "users"), orderBy("wins", "desc"), limit(5));
    const querySnapshot = await getDocs(recordsQuery);
    
    sidebar.innerHTML = "";
    
    if (querySnapshot.empty) {
      sidebar.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-muted);">No combat rankings processed.</div>
      `;
      // Load local sample entries if DB is empty
      const fallbacks = [
        { username: "NexusStriker", wins: 142 },
        { username: "CoreBreaker", wins: 98 },
        { username: "VortexGrid", wins: 84 }
      ];
      sidebar.innerHTML = fallbacks.map((f, i) => `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; background:var(--bg-primary); padding:8px; border-radius:4px;">
          <span>#${i+1} ${f.username}</span>
          <span style="color:var(--neon-blue); font-weight:bold;">${f.wins} Wins</span>
        </div>
      `).join('');
      return;
    }

    let position = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justify = "space-between";
      row.style.background = "var(--bg-primary)";
      row.style.padding = "8px";
      row.style.borderRadius = "4px";
      row.style.fontSize = "0.85rem";

      row.innerHTML = `
        <span>#${position} ${data.displayName || 'Player'}</span>
        <span style="color:var(--neon-blue); font-weight:bold;">${data.wins || 0} Wins</span>
      `;
      sidebar.appendChild(row);
      position++;
    });

  } catch (error) {
    console.warn("Could not query Firestore for leaderboard; loaded local sample ranks.", error);
  }
});
