"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongo_1 = require("../mongo");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.query;
        const db = (0, mongo_1.getDb)();
        const profiles = db.collection('profiles');
        if (user_id) {
            const profile = await profiles.findOne({ user_id: user_id.toString() });
            return res.json({ data: profile });
        }
        const all = await profiles.find().toArray();
        res.json({ data: all });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error' });
    }
});
exports.default = router;
