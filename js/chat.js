// chat.js
import { rtdb, ref, push, onValue } from "./firebase.js";

export function setupChat(roomId, username) {
  const chatContainer = document.createElement("div");
  chatContainer.style.position = "absolute";
  chatContainer.style.bottom = "120px";
  chatContainer.style.left = "20px";
  chatContainer.style.width = "300px";
  chatContainer.style.height = "200px";
  chatContainer.style.background = "rgba(11, 21, 40, 0.85)";
  chatContainer.style.border = "1px solid var(--neon-blue)";
  chatContainer.style.borderRadius = "6px";
  chatContainer.style.display = "flex";
  chatContainer.style.flexDirection = "column";
  chatContainer.style.padding = "10px";
  chatContainer.style.zIndex = "100";
  chatContainer.style.pointerEvents = "auto";

  chatContainer.innerHTML = `
    <div id="chat-messages" style="flex:1; overflow-y:auto; font-family:var(--font-sub); font-size:0.85rem; margin-bottom:8px; display:flex; flex-direction:column; gap:4px;"></div>
    <form id="chat-form" style="display:flex; gap:5px;">
      <input id="chat-input" type="text" placeholder="Send team message..." style="flex:1; background:var(--bg-primary); border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.8rem; padding:6px; border-radius:4px;">
      <button class="btn-cyber" style="padding:6px 12px; font-size:0.75rem;">SEND</button>
    </form>
  `;

  document.body.appendChild(chatContainer);

  const messagesBox = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  const chatRef = ref(rtdb, `chats/${roomId}`);

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput.value.trim() === "") return;

    push(chatRef, {
      sender: username,
      text: chatInput.value,
      timestamp: Date.now()
    });
    chatInput.value = "";
  });

  onValue(chatRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    messagesBox.innerHTML = "";
    Object.keys(data).forEach((key) => {
      const msg = data[key];
      const div = document.createElement("div");
      div.innerHTML = `<strong style="color:var(--neon-blue);">${msg.sender}:</strong> <span style="color:#fff;">${msg.text}</span>`;
      messagesBox.appendChild(div);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}
