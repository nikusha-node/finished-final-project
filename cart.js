
window.addEventListener("scroll", function() {
    const header = document.querySelector(".fixed");
    if (window.scrollY > 0) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// DOM Elements
// const basketBody = document.getElementById("basketBody");
const totalPriceElement = document.querySelector("#price");
const checkoutBtn = document.querySelector(".checkout-btn");
let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    renderBasket();
    updateCartCount();

    // Add event listener for checkout button
    if (checkoutBtn) {

        checkoutBtn.addEventListener('click', handleCheckout);
    }
});





// Update cart count in header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}




// Update cart count in header

const BASKET_DELETE_API = "https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/";

async function deleteProd(id) {
    try {
        const response = await fetch(BASKET_DELETE_API + id, {
            method: "DELETE",
            headers: {
                "accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Delete failed with status ${response.status}`);
        }

        const info = await response.text();
        console.log("Delete success:", info);

    } catch (error) {
        console.error("Error deleting product:", error);
    }
}




const UPDATE_BASKET_API = "https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket";

// Attach event listeners for all + / - buttons after basket rendering
function attachQuantityListeners() {
    const quantityControls = document.querySelectorAll(".quantity-controls");
    console.log("Found controls:", quantityControls.length);

    quantityControls.forEach(control => {
        const plusBtn = control.querySelector(".plus");
        const minusBtn = control.querySelector(".minus");
        console.log("Plus button:", plusBtn, "Minus button:", minusBtn);

        const quantityDisplay = control.querySelector(".quantity-display");
        const productId = control.getAttribute("data-id");
        console.log("Product ID:", productId);

        plusBtn.addEventListener("click", () => updateBasketItem(productId, 1, quantityDisplay));
        minusBtn.addEventListener("click", () => updateBasketItem(productId, -1, quantityDisplay));
    });
}

   document.addEventListener("DOMContentLoaded", async () => {
        await renderBasket();  // make sure basket rows exist
        attachQuantityListeners(); // now rows exist, attach events
    });

    const basketBody = document.getElementById("basketBody");


    const BASKET_API_GET = "https://restaurant.stepprojects.ge/api/Baskets/GetAll";
    const BASKET_API_UPDATE = "https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket";

async function renderBasket() {
    if (!basketBody) return;

    try {
        // Fetch basket items from API
        const response = await fetch(BASKET_API_GET);
        const cartItems = await response.json();

        basketBody.innerHTML = '';

        if (!cartItems || cartItems.length === 0) {
            basketBody.innerHTML =
                `<tr>
                    <td colspan="8" class="text-center">Your cart is empty</td>
                </tr>`;
            if (totalPriceElement) totalPriceElement.textContent = '0.00 ₾';
            updateCartCount(0);
            return;
        }

        let total = 0;

        cartItems.forEach(item => {
            if (!item.product) return;

            const row = document.createElement('tr');
            const product = item.product;
            const quantity = item.quantity || 1;
            const itemTotal = (product.price || 0) * quantity;
            total += itemTotal;

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
                </td>
            `;

            // Attach quantity button listeners
            const controls = row.querySelector('.quantity-controls');
            const minusBtn = controls.querySelector('.minus');
            const plusBtn = controls.querySelector('.plus');
            const quantityDisplay = controls.querySelector('.quantity-display');
            const productId = Number(controls.dataset.id);

            minusBtn.addEventListener('click', () => updateBasketItem(productId, -1, quantityDisplay));
            plusBtn.addEventListener('click', () => updateBasketItem(productId, 1, quantityDisplay));

            // Attach remove button listener
            const removeBtn = row.querySelector('.remove-btn');
            removeBtn.addEventListener('click', async () => {
                await deleteProd(productId);
                await renderBasket(); // Refresh basket after deletion
            });

            basketBody.appendChild(row);
        });

        // Update total price in DOM
        if (totalPriceElement) totalPriceElement.textContent = `${total.toFixed(2)} ₾`;

        // Update cart count
        updateCartCount(cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0));

    } catch (error) {
        console.error("Error rendering basket:", error);
    }
}


//  updateBasketItem
async function updateBasketItem(productId, change, quantityDisplay) {
    // Get current quantity from the DOM
    let currentQuantity = Number(quantityDisplay.textContent);
    let newQuantity = currentQuantity + change;

    // Prevent quantity from going below 1
    if (newQuantity < 1) newQuantity = 1;

    try {
        // Calculate new price for the API request
        const row = quantityDisplay.closest("tr");
        const totalText = row.querySelector(".product-total").textContent.replace("₾", "").trim();
        const unitPrice = parseFloat(totalText) / currentQuantity; // price per item
        const newTotalPrice = unitPrice * newQuantity;

        const bodyData = {
            productId: productId,
            quantity: newQuantity,
            price: newTotalPrice
        };

        // Send PUT request to API
        const response = await fetch("https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) throw new Error("Failed to update basket");

        // Update DOM immediately
        quantityDisplay.textContent = newQuantity;
        row.querySelector(".product-total").textContent = `${newTotalPrice.toFixed(2)} ₾`;

        // Update overall cart count and total
        await renderBasket(); // Re-render basket to recalc totals and ensure data is synced

    } catch (error) {
        console.error("Error updating basket:", error);
    }
}

async function handleCheckout(event) {
    event.preventDefault();
    if (Number(totalPriceElement.textContent.replace('₾', '').trim()) === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Your cart is empty',
            text: 'Please add items to your cart before checking out',
            confirmButtonColor: '#ff0000ff'
        });
        return;
    }
    console.log("Cart total:", totalPriceElement.textContent.trim());
    console.log(typeof (totalPriceElement.textContent.trim()))
    console.log((Number(totalPriceElement.textContent.trim())));


    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Burger menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    if (burger && nav) {
        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                burger.classList.remove('active');
            });
        });
    }
});


function updateNavigation() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');
    const authSection = document.querySelector('.register-btn');

    if (authSection) {
        if (isLoggedIn && currentUser) {
            // Show profile section
            authSection.innerHTML = `
                <div class="profile-section">
                    <a href="profile.html" class="profile-link">
                        <span class="profile-icon">👤</span>
                        <span class="profile-name">${currentUser.split('@')[0]}</span>
                    </a>
                </div>`;
        } else {
            // Show login/register buttons
            authSection.innerHTML = `
                <a href="login.html" class="auth-btn">Login</a>
                <a href="login.html#register" class="auth-btn" id="showRegisterNav">Register</a>`;
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});