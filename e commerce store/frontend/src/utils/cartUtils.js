export const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
};

export const updateCart = (state) => {
    // Calculate items price
    const itemsPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );
    state.itemsPrice = addDecimals(itemsPrice);

    // Calculate shipping price (If order is over $100 then free, else $10 shipping)
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    state.shippingPrice = addDecimals(shippingPrice);

    // Calculate tax price (15% tax)
    const taxPrice = 0.15 * itemsPrice;
    state.taxPrice = addDecimals(taxPrice);

    // Calculate total price
    const totalPrice = Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice);
    state.totalPrice = addDecimals(totalPrice);

    localStorage.setItem('cart', JSON.stringify(state));

    return state;
};
