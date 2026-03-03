const express = require('express');
const router = express.Router();
const { admin } = require('../middleware/auth');

router.get('/', (req, res) => {
    res.send('This is admin page.')
});


module.exports = router;