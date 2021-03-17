const product = document.querySelector('.products-center');
const cartItems = document.querySelector('.cart-item');
const cartContent = document.querySelector('.cart-content');
const cartAmount = document.querySelector('.cart-items');
const cartTotalPrice = document.querySelector('.cart-total');
const closeCart = document.querySelector('.close-cart');
const cartBtn = document.querySelector('.cart-btn');
const cartOverlay = document.querySelector('.cart-overlay');
const cartData = document.querySelector('.cart');
const clearCart = document.querySelector('.clear-cart');
let bagBtn = document.querySelector('.bag-btn');






let cart = [];
class Products {
    async getProducts() {
        try {
            const response = await fetch('products.json');
            const data = await response.json();
            const products = data.items.map((item) => {
                const { price, title } = item.fields;
                const { id } = item.sys;
                const { url } = item.fields.image.fields.file;
                return { id, price, title, url };
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}

class DisplayProducts {
    productList(products) {
        let result = '';
        products.forEach((item) => {
            const { url, price, title, id } = item;
            result += `  <article class="product">
                <div class="img-container">
                    <img src=${url} alt="image" class="product-img">
                    <button class="bag-btn" data-id=${id}>
                        <i class="fa fa-cart-plus" aria-hidden="true"></i>
                        add to bag
                    </button>
                </div>
                <h3>${title}</h3>
                <h4>$${price}</h4>
            </article>`
        });
        product.innerHTML = result;
    };
    buttonBag() {
        const btns = [...document.querySelectorAll('.bag-btn')];
        bagBtn = btns;
        btns.forEach((btn) => {
            const id = btn.dataset.id;
            let inCart = cart.find((item) => item.id === id);
            if (inCart) {
                btn.disabled = true;
                btn.innerText = 'in cart';
            }
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id
                e.target.innerText = 'in cart';
                btn.disabled = true;
                let cartItems = { ...Storage.getProducts(id), amount: 1 };
                cart = [...cart, cartItems];
                Storage.saveCart(cart);

                this.addCartItem(cartItems);
                this.addPrice(cart);
                this.showCart();

            });

        });



    }


    addPrice(cart) {
        let tempTotal = 0;
        let cartTotal = 0;
        cart.map(item => {
            tempTotal += item.amount;
            cartTotal += item.amount * item.price;
        });
        cartAmount.innerText = tempTotal;
        cartTotalPrice.innerText = Number.parseFloat(cartTotal).toFixed(2);

    }
    addCartItem(cartItems) {

        let div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
                    <img src=${cartItems.url} alt="cart-product">
                    <div>
                        <h4>${cartItems.title}</h4>
                        <h5>${cartItems.price}</h5>
                        <span class="remove-item" data-id=${cartItems.id}>remove</span>
                    </div>
                    <div>
                        <i class="fa fa-chevron-up" aria-hidden="true" data-id=${cartItems.id}></i>
                        <p class="item-amount">${cartItems.amount}</p>
                        <i class="fa fa-chevron-down" aria-hidden="true" data-id=${cartItems.id}></i>
                    </div>`

        cartContent.appendChild(div);

    }
    setUpAPP() {
        cart = Storage.getCart();
        this.populateCart(cart);

        closeCart.addEventListener('click', () => {
            cartOverlay.classList.remove('transparentBcg');
            cartData.classList.remove('showCart');
        });
        cartBtn.addEventListener('click', () => {
            this.showCart();
        });

    };


    populateCart(cart) {
        this.addPrice(cart);
        cart.map((item) => {
            this.addCartItem(item);
        });

    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartData.classList.add('showCart');
    }
    closeCartOverlay() {
        cartOverlay.classList.remove('transparentBcg');
        cartData.classList.remove('showCart');
    }
    editCart() {

        clearCart.addEventListener('click', () => {
            this.clearCartItems();
        });

        cartContent.addEventListener('click', (e) => {
            let id = e.target.dataset.id;
            let targetData = e.target;
            if (e.target.classList.contains('remove-item')) {
                let data = targetData.parentElement.parentElement;
                this.removeItems(id);
                cartContent.removeChild(data);
                Storage.saveCart(cart);

            }
            if (e.target.classList.contains('fa-chevron-up')) {

                let targetItem = cart.find(item => item.id === id);
                targetItem.amount += 1;
                // console.log(cart); //  i have doubt on this point;
                Storage.saveCart(cart);
                targetData.nextElementSibling.innerText = targetItem.amount;
                this.addPrice(cart);
            }
            if (e.target.classList.contains('fa-chevron-down')) {
                let targetItem = cart.find(item => item.id === id);
                targetItem.amount -= 1;
                if (targetItem.amount > 0) {
                    targetData.previousElementSibling.innerText = targetItem.amount;
                    Storage.saveCart(cart);
                    this.addPrice(cart)
                } else {
                    let data = targetData.parentElement.parentElement;
                    this.removeItems(id)
                    cartContent.removeChild(data);
                }

            }
        })




    }
    clearCartItems() {
        let cartItemId = cart.map(item => item.id);
        cartItemId.forEach(id => {
            this.removeItems(id);
        });
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.closeCartOverlay();


    }

    removeItems(id) {
        cart = cart.filter(item => item.id !== id);
        Storage.saveCart(cart);
        console.log(cart);
        this.addPrice(cart);
        let button = bagBtn.find(btn => btn.dataset.id === id);
        button.disabled = false;
        button.innerHTML = `<i class="fa fa-cart-plus" aria-hidden="true"></i>
                        add to bag`;

    };

};






class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        let cartItem = products.find((item) => item.id === id);
        return cartItem;
    };
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }

}





window.addEventListener('DOMContentLoaded', () => {
    const products = new Products();
    const displayProducts = new DisplayProducts();
    displayProducts.setUpAPP();
    products.getProducts().then((products) => {
        displayProducts.productList(products)
        Storage.saveProducts(products);
    }).then(() => {
        displayProducts.buttonBag();
        displayProducts.editCart();

    });

})
