
const BASKET_API_GET = "https://restaurant.stepprojects.ge/api/Baskets/GetAll";
const BASKET_API_DELETE = "https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/";
const BASKET_API_UPDATE = "https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket";

const basketBody = document.getElementById("basketBody");
const totalPriceElement = document.querySelector("#price");
const checkoutBtn = document.querySelector(".checkout-btn");

async function renderBasket() {
    if (!basketBody) return;

    try {
        const response = await fetch(BASKET_API_GET);
        const cartItems = await response.json();

        basketBody.innerHTML = '';
        let total = 0;

        if (!cartItems || cartItems.length === 0) {
            basketBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">Your cart is empty</td>
                </tr>`;
            if (totalPriceElement) totalPriceElement.textContent = '0.00 ₾';
            updateCartCount(0);
            return;
        }

        // -----------------------
        // Merge same products by product.id
        // -----------------------
        const mergedItems = {};
        cartItems.forEach(item => {
            if (!item.product) return;
            const id = item.product.id;
            if (!mergedItems[id]) {
                mergedItems[id] = { ...item }; // copy the first item
            } else {
                mergedItems[id].quantity += item.quantity || 1; // sum quantities
            }
        });

        const mergedArray = Object.values(mergedItems);

        mergedArray.forEach(item => {
            const product = item.product;
            const quantity = item.quantity || 1;
            const itemTotal = (product.price || 0) * quantity;
            total += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="product-thumbnail">
                    <img src="${product.image || ''}" alt="${product.name || ''}">
                </td>
                <td class="product-name">${product.name || 'Unnamed Item'}</td>
                <td class="product-quantity">
                    <div class="quantity-controls" data-id="${product.id}">
                        <button type="button" class="qty-btn minus">-</button>
                        <span class="quantity-display">${quantity}</span>
                        <button type="button" class="qty-btn plus">+</button>
                    </div>
                </td>
                <td class="product-total">${itemTotal.toFixed(2)} ₾</td>
                <td class="product-spicy">${product.spiciness !== undefined ? product.spiciness : 'No'}</td>
                <td class="product-nuts">${product.nuts ? 'Yes' : 'No'}</td>
                <td class="product-remove">
                    <button type="button" class="remove-btn" data-id="${product.id}" title="Remove item">×</button>
                </td>`;
            basketBody.appendChild(row);
        });

        if (totalPriceElement) totalPriceElement.textContent = `${total.toFixed(2)} ₾`;
        updateCartCount(mergedArray.reduce((sum, item) => sum + (item.quantity || 1), 0));

    } catch (error) {
        console.error("Error rendering basket:", error);
    }
}

// Update cart count in header
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// -------------------- Event Delegation for Basket --------------------
basketBody.addEventListener('click', async (e) => {
    const btn = e.target;
    const control = btn.closest('.quantity-controls');

    // Remove product
    if (btn.classList.contains('remove-btn')) {
        const productId = Number(btn.dataset.id);
        await deleteProd(productId);
        await renderBasket();
    }

    // Update quantity
    if (control && (btn.classList.contains('plus') || btn.classList.contains('minus'))) {
        const productId = Number(control.dataset.id);
        const quantityDisplay = control.querySelector('.quantity-display');
        const change = btn.classList.contains('plus') ? 1 : -1;
        await updateBasketItem(productId, change, quantityDisplay);
    }
});

// Delete product
async function deleteProd(id) {
    try {
        const response = await fetch(BASKET_API_DELETE + id, { method: "DELETE" });
        if (!response.ok) throw new Error(`Delete failed with status ${response.status}`);
        console.log(`Deleted product ${id}`);
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

async function updateBasketItem(productId, change, quantityDisplay) {
    let currentQuantity = Number(quantityDisplay.textContent);
    let newQuantity = currentQuantity + change;

    // Prevent quantity from going below 1
    if (newQuantity < 1) newQuantity = 1;

    const row = quantityDisplay.closest("tr");
    const totalText = row.querySelector(".product-total").textContent.replace("₾", "").trim();

    // Calculate unit price
    const unitPrice = parseFloat(totalText) / currentQuantity;

    const newTotalPrice = unitPrice * newQuantity;

    const bodyData = {
        productId: productId,
        quantity: newQuantity,
        price: newTotalPrice
    };

    try {
        const response = await fetch(BASKET_API_UPDATE, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        });
        if (!response.ok) throw new Error("Failed to update basket");

        // Update DOM immediately
        quantityDisplay.textContent = newQuantity;
        row.querySelector(".product-total").textContent = `${newTotalPrice.toFixed(2)} ₾`;

        // Re-render basket to recalc totals and merged quantities correctly
        await renderBasket();

    } catch (error) {
        console.error("Error updating basket:", error);
    }
}


// -------------------- Checkout --------------------
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const total = Number(totalPriceElement.textContent.replace('₾', '').trim());
        if (total === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Your cart is empty',
                text: 'Please add items to your cart before checking out',
                confirmButtonColor: '#ff0000ff'
            });
            return;
        }
        window.location.href = 'checkout.html';
    });
}

// -------------------- Initial Load --------------------
document.addEventListener('DOMContentLoaded', renderBasket);
