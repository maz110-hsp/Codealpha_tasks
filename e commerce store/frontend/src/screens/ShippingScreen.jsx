import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../slices/cartSlice';

const ShippingScreen = () => {
    const cart = useSelector((state) => state.cart);
    const { shippingAddress } = cart;

    const [address, setAddress] = useState(shippingAddress?.address || '');
    const [city, setCity] = useState(shippingAddress?.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
    const [country, setCountry] = useState(shippingAddress?.country || '');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        dispatch(saveShippingAddress({ address, city, postalCode, country }));
        navigate('/payment');
    };

    return (
        <div className="flex justify-center items-center py-10 animate-fade-in relative z-10">
            <div className="glass p-10 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-color to-secondary-color"></div>

                <h1 className="text-4xl font-extrabold mb-8 text-center tracking-tight">
                    Shipping <span className="text-gradient">Information</span>
                </h1>

                <form onSubmit={submitHandler} className="space-y-5">
                    <div>
                        <label className="block text-slate-300 mb-2 font-medium" htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color transition-all shadow-inner"
                            placeholder="Enter address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2 font-medium" htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color transition-all shadow-inner"
                            placeholder="Enter city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2 font-medium" htmlFor="postalCode">Postal Code</label>
                        <input
                            type="text"
                            id="postalCode"
                            className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color transition-all shadow-inner"
                            placeholder="Enter postal code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 mb-2 font-medium" htmlFor="country">Country</label>
                        <input
                            type="text"
                            id="country"
                            className="w-full bg-[#0f172a]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-color focus:ring-1 focus:ring-primary-color transition-all shadow-inner"
                            placeholder="Enter country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-xl mt-4 bg-gradient-to-r from-primary-color to-secondary-color hover:shadow-primary-color/50 hover:scale-[1.02] active:scale-[0.98] text-white"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShippingScreen;
