// inventory.js
export function setupInventory(onBlockChangeCallback) {
  // Store Armory setup listing definitions
  const shopItems = [
    { id: "wool", name: "Wool Block", cost: 2, icon: "fa-cubes", color: 0x9ca3af },
    { id: "stone", name: "Stone Block", cost: 4, icon: "fa-cube", color: 0x4b5563 },
    { id: "iron_block", name: "Iron Block", cost: 8, icon: "fa-shield-halved", color: 0xd1d5db },
    { id: "sword", name: "Cyber Blade", cost: 12, icon: "fa-sword", isWeapon: true },
    { id: "armor", name: "Force Field Shield", cost: 15, icon: "fa-user-shield", isArmor: true }
  ];

  const trigger = document.getElementById("shop-trigger-btn");
  const modal = document.getElementById("shop-modal");
  const close = document.getElementById("shop-close-btn");
  const itemsContainer = document.getElementById("shop-items-container");

  trigger.addEventListener("click", () => {
    modal.style.display = "block";
  });

  close.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Inject Shop lists dynamically
  if (itemsContainer) {
    itemsContainer.innerHTML = shopItems.map(item => `
      <div style="background:var(--bg-primary); padding:15px; border-radius:6px; border:1px solid rgba(0, 240, 255, 0.15); text-align:center;">
        <i class="fa-solid ${item.icon}" style="font-size:1.8rem; color:var(--neon-blue); margin-bottom:8px;"></i>
        <h4 style="font-size:0.9rem;">${item.name}</h4>
        <p style="font-size:0.8rem; color:#ffd700; margin:5px 0;">Cost: $${item.cost}</p>
        <button class="btn-cyber buy-item-btn" data-id="${item.id}" data-cost="${item.cost}" style="padding:4px 8px; font-size:0.75rem;">ACQUIRE</button>
      </div>
    `).join('');
  }

  // Set hotbar click callback listener mechanisms
  const hotbarSlots = document.querySelectorAll(".hotbar-slot");
  hotbarSlots.forEach(slot => {
    slot.addEventListener("click", () => {
      hotbarSlots.forEach(s => s.classList.remove("active"));
      slot.classList.add("active");

      // Bind dynamic color based on slot
      const index = parseInt(slot.dataset.slot) - 1;
      const selected = shopItems[index % shopItems.length];
      if (selected && selected.color && onBlockChangeCallback) {
        onBlockChangeCallback(selected.color);
      }
    });
  });
}
