var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// POST tạo inventory thủ công cho product
router.post('/', async function (req, res, next) {
    try {
        let { product } = req.body;
        let existing = await inventoryModel.findOne({ product });
        if (existing) return res.status(400).send({ message: 'Inventory đã tồn tại cho product này' });

        let newInventory = new inventoryModel({ product });
        await newInventory.save();
        res.send(newInventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET all inventories (join với product)
router.get('/', async function (req, res, next) {
    try {
        let result = await inventoryModel.find().populate({
            path: 'product',
            select: 'title slug price'
        });
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET inventory by ID (join với product)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await inventoryModel.findById(req.params.id).populate({
            path: 'product',
            select: 'title slug price'
        });
        if (!result) return res.status(404).send({ message: 'Inventory not found' });
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: 'Inventory not found' });
    }
});

// POST add_stock - tăng stock
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).send({ message: 'quantity phải > 0' });

        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });

        inventory.stock += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST remove_stock - giảm stock
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).send({ message: 'quantity phải > 0' });

        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        if (inventory.stock < quantity) return res.status(400).send({ message: 'Không đủ stock' });

        inventory.stock -= quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST reservation - giảm stock, tăng reserved
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).send({ message: 'quantity phải > 0' });

        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        if (inventory.stock < quantity) return res.status(400).send({ message: 'Không đủ stock để reservation' });

        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST sold - giảm reserved, tăng soldCount
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!quantity || quantity <= 0) return res.status(400).send({ message: 'quantity phải > 0' });

        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        if (inventory.reserved < quantity) return res.status(400).send({ message: 'Không đủ reserved để sold' });

        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
