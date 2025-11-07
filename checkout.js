 // API endpoints
    const BASKET_API_GET = "https://restaurant.stepprojects.ge/api/Baskets/GetAll";

    // HEADER scroll effect
    window.addEventListener("scroll", function () {
      const header = document.querySelector(".fixed");
      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 0);
      }
    });




    // Load order data from basket API
    async function loadOrderData() {
      try {
        const response = await fetch(BASKET_API_GET);
        const cartItems = await response.json();

        const orderItemsContainer = document.getElementById('orderItems');
        const totalAmountElement = document.getElementById('total-amount');

        if (!cartItems || cartItems.length === 0) {
          orderItemsContainer.innerHTML = '<div class="order-item"><span class="item-name">Your cart is empty</span></div>';
          totalAmountElement.textContent = '0.00 ₾';
          return;
        }

        let total = 0;
        orderItemsContainer.innerHTML = '';

        // Merge same products by product.id
        const mergedItems = {};
        cartItems.forEach(item => {
          if (!item.product) return;
          const id = item.product.id;
          if (!mergedItems[id]) {
            mergedItems[id] = { ...item };
          } else {
            mergedItems[id].quantity += item.quantity || 1;
          }
        });

        const mergedArray = Object.values(mergedItems);

        mergedArray.forEach(item => {
          const product = item.product;
          const quantity = item.quantity || 1;
          const itemTotal = (product.price || 0) * quantity;
          total += itemTotal;

          const orderItem = document.createElement('div');
          orderItem.className = 'order-item';
          orderItem.innerHTML = `
            <span class="item-name">${product.name || 'Unnamed Item'}</span>
            <span class="item-quantity">Qty: ${quantity}</span>
            <span class="item-price">${itemTotal.toFixed(2)} ₾</span>
          `;
          orderItemsContainer.appendChild(orderItem);
        });

        totalAmountElement.textContent = `${total.toFixed(2)} ₾`;

      } catch (error) {
        console.error("Error loading order data:", error);
        document.getElementById('orderItems').innerHTML = '<div class="order-item"><span class="item-name">Error loading order data</span></div>';
        document.getElementById('total-amount').textContent = '0.00 ₾';
      }
    }

    // Payment form functionality
    const cardInput = document.getElementById("card-number");
    const expiryInput = document.getElementById("expiry");
    const cvcInput = document.getElementById("cvc");
    const ownerInput = document.getElementById("owner");
    const form = document.getElementById("checkout-form");

    // Only numbers
    function onlyNumbers(text) {
      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] >= "0" && text[i] <= "9") result += text[i];
      }
      return result;
    }

    // Card formatting
    cardInput.addEventListener("input", function () {
      let value = onlyNumbers(cardInput.value);
      if (value.length > 16) value = value.substring(0, 16);
      let formatted = "";
      for (let i = 0; i < value.length; i++) {
        formatted += value[i];
        if ((i + 1) % 4 === 0 && i !== value.length - 1) formatted += " ";
      }
      cardInput.value = formatted;
    });

    // Expiry MM/YY
    expiryInput.addEventListener("input", function () {
      let value = onlyNumbers(expiryInput.value);
      if (value.length > 4) value = value.substring(0, 4);
      let formatted = "";
      for (let i = 0; i < value.length; i++) {
        formatted += value[i];
        if (i === 1 && value.length > 2) formatted += "/";
      }
      expiryInput.value = formatted;
    });

    // CVC
    cvcInput.addEventListener("input", function () {
      let value = onlyNumbers(cvcInput.value);
      if (value.length > 3) value = value.substring(0, 3);
      cvcInput.value = value;
    });

    // trimSpaces
    function trimSpaces(text) {
      return text.trim();
    }

    // Validation functions
    function validateCardNumber(card) {
      const digitsOnly = onlyNumbers(card);
      return digitsOnly.length === 16;
    }

    function validateExpiry(expiry) {
      if (expiry.length !== 5 || expiry[2] !== "/") return false;

      const parts = expiry.split("/");
      const month = parseInt(parts[0]);
      const year = parseInt(parts[1]);

      if (month < 1 || month > 12) return false;

      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (year < currentYear) return false;
      if (year === currentYear && month < currentMonth) return false;

      return true;
    }

    function validateCVC(cvc) {
      return cvc.length === 3;
    }

    function validateOwner(owner) {
      return owner.trim().length > 0;
    }

    // Form submission
    form.addEventListener("submit", function (e) {
      e.preventDefault();


      let card = trimSpaces(cardInput.value);
      let expiry = trimSpaces(expiryInput.value);
      let cvc = trimSpaces(cvcInput.value);
      let owner = trimSpaces(ownerInput.value);

      if (!validateCardNumber(card)) {
        Swal.fire({
          icon: "error",
          title: "Invalid card number!",
          text: "Must be 16 digits",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (!validateExpiry(expiry)) {
        Swal.fire({
          icon: "error",
          title: "Invalid expiry date!",
          text: "Format must be MM/YY and date must not be expired",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (!validateCVC(cvc)) {
        Swal.fire({
          icon: "error",
          title: "Invalid CVC!",
          text: "Must be 3 digits",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (!validateOwner(owner)) {
        Swal.fire({
          icon: "error",
          title: "Please enter cardholder name!",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const totalAmount = document.getElementById('total-amount').textContent;

      // Show loading
      Swal.fire({
        title: 'Processing payment...',
        html: `Total: <strong>${totalAmount}</strong>`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Simulate payment processing
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Payment successful! ✅",
          html: `Thank you, ${owner}!<br>Your payment of <strong>${totalAmount}</strong> has been processed.`,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
        }).then(() => {
          // Redirect to main page
          window.location.href = "main.html";
        });
      }, 2000);
    });