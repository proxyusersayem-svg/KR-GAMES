export class ShopController {
    constructor(inventory) {
        this.inventory = inventory;
        this.initShopUI();
    }

    initShopUI() {
        const modal = document.getElementById('shop-modal');
        const closeBtn = document.getElementById('btn-close-shop');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            document.exitPointerLock(); // Relinquish pointer to exit safely
        });

        document.querySelectorAll('.shop-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.getAttribute('data-id');
                const cost = parseInt(el.getAttribute('data-cost'), 10);
                const currency = el.getAttribute('data-currency');
                this.purchaseItem(id, cost, currency);
            });
        });
    }

    purchaseItem(id, cost, currency) {
        if (this.inventory.resources[currency] >= cost) {
            this.inventory.resources[currency] -= cost;
            
            if (id === 'block_clay') {
                this.inventory.addBlocks(16);
            } else if (id === 'sword_iron') {
                this.inventory.hotbar[0] = { id: 'sword_iron', name: 'Iron Sword', type: 'weapon', quantity: 1 };
            }
            this.inventory.updateHUD();
        } else {
            console.warn("Insufficient funds");
        }
    }
}
