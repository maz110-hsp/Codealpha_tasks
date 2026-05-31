import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

const paymentMethods = ['Cash on Delivery', 'Bank Transfer', 'Credit/Debit Card'];

const getPaymentDetails = (paymentMethod, paymentDetails = {}) => {
    if (paymentMethod === 'Cash on Delivery') {
        return {
            provider: 'cash',
            status: 'Due on delivery',
            instructions: 'Collect the full order amount when the shipment is handed to the customer.',
        };
    }

    if (paymentMethod === 'Bank Transfer') {
        return {
            provider: 'bank',
            status: paymentDetails.reference ? 'Transfer reference submitted' : 'Awaiting transfer',
            bankName: paymentDetails.bankName || process.env.BANK_NAME || 'Demo Commerce Bank',
            accountTitle: paymentDetails.accountTitle || process.env.BANK_ACCOUNT_TITLE || 'PROStore Pvt Ltd',
            accountNumber: paymentDetails.accountNumber || process.env.BANK_ACCOUNT_NUMBER || 'PK00-DEMO-0000-0000',
            reference: paymentDetails.reference || '',
            instructions: 'Transfer the total amount and keep your bank receipt for manual verification.',
        };
    }

    return {
        provider: 'card',
        status: 'Awaiting card authorization',
        cardBrand: paymentDetails.cardBrand || '',
        cardLast4: paymentDetails.cardLast4 || '',
        instructions: 'Authorize the card payment from the order detail page.',
    };
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentDetails,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else if (!paymentMethods.includes(paymentMethod)) {
        res.status(400);
        throw new Error('Unsupported payment method');
    } else {
        const order = new Order({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x._id,
                _id: undefined,
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            paymentDetails: getPaymentDetails(paymentMethod, paymentDetails),
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to view this order');
        }
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            res.status(401);
            throw new Error('Not authorized to update this order');
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id || `${order.paymentMethod}-${Date.now()}`,
            status: req.body.status || 'APPROVED',
            update_time: req.body.update_time || new Date().toISOString(),
            email_address: req.body.payer?.email_address || order.user?.email || '',
        };
        const existingPaymentDetails = order.paymentDetails?.toObject
            ? order.paymentDetails.toObject()
            : (order.paymentDetails || {});

        order.paymentDetails = {
            ...existingPaymentDetails,
            status: order.paymentResult.status,
            cardBrand: req.body.cardBrand || order.paymentDetails?.cardBrand,
            cardLast4: req.body.cardLast4 || order.paymentDetails?.cardLast4,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders,
    updateOrderToDelivered,
};
