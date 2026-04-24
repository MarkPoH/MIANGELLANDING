const CART_STORAGE_KEY = "miAngelCart";
const WHATSAPP_NUMBER = "996550266";

const readCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("No se pudo leer el carrito:", error);
    return [];
  }
};

const writeCart = (cart) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

document.addEventListener("DOMContentLoaded", () => {
  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartItems = document.getElementById("cart-items");
  const cartEmpty = document.getElementById("cart-empty");
  const cartCount = document.getElementById("cart-count");
  const checkoutButton = document.getElementById("checkout-button");
  const buyNowButtons = Array.from(document.querySelectorAll("article button")).filter(
    (button) => button.textContent.trim() === "Comprar"
  );
  const addToCartButtons = Array.from(document.querySelectorAll("article button")).filter(
    (button) => button.textContent.trim() === "Agregar a carrito"
  );

  let cart = readCart();

  const updateCount = () => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = String(totalItems);
  };

  const openCart = () => {
    cartOverlay.classList.remove("opacity-0", "pointer-events-none");
    cartOverlay.classList.add("opacity-100");
    cartDrawer.classList.remove("translate-x-full");
    document.body.classList.add("overflow-hidden");
  };

  const closeCart = () => {
    cartOverlay.classList.add("opacity-0", "pointer-events-none");
    cartOverlay.classList.remove("opacity-100");
    cartDrawer.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
  };

  const renderCart = () => {
    cartItems.innerHTML = "";

    if (cart.length === 0) {
      cartEmpty.classList.remove("hidden");
      checkoutButton.disabled = true;
      checkoutButton.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      cartEmpty.classList.add("hidden");
      checkoutButton.disabled = false;
      checkoutButton.classList.remove("opacity-50", "cursor-not-allowed");

      cart.forEach((item) => {
        const cartItem = document.createElement("li");
        cartItem.className =
          "flex items-center gap-4 rounded-xl border border-slate-200 p-4";
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="h-16 w-16 rounded-lg object-cover bg-slate-100">
          <div class="flex-1">
            <p class="font-semibold text-on-surface">${item.name}</p>
            <p class="text-sm text-on-surface-variant">Cantidad: ${item.quantity}</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="cart-decrease h-8 w-8 rounded-full border border-primary text-primary hover:bg-primary/5" data-id="${item.id}" aria-label="Restar cantidad">-</button>
            <button type="button" class="cart-increase h-8 w-8 rounded-full border border-primary text-primary hover:bg-primary/5" data-id="${item.id}" aria-label="Sumar cantidad">+</button>
            <button type="button" class="cart-remove text-sm font-medium text-rose-500 hover:text-rose-700" data-id="${item.id}">Quitar</button>
          </div>
        `;
        cartItems.appendChild(cartItem);
      });
    }

    updateCount();
    writeCart(cart);
  };

  const getProductData = (card) => {
    const image = card.querySelector("img");
    const title = card.querySelector("h3");

    return {
      id: card.dataset.id,
      name: card.dataset.name || title?.textContent.trim() || "Producto",
      image: image?.getAttribute("src") || "",
      quantity: 1
    };
  };

  const openWhatsApp = (products) => {
    if (products.length === 0) {
      return;
    }

    const orderLines = products.map((item) => `- ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ""}`);
    const message = `Hola, me interesaría comprar:\n${orderLines.join("\n")}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push(product);
    }

    renderCart();
  };

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productCard = button.closest("article");
      if (!productCard) {
        return;
      }

      addToCart(getProductData(productCard));
    });
  });

  buyNowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productCard = button.closest("article");
      if (!productCard) {
        return;
      }

      openWhatsApp([getProductData(productCard)]);
    });
  });

  cartItems.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const { id } = target.dataset;
    if (!id) {
      return;
    }

    if (target.classList.contains("cart-remove")) {
      cart = cart.filter((item) => item.id !== id);
    }

    if (target.classList.contains("cart-increase")) {
      cart = cart.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
    }

    if (target.classList.contains("cart-decrease")) {
      cart = cart
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);
    }

    renderCart();
  });

  cartToggle.addEventListener("click", (event) => {
    event.preventDefault();
    openCart();
  });

  cartClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      return;
    }

    openWhatsApp(cart);
    cart = [];
    renderCart();
    closeCart();
  });

  renderCart();
});
