const {Router} = require('express');

const router = Router();

router.use('/user', require('./user'));
router.use('/list', require('./list'));

module.exports = router;

