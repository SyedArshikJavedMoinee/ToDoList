const express = require('express');
const router = express.Router();
const userModel = require('../models/users');
const db = require('../config/config.json');
const {createList, signUp, signIn, removeUser, allUsers, deleteList, findList, updateList, createItem, updateItem, deleteItem, getItem, getAllItems, sendMail, countTasks, notCompletedOnTime,
     average, subString} = require('../controllers/userController');
const checkAuthMiddleware = require('../middleware/auth');
const { request } = require('express');

                                                                        //User Routes
router.get('/', (req, res) => {
    res.send('User Routes');
});

router.post('/signUp', signUp);

router.get('/signIn', signIn);

router.delete('/removeUser/:id', removeUser);

router.get('/allUsers', allUsers);

                                                                        //List Routes

router.post('/createList', createList);

router.delete('/deleteList', deleteList);

router.get('/findList', findList);

router.put('/updateList', updateList);

                                                                        //Item Routes

router.post('/createItem', createItem);

router.delete('/deleteItem/:id', deleteItem);

router.get('/getItem', getItem);

router.put('/updateItem/:id', updateItem);

router.get('/getAllItems' , getAllItems);



                                                                        //Custom Query Routes

router.post('/sendMail', sendMail);
router.get('/countTasks' ,countTasks);
router.get('/notCompletedOnTime', notCompletedOnTime);
router.get('/average', average);
router.get('/subString', subString);
// router.get('/secret', checkAuthMiddleware.checkAuth , (req,res,next) => {
//     console.log(req.email);
//     res.send('This is your secret');

// })


module.exports = router;

