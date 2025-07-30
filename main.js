// main.js

// =================================================================
// BAGIAN 1: INISIALISASI & FUNGSI UTAMA SAAT HALAMAN DIMUAT
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Jalankan fungsi untuk menu mobile di setiap halaman
    initMobileMenu();

    // Logika spesifik untuk halaman tertentu
    if (document.getElementById('product-grid')) { displayProducts(products); initFilters(); }
    if (document.getElementById('featured-products-grid')) { displayFeaturedProducts(); }
    if (document.getElementById('product-detail-container')) { displayProductDetails(); }
    if (document.getElementById('cart-container')) { displayCartItems(); }
    if (document.getElementById('checkout-summary-container')) { displayCheckoutSummary(); }
    if (document.getElementById('wishlist-grid')) { displayWishlistItems(); }
    if (document.getElementById('checkout-form')) { initCheckoutForm(); }
    if (document.getElementById('invoice-container')) { displayInvoice(); }
    
    updateCartIcon();
    updateWishlistIcon();
});


// =================================================================
// BAGIAN 2: FUNGSI-FUNGSI UNTUK MENAMPILKAN PRODUK
// =================================================================
function displayFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-products-grid');
    if (!featuredGrid) return;
    const featuredProducts = products.slice(0, 4);
    displayProducts(featuredProducts, featuredGrid);
}

function displayProducts(productsToDisplay, gridElement) {
    const productGrid = gridElement || document.getElementById('product-grid');
    if (!productGrid) return;
    productGrid.innerHTML = ''; 

    productsToDisplay.forEach(product => {
        const productLink = `produk-detail.html?id=${product.id}`;
        const productCard = `
            <div class="group">
                <div class="aspect-w-3 aspect-h-4 bg-concrete-grey/20 mb-4 overflow-hidden">
                    <a href="${productLink}">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    </a>
                </div>
                <h3 class="font-semibold text-lg">
                    <a href="${productLink}" class="hover:text-cobalt-blue transition-colors">${product.name}</a>
                </h3>
                <p class="font-bold mt-1">Rp ${product.price.toLocaleString('id-ID')}</p>
            </div>
        `;
        productGrid.innerHTML += productCard;
    });
}

function displayProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);
    const container = document.getElementById('product-detail-container');

    if (!product) {
        container.innerHTML = '<p class="col-span-2 text-center">Produk tidak ditemukan.</p>';
        return;
    }

    const isFavorited = isWishlisted(product.id);
    const heartIconClass = isFavorited ? 'fas fa-heart text-red-500' : 'far fa-heart';

    const detailHtml = `
        <div class="flex flex-col gap-4">
            <div class="bg-concrete-grey/20"><img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover"></div>
        </div>
        <div class="flex flex-col pt-4">
            <h1 class="font-heading text-4xl md:text-5xl">${product.name}</h1>
            <p class="text-2xl font-semibold my-4 text-cobalt-blue">Rp ${product.price.toLocaleString('id-ID')}</p>
            <p class="text-charcoal-black/80 leading-relaxed mb-6">${product.description}</p>
            <div class="mb-6">
                <h3 class="font-semibold mb-3">Ukuran</h3>
                <div class="flex gap-3">
                    <div class="size-option"><input type="radio" id="size-s" name="size" value="S" class="hidden"><label for="size-s" class="cursor-pointer border border-gray-300 w-12 h-12 flex items-center justify-center font-semibold hover:border-charcoal-black transition-colors">S</label></div>
                    <div class="size-option"><input type="radio" id="size-m" name="size" value="M" class="hidden" checked><label for="size-m" class="cursor-pointer border border-gray-300 w-12 h-12 flex items-center justify-center font-semibold hover:border-charcoal-black transition-colors">M</label></div>
                    <div class="size-option"><input type="radio" id="size-l" name="size" value="L" class="hidden"><label for="size-l" class="cursor-pointer border border-gray-300 w-12 h-12 flex items-center justify-center font-semibold hover:border-charcoal-black transition-colors">L</label></div>
                    <div class="size-option"><input type="radio" id="size-xl" name="size" value="XL" class="hidden"><label for="size-xl" class="cursor-pointer border border-gray-300 w-12 h-12 flex items-center justify-center font-semibold hover:border-charcoal-black transition-colors">XL</label></div>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 mb-8">
                <button onclick="addToCart(${product.id})" class="w-full bg-charcoal-black text-off-white font-bold py-3 hover:bg-black transition-colors">Tambah ke Keranjang</button>
                <button onclick="toggleWishlist(${product.id})" class="w-full sm:w-auto border-2 border-charcoal-black text-charcoal-black font-bold px-6 py-3 hover:bg-charcoal-black hover:text-off-white transition-colors">
                    <i id="wishlist-icon" class="${heartIconClass}"></i>
                </button>
            </div>
        </div>
    `;
    container.innerHTML = detailHtml;
}


// =================================================================
// BAGIAN 3: FUNGSI-FUNGSI UNTUK KERANJANG BELANJA (SHOPPING CART)
// =================================================================
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === productId);
    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Produk berhasil ditambahkan ke keranjang!');
    updateCartIcon();
}

function updateCartIcon() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartIcon = document.getElementById('cart-icon-qty');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartIcon) {
        if (totalItems > 0) {
            cartIcon.textContent = totalItems;
            cartIcon.classList.remove('hidden');
        } else {
            cartIcon.classList.add('hidden');
        }
    }
}

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-container');
    if (!itemsContainer || !summaryContainer) return;
    if (cart.length === 0) {
        document.getElementById('cart-container').innerHTML = `<div class="text-center py-12 col-span-3"><p class="text-charcoal-black/70">Keranjang belanja Anda masih kosong.</p><a href="koleksi.html" class="inline-block mt-4 bg-charcoal-black text-off-white font-bold py-3 px-8 hover:bg-black transition-colors">Mulai Berbelanja</a></div>`;
        return;
    }
    let itemsHtml = `<div class="border-b border-gray-200 pb-4 mb-4 hidden md:grid grid-cols-5 gap-4 text-sm font-semibold text-charcoal-black/60"><div class="col-span-2">PRODUK</div><div>HARGA</div><div>JUMLAH</div><div class="text-right">TOTAL</div></div>`;
    let subtotal = 0;
    const SHIPPING_COST = 20000;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            itemsHtml += `<div class="grid grid-cols-5 items-center gap-4 py-4 border-b border-gray-200"><div class="col-span-2 flex items-center gap-4"><div class="w-24 h-32 bg-concrete-grey/20 flex-shrink-0"><img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover"></div><div><h3 class="font-semibold">${product.name}</h3><p class="text-sm text-charcoal-black/60">Ukuran: M</p><button onclick="removeFromCart(${product.id})" class="text-xs text-red-500 hover:underline mt-1">Hapus</button></div></div><div class="font-semibold">Rp ${product.price.toLocaleString('id-ID')}</div><div><input onchange="updateQuantity(${product.id}, this.value)" type="number" value="${item.quantity}" min="1" class="w-16 border border-gray-300 text-center py-1"></div><div class="font-semibold text-right">Rp ${itemTotal.toLocaleString('id-ID')}</div></div>`;
        }
    });
    itemsContainer.innerHTML = itemsHtml;
    const total = subtotal + SHIPPING_COST;
    const summaryHtml = `<div class="bg-gray-50 p-6 border border-gray-200"><h2 class="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">Ringkasan Pesanan</h2><div class="space-y-4 text-charcoal-black/80"><div class="flex justify-between"><span>Subtotal</span><span class="font-semibold">Rp ${subtotal.toLocaleString('id-ID')}</span></div><div class="flex justify-between"><span>Ongkos Kirim</span><span class="font-semibold">Rp ${SHIPPING_COST.toLocaleString('id-ID')}</span></div><hr><div class="flex justify-between text-lg font-bold text-charcoal-black"><span>Total</span><span>Rp ${total.toLocaleString('id-ID')}</span></div></div><a href="checkout.html" class="block text-center w-full mt-6 bg-charcoal-black text-off-white font-bold py-3 hover:bg-black transition-colors">Lanjut ke Checkout</a></div>`;
    summaryContainer.innerHTML = summaryHtml;
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    displayCartItems();
    updateCartIcon();
}

function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex > -1) {
        const quantity = parseInt(newQuantity) || 1;
        cart[productIndex].quantity = quantity > 0 ? quantity : 1;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartIcon();
}

// =================================================================
// BAGIAN 4: FUNGSI UNTUK HALAMAN CHECKOUT
// =================================================================
function displayCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const summaryContainer = document.getElementById('checkout-summary-container');
    if (!summaryContainer) return;
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
        window.location.href = 'koleksi.html';
        return;
    }
    let itemsHtml = '<h2 class="text-xl font-semibold mb-6">Ringkasan Pesanan</h2>';
    let subtotal = 0;
    const SHIPPING_COST = 20000;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            subtotal += product.price * item.quantity;
            itemsHtml += `<div class="flex items-center gap-4 py-4 border-b border-gray-200"><div class="w-20 h-24 bg-concrete-grey/20 flex-shrink-0 relative"><img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover"><span class="absolute -top-2 -right-2 bg-charcoal-black text-off-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">${item.quantity}</span></div><div class="flex-grow"><h3 class="font-semibold">${product.name}</h3><p class="text-sm text-charcoal-black/60">Ukuran: M</p></div><div class="font-semibold">Rp ${(product.price * item.quantity).toLocaleString('id-ID')}</div></div>`;
        }
    });
    const total = subtotal + SHIPPING_COST;
    const summaryTotalsHtml = `<div class="py-4 space-y-2 border-b border-gray-200"><div class="flex justify-between"><span>Subtotal</span><span>Rp ${subtotal.toLocaleString('id-ID')}</span></div><div class="flex justify-between"><span>Pengiriman</span><span>Rp ${SHIPPING_COST.toLocaleString('id-ID')}</span></div></div><div class="flex justify-between font-bold text-lg pt-4"><span>Total</span><span>Rp ${total.toLocaleString('id-ID')}</span></div>`;
    summaryContainer.innerHTML = itemsHtml + summaryTotalsHtml;
}

// =================================================================
// BAGIAN 5: FUNGSI UNTUK FILTER DAN SORTING
// =================================================================
function initFilters() {
    const filterLinks = document.querySelectorAll('.filter-link');
    let currentCategory = 'all'; 
    let currentSort = 'default';
    filterLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const categoryFilter = this.dataset.filter;
            const sortOption = this.dataset.sort;
            if (categoryFilter) { currentCategory = categoryFilter; }
            if (sortOption) { currentSort = sortOption; }
            document.querySelectorAll('#category-filters .filter-link').forEach(l => l.classList.remove('font-bold'));
            document.querySelector(`#category-filters .filter-link[data-filter="${currentCategory}"]`).classList.add('font-bold');
            document.querySelectorAll('#sort-filters .filter-link').forEach(l => l.classList.remove('font-bold'));
            document.querySelector(`#sort-filters .filter-link[data-sort="${currentSort}"]`).classList.add('font-bold');
            let filteredProducts = [...products];
            if (currentCategory !== 'all') {
                filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
            }
            if (currentSort === 'price-asc') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (currentSort === 'price-desc') {
                filteredProducts.sort((a, b) => b.price - a.price);
            }
            displayProducts(filteredProducts);
        });
    });
}

// =================================================================
// BAGIAN 6: FUNGSI UNTUK WISHLIST
// =================================================================
function toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const productIndex = wishlist.indexOf(productId);
    if (productIndex > -1) {
        wishlist.splice(productIndex, 1);
        alert('Produk dihapus dari wishlist.');
    } else {
        wishlist.push(productId);
        alert('Produk ditambahkan ke wishlist!');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistIconOnDetail(productId);
    updateWishlistIcon();
}

function isWishlisted(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    return wishlist.includes(productId);
}

function updateWishlistIconOnDetail(productId) {
    const icon = document.getElementById('wishlist-icon');
    if (icon) {
        const isFavorited = isWishlisted(productId);
        icon.className = isFavorited ? 'fas fa-heart text-red-500' : 'far fa-heart';
    }
}

function updateWishlistIcon() {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistIconQty = document.getElementById('wishlist-icon-qty');
    const wishlistIconHeader = document.getElementById('wishlist-icon-header');
    const totalItems = wishlist.length;
    if (wishlistIconQty && wishlistIconHeader) {
        if (totalItems > 0) {
            wishlistIconQty.textContent = totalItems;
            wishlistIconQty.classList.remove('hidden');
            wishlistIconHeader.className = 'fas fa-heart text-red-500';
        } else {
            wishlistIconQty.classList.add('hidden');
            wishlistIconHeader.className = 'far fa-heart';
        }
    }
}

function displayWishlistItems() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistGrid = document.getElementById('wishlist-grid');
    if (!wishlistGrid) return;
    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-charcoal-black/70">Wishlist Anda masih kosong.</p><a href="koleksi.html" class="inline-block mt-4 bg-charcoal-black text-off-white font-bold py-3 px-8 hover:bg-black transition-colors">Mulai Jelajahi Koleksi</a></div>`;
        return;
    }
    const wishlistProducts = products.filter(product => wishlist.includes(product.id));
    displayProducts(wishlistProducts, wishlistGrid);
}

// =================================================================
// BAGIAN 7: FUNGSI UNTUK NAVIGASI MOBILE
// =================================================================
function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// =================================================================
// BAGIAN 8: FUNGSI UNTUK PROSES CHECKOUT
// =================================================================
function initCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert("Keranjang Anda kosong.");
                return;
            }
            const orderData = {
                items: cart,
                customer: {
                    name: document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value
                },
                date: new Date().toLocaleDateString('id-ID'),
                invoiceNumber: `INV-${Date.now()}`
            };
            localStorage.setItem('lastOrder', JSON.stringify(orderData));
            localStorage.removeItem('cart');
            window.location.href = 'terima-kasih.html';
        });
    }
}

// =================================================================
// BAGIAN 9: FUNGSI UNTUK HALAMAN INVOICE
// =================================================================
function displayInvoice() {
    const order = JSON.parse(localStorage.getItem('lastOrder'));
    if (!order) {
        document.getElementById('invoice-container').innerHTML = '<p class="text-center">Data invoice tidak ditemukan.</p>';
        return;
    }
    document.getElementById('invoice-number').textContent = order.invoiceNumber;
    document.getElementById('invoice-date').textContent = order.date;
    document.getElementById('customer-name').textContent = order.customer.name;
    document.getElementById('customer-address').textContent = order.customer.address;
    document.getElementById('customer-email').textContent = order.customer.email;
    const itemsTbody = document.getElementById('invoice-items');
    const summaryDiv = document.getElementById('invoice-summary');
    itemsTbody.innerHTML = '';
    let subtotal = 0;
    const SHIPPING_COST = 20000;
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const total = item.quantity * product.price;
            subtotal += total;
            itemsTbody.innerHTML += `
                <tr class="border-b border-gray-200">
                    <td class="p-4">${product.name}</td>
                    <td class="p-4 text-center">${item.quantity}</td>
                    <td class="p-4 text-right">Rp ${product.price.toLocaleString('id-ID')}</td>
                    <td class="p-4 text-right">Rp ${total.toLocaleString('id-ID')}</td>
                </tr>
            `;
        }
    });
    const total = subtotal + SHIPPING_COST;
    summaryDiv.innerHTML = `
        <div class="w-full sm:w-1/2 md:w-1/3 space-y-3">
            <div class="flex justify-between"><span>Subtotal:</span><span>Rp ${subtotal.toLocaleString('id-ID')}</span></div>
            <div class="flex justify-between"><span>Pengiriman:</span><span>Rp ${SHIPPING_COST.toLocaleString('id-ID')}</span></div>
            <div class="flex justify-between font-bold text-lg border-t border-gray-300 pt-3 mt-3"><span>Total:</span><span>Rp ${total.toLocaleString('id-ID')}</span></div>
        </div>
    `;
}