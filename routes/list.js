const express = require('express');
const router = express.Router();
//const { updateList }  = require('../controllers/userController');


router.get('/', function(req, res){
    res.send('List routes');
})




// router.get('/createList/:id', createList);

// router.get('/createList/:user_id' , createList);


module.exports = router;