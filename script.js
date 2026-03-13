document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = menuToggle.querySelector('i');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        
        // Change icon from bars to x
        if (mobileMenu.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
        } else {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking a link
    const menuLinks = document.querySelectorAll('.mobile-menu ul li a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        });
    });

    // Cart Badge
    const cartBadge = document.querySelector('.cart-badge');

    // ======= CART STATE =======
    const cart = [];
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsEl = document.getElementById('cart-items');
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartFooterEl = document.getElementById('cart-footer');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const cartCloseBtn = document.getElementById('cart-close');
    const cartIconBtn = document.querySelector('.cart-icon');

    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    cartIconBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    function updateBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function addToCart(name, price, quantity, image) {
        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ name, price, quantity, image });
        }
        checkEasterEgg(quantity);
        updateBadge();
        renderCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateBadge();
        renderCart();
    }

    function updateQuantity(index, delta) {
        let newQty = cart[index].quantity + delta;
        if (newQty <= 0) {
            removeFromCart(index);
            return;
        }
        if (newQty > 50 && newQty !== 67) {
            newQty = 50; // Cap at 50 in the sidebar
        }
        cart[index].quantity = newQty;
        checkEasterEgg(newQty);
        updateBadge();
        renderCart();
    }

    function renderCart() {
        const isEmpty = cart.length === 0;
        
        cartItemsEl.style.display = isEmpty ? 'none' : 'block';
        cartEmptyEl.style.display = isEmpty ? 'flex' : 'none';
        cartFooterEl.style.display = isEmpty ? 'none' : 'block';

        // Build items HTML
        cartItemsEl.innerHTML = cart.map((item, i) => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-item-qty-btn" onclick="window._cartMinus(${i})">-</button>
                    <input type="number" class="cart-item-qty" value="${item.quantity}" min="1" onchange="window._cartInput(${i}, this.value)">
                    <button class="cart-item-qty-btn" onclick="window._cartPlus(${i})">+</button>
                </div>
                <button class="cart-item-remove" onclick="window._cartRemove(${i})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Update totals
        const total = getCartTotal();
        cartSubtotalEl.textContent = `$${total.toFixed(2)}`;
        cartTotalEl.textContent = `$${total.toFixed(2)}`;
    }

    // Expose cart functions globally for inline onclick handlers
    window._cartMinus = (i) => updateQuantity(i, -1);
    window._cartPlus = (i) => updateQuantity(i, 1);
    window._cartRemove = (i) => removeFromCart(i);
    window._cartInput = (i, val) => {
        let newQty = parseInt(val);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        if (newQty > 50 && newQty !== 67) newQty = 50; // Cap at 50 in the sidebar
        cart[i].quantity = newQty;
        checkEasterEgg(newQty);
        updateBadge();
        renderCart();
    };

    // Initial render
    renderCart();
    const qtyModal = document.getElementById('qty-modal');
    const modalSelectionView = document.getElementById('modal-selection-view');
    const modalSuccessView = document.getElementById('modal-success-view');
    const modalTitle = document.getElementById('modal-product-title');
    const modalQtyValue = document.getElementById('modal-qty-value'); // Now an input
    const modalImg = document.getElementById('modal-product-img');
    const modalMinus = document.getElementById('modal-minus');
    const modalPlus = document.getElementById('modal-plus');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    
    let currentBtn = null;
    let currentProductData = null;

    // Reset Modal View Helper
    function resetModal() {
        modalSelectionView.style.display = 'block';
        modalSuccessView.style.display = 'none';
        modalConfirm.textContent = 'Confirmar';
        modalConfirm.style.pointerEvents = 'auto';
    }

    // Manual Modal Input Validation & Enter Key Support
    modalQtyValue.addEventListener('change', () => {
        let val = parseInt(modalQtyValue.value);
        if (isNaN(val) || val < 1) modalQtyValue.value = 1;
    });

    modalQtyValue.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent accidental form submissions if any
            let val = parseInt(modalQtyValue.value);
            if (isNaN(val) || val < 1) modalQtyValue.value = 1; // Validate before confirming
            modalConfirm.click();
        }
    });

    // Global Enter Key Support for Modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && qtyModal.classList.contains('active') && modalSelectionView.style.display !== 'none') {
            // If the event didn't originate from the input itself (which we already handle)
            if (e.target !== modalQtyValue) {
                e.preventDefault();
                modalConfirm.click();
            }
        }
    });

    // Show Modal on "Añadir al Carrito"
    const addBtns = document.querySelectorAll('.add-to-cart');
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            const title = card.querySelector('h3').textContent;
            const priceText = card.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            
            // Extract image URL from background-image
            const imgEl = card.querySelector('.product-img');
            const bgImg = getComputedStyle(imgEl).backgroundImage;
            const imgUrl = bgImg.replace(/url\((['"])?(.*?)\1\)/, '$2');
            
            currentBtn = btn;
            currentProductData = { name: title, price, image: imgUrl };
            
            // Setup Modal
            modalTitle.textContent = title;
            modalImg.src = imgUrl;
            modalQtyValue.value = 1; // Now .value instead of .textContent
            
            resetModal();
            qtyModal.classList.add('active');
        });
    });

    // Modal Controls
    modalMinus.addEventListener('click', () => {
        let val = parseInt(modalQtyValue.value);
        if (val > 1) modalQtyValue.value = val - 1;
    });

    modalPlus.addEventListener('click', () => {
        let val = parseInt(modalQtyValue.value);
        modalQtyValue.value = val + 1;
    });

    modalCancel.addEventListener('click', () => {
        qtyModal.classList.remove('active');
    });

    modalConfirm.addEventListener('click', () => {
        const quantity = parseInt(modalQtyValue.value);

        if (quantity > 50 && quantity !== 67) {
            const wholesale = confirm("¿Deseas pedir mayoreo? Contamos con descuentos especiales para compras de más de 50 piezas.");
            if (wholesale) {
                qtyModal.classList.remove('active');
            }
            return;
        }

        // Phase 1: Show spinner on button
        modalConfirm.innerHTML = '<span class="btn-spinner"></span>';
        modalConfirm.style.pointerEvents = 'none';

        // Phase 2: After brief processing, switch to success view
        setTimeout(() => {
            checkEasterEgg(quantity);

            // Add to cart using the cart system
            if (currentProductData) {
                addToCart(
                    currentProductData.name,
                    currentProductData.price,
                    quantity,
                    currentProductData.image
                );
            }
            
            // Switch to Success View
            modalSelectionView.style.display = 'none';
            modalSuccessView.style.display = 'block';
            
            // Phase 3: Auto close modal after showing success
            setTimeout(() => {
                qtyModal.classList.remove('active');
                
                // Feedback on original button
                if (currentBtn) {
                    const originalText = currentBtn.textContent;
                    currentBtn.style.backgroundColor = '#4CAF50';
                    currentBtn.textContent = '¡Añadido!';
                    
                    setTimeout(() => {
                        currentBtn.style.backgroundColor = '';
                        currentBtn.textContent = originalText;
                    }, 2000);
                }
            }, 1500);
        }, 800);
    });

    // Close modal on overlay click
    qtyModal.addEventListener('click', (e) => {
        if (e.target === qtyModal) {
            qtyModal.classList.remove('active');
        }
    });

    // Overlapping Carousel Logic
    const cards = document.querySelectorAll('.product-card');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach((card, index) => {
            // Remove all positioning classes
            card.classList.remove('active', 'next-1', 'next-2', 'prev-1');
            
            // Calculate relative position (-1, 0, 1, 2, etc)
            // Using modulo math to handle wrapping around the end/beginning
            let diff = index - currentIndex;
            
            if (diff < 0) {
                 diff += cards.length;
            }

            // Assign classes based on relative position
            if (diff === 0) {
                card.classList.add('active');
            } else if (diff === 1) {
                card.classList.add('next-1');
            } else if (diff === 2) {
                card.classList.add('next-2');
            } else if (diff === cards.length - 1) {
                card.classList.add('prev-1');
            }
        });
    }

    if(btnNext && btnPrev && cards.length > 0) {
        btnNext.addEventListener('click', () => {
             currentIndex = (currentIndex + 1) % cards.length;
             updateCarousel();
        });
        
        btnPrev.addEventListener('click', () => {
             currentIndex = (currentIndex - 1 + cards.length) % cards.length;
             updateCarousel();
        });
        
        // Initialize
        updateCarousel();
    }

    // --- Easter Egg Logic ---
    function triggerEasterEgg() {
        const overlay = document.getElementById('easteregg-overlay');
        if (!overlay || overlay.classList.contains('active')) return;
        
        overlay.classList.add('active');
        
        // Play Party Sound (Web Audio API)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const audioCtx = new AudioContext();
            function playNote(frequency, startTime, duration) {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTime);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start(audioCtx.currentTime + startTime);
                oscillator.stop(audioCtx.currentTime + startTime + duration);
            }
            // Happy "Ta-da!" melody
            playNote(523.25, 0, 0.2); // C5
            playNote(659.25, 0.2, 0.2); // E5
            playNote(783.99, 0.4, 0.4); // G5
            playNote(1046.50, 0.8, 0.6); // C6
        }

        // Confetti Logic
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const colors = ['#ff5500', '#2ecc71', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6'];

        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * 360,
                spin: Math.random() * 0.2 - 0.1
            });
        }

        let animationId;
        function animateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.speed;
                p.angle += p.spin;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
                
                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
            });
            animationId = requestAnimationFrame(animateConfetti);
        }
        animateConfetti();

        // Close logic
        const closeHandler = () => {
            overlay.classList.remove('active');
            setTimeout(() => {
                cancelAnimationFrame(animationId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, 500); // Wait for CSS transition to finish 
            window.removeEventListener('resize', resizeCanvas);
            overlay.removeEventListener('click', closeHandler);
        };
        
        // Auto-close after 3 seconds
        setTimeout(closeHandler, 3000);
        
        // Or close on click
        overlay.addEventListener('click', closeHandler);
    }

    function checkEasterEgg(qty) {
        if (qty === 67) {
            triggerEasterEgg();
        }
    }

});
