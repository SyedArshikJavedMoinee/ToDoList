const express = require('express');
const router = express.Router();
//const { updateList }  = require('../controllers/userController');


router.get('/', function(req, res){
    res.send('List routes');
})

router.post('/createLiistatd', function(req, res){
    res.send('List created');
})

router.delete('/deleteListt', function(req, res){
    res.send('List deleted');
})




// router.get('/createList/:id', createList);

// router.get('/createList/:user_id' , createList);


module.exports = router;