// document.addEventListener('DOMContentLoaded', function () {
//     // Update navigation based on auth status
//     AuthService.updateNavigation();

//     // Protect add to cart functionality
//     document.addEventListener('click', function (e) {
//         if (e.target.classList.contains('add-btn')) {
//             if (!AuthService.isLoggedIn()) {
//                 e.preventDefault();
//                 AuthService.requireAuthForPurchase();
//                 return false;
//             }
//         }
//     });

// });

 window.addEventListener("scroll", function () {
        const header = document.querySelector(".fixed");
        if (window.scrollY > 0) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

// Modify your existing addToCart function to include auth check
function addToCart(product) {
    if (!AuthService.isLoggedIn()) {
        AuthService.requireAuthForPurchase();
        return;
    }

    // Your existing add to cart logic here
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        const productCopy = { ...product };
        productCopy.quantity = 1;
        cart.push(productCopy);
    }

    updateCartCount();
}


// Update navigation on page load
document.addEventListener('DOMContentLoaded', function () {
    // Update navigation based on auth status
    if (typeof AuthService !== 'undefined') {
        AuthService.updateNavigation();
    }

    // Protect add to cart functionality
    // document.addEventListener('click', function (e) {
    //     if (e.target.classList.contains('add-btn')) {
    //         if (!AuthService.isLoggedIn()) {
    //             e.preventDefault();
    //             AuthService.requireAuthForPurchase();
    //             return false;
    //         }
    //     }
    // });

    // Header scroll effect
    window.addEventListener("scroll", function () {
        const header = document.querySelector(".header-main");
        if (header) {
            if (window.scrollY > 0) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        }
    });
});

// Global cart variable (instead of localStorage)
let cart = [];
let allProducts = [];
let currentCategoryId = 0;


const categoryContainer = document.querySelector(".category-inline");

async function loadCategories() {
    try {
        const response = await fetch("https://restaurant.stepprojects.ge/api/Categories/GetAll");
        const data = await response.json();

        // Add All button
        const allBtn = document.createElement("button");
        allBtn.textContent = "All";
        allBtn.classList.add("category-btn", "active");
        allBtn.dataset.id = "0";
        allBtn.addEventListener("click", () => {
            currentCategoryId = 0;
            document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
            allBtn.classList.add("active");
            loadAllProducts();
        });
        categoryContainer.appendChild(allBtn);

        // Add category buttons
        data.forEach(category => {
            const btn = document.createElement("button");
            btn.textContent = category.name;
            btn.classList.add("category-btn");
            btn.dataset.id = category.id;

            btn.addEventListener("click", () => {
                currentCategoryId = category.id;
                document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                loadProductsByCategory(category.id);
            });

            categoryContainer.appendChild(btn);
        });

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

const spiceRange = document.getElementById("range");
const spiceLabel = document.getElementById("spiceLabel");
const resetBtn = document.getElementById("resetBtn");
const applyBtn = document.getElementById("applyBtn");
const noNutsCheckbox = document.getElementById("noNuts");
const vegetarianCheckbox = document.getElementById("vegeterian");

spiceRange.addEventListener("input", () => {
    const value = Number(spiceRange.value);
    let text = "Spiciness 🔥 : Not Chosen";

    switch (value) {
        case 0: text = "Not Chosen"; break;
        case 1: text = "0"; break;
        case 2: text = "1"; break;
        case 3: text = "2"; break;
        case 4: text = "3"; break;
        case 5: text = "4"; break;
    }

    spiceLabel.textContent = `Spiciness 🔥 : ${text}`;
});

resetBtn.addEventListener("click", () => {
    spiceRange.value = 0;
    spiceLabel.textContent = "Spiciness 🔥 : Not Chosen";
    noNutsCheckbox.checked = false;
    vegetarianCheckbox.checked = false;
    filterProducts();
});

applyBtn.addEventListener("click", filterProducts);


async function loadAllProducts() {
    try {
        const container = document.getElementById('products');
        container.innerHTML = '<div class="loading">პროდუქტების ჩატვირთვა...</div>';

        const response = await fetch('https://restaurant.stepprojects.ge/api/Products/GetAll');
        allProducts = await response.json();

        filterProducts();
    } catch (error) {
        console.error('Error loading all products:', error);
        const container = document.getElementById('products');
        container.innerHTML = '<p class="no-products">No products found matching your filters.</p>';
    }
}

async function loadProductsByCategory(categoryId) {
    try {
        const container = document.getElementById('products');
        container.innerHTML = '<div class="loading">lOADING...</div>';

        const response = await fetch(`https://restaurant.stepprojects.ge/api/Categories/GetCategory/${categoryId}`);
        const categoryData = await response.json();
        allProducts = categoryData.products || [];

        filterProducts();
    } catch (error) {
        console.error('Error loading products by category:', error);
        const container = document.getElementById('products');
        container.innerHTML = '<p class="no-products">CANT Load Peoducts...</p>';
    }
}

function filterProducts() {
    let filteredProducts = [...allProducts];

    const spiceLevel = Number(spiceRange.value);
    if (spiceLevel > 0) {
        filteredProducts = filteredProducts.filter(product =>
            product.spiciness === (spiceLevel - 1)
        );
    }

    if (noNutsCheckbox.checked) {
        filteredProducts = filteredProducts.filter(product => !product.nuts);
    }

    if (vegetarianCheckbox.checked) {
        filteredProducts = filteredProducts.filter(product => product.vegeterian);
    }

    renderProducts(filteredProducts);
}

function renderProducts(products) {
    const container = document.getElementById('products');
    const template = document.getElementById('product-template');

    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">No products were found according to your filters.</p>';
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        const clone = template.content.cloneNode(true);

        clone.querySelector(".product-img").src = product.image;
        clone.querySelector(".product-img").alt = product.name;
        clone.querySelector(".product-name").textContent = product.name;
        clone.querySelector(".product-price").textContent = `${product.price} ₾`;

        const nutsElement = clone.querySelector(".nuts");
        if (product.nuts) {
            nutsElement.textContent = "🐿️ Contains Nuts";
            nutsElement.style.color = "#c7510dff";
        } else {
            nutsElement.textContent = "✅ Without Nuts";
            nutsElement.style.color = "#52c41a";
        }

        const vegetarianElement = clone.querySelector(".vegeteriann");
        if (product.vegeterian) {
            vegetarianElement.textContent = "🥦Vegetarian";
            vegetarianElement.style.color = "#52c41a";
        } else {
            vegetarianElement.textContent = "🥩Non-vegetarian";
            vegetarianElement.style.color = "#c70d2cff";
        }
        const spicinessElement = clone.querySelector(".spicy");
        const spiciness = product.spiciness || 0;
        spicinessElement.textContent = "🔥".repeat(spiciness) || "It's Not Spicy";

        const addToCartBtn = clone.querySelector(".add-btn");
        addToCartBtn.addEventListener("click", () => {
            // Add button animation
            addToCartAnimation(addToCartBtn);
            postProd(product.price, product.id);
        });
        container.appendChild(clone);
    });
}

// Button animation function
function addToCartAnimation(button) {
    // Save original text and styles
    const originalText = button.textContent;
    const originalBgColor = button.style.backgroundColor;
    const originalColor = button.style.color;
    const originalBorder = button.style.border;

    // Change button to "Adding..." state
    button.textContent = "Adding...";
    button.style.backgroundColor = "#4CAF50"; // Green color
    button.style.color = "white";
    button.style.border = "none";
    button.disabled = true;

    // Return to original state after 1.5 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = originalBgColor;
        button.style.color = originalColor;
        button.style.border = originalBorder;
        button.disabled = false;
    }, 1500);
}
const PRODUCT_BASKET_POST_API = "https://restaurant.stepprojects.ge/api/Baskets/AddToBasket";

function postProd(itemPrice, itemId) {
    let obj = {
        quantity: 1,
        price: itemPrice,
        productId: itemId
    };

    fetch(PRODUCT_BASKET_POST_API, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    })
        .then((response) => {
            if (response.ok) {
                return response.text();
            }

        })
        .then((data) => {
            console.log("Product added successfully:", data);
        })
        .catch((error) => console.error("Error:", error));
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


document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadAllProducts();
});