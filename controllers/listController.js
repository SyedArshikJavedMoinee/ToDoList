const { request } = require('express');
const model = require('../models');
const listModel = model.List;
const userModel = model.User;

const user = require('./userController.js');



// const createList = async (req,res) => {

//     // const sessionId = req.headers.cookie.split('=')[1];
//     // console.log(sessionId);
//     // const userSession = user.sessions[sessionId];

//     console.log(user.sessions);

//     try{

//         const list1 = await listModel.findOne({where: {UserId: req.params.user_id}});
//         console.log(list1);
//         // console.log(req.params.user_id);

//         if(list1 == null){
//             const list = await listModel.create({
//                 listName: req.body.listName,
//                 shortDesc: req.body.shortDesc,
//                 UserId : req.params.user_id,
//             })
//             res.send('List created successfully');
//         }
//         else{
//             return res.send('List not created successfully');
//         }
    
//     }catch(err){
//         console.log(err);
//     }
// }


// const getList = async (req, res) => {

// }



//module.exports = {createList};