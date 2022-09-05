const { request, response } = require('express');
const model = require('../models');
const userModel = model.Users;
const listModel = model.List;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY ='HELLO';
const uuidv4 = require('uuid').v4;


var sessions = {};

const signUp = async (req,res) => { 

    //existing user check
    //hashed password
    //user create
    //token

    const {username, email, password} = req.body;

    try{
        const existingUser = await userModel.findOne({where: {email: email} })
        if(existingUser){
            return res.status(409).json({message: "User already exists"})
        }

        console.log({data: email});
        const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

        console.log('hello ');


        const result = await userModel.create({
            username: username,
            email: email,
            password: hashedPassword,
        })

        const token = jwt.sign({email:result.email, id: result._id }, SECRET_KEY)
        res.status(201).json({user: result, token: token});

        // req.session.email = req.body.email;
    }catch(err){
        console.log(err);
        res.send("Something went wrong");
    }
    
}

const signIn = async (req,res)=>{
    const {email, password} = req.body;
    // req.session.email = req.body.email;
    // req.session.save();
    
    
    try{
        const existingUser = await userModel.findOne({where: {email: email} })

        console.log(existingUser.id);

        const id = existingUser.id;

        if(!existingUser ){
            return res.status(404).json({message: "User not found"})
        }
        
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        
        if(!matchPassword){
            return res.status(401).json({message: "Password doesn't match"})
        }
        
        
        const sessionId = uuidv4();
        sessions[sessionId] = { id , email };
        res.set('Set-Cookie', `session=${sessionId}`);
        res.send('success');
        
        const token =  jwt.sign({email:existingUser.email, id: id }, SECRET_KEY );
        // res.cookie('jwt', token, {httpOnly: true});
        
        //res.status(201).json({user: existingUser, token: token});
        
        const userVer =  jwt.verify(token, SECRET_KEY);
        console.log(userVer);
        
    }catch(err){
        console.log(err);
        res.send("Something went wrong");
        
    }
}



const removeUser = async (req,res)=> {
    try{
        const user = await userModel.findOne({where: {id :req.params.id} });

        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        else{
            await userModel.destroy({where: {id: req.params.id}});
            return res.status(200).json({message: "User removed"})
        }
    }catch(err){
        console.log(err);
        res.send("Something went wrong");
    }
}

const allUsers = async (req,res)=> {
    const users = await userModel.findAll({});
    res.send(users);

    console.log(JSON.stringify(users));
}



const createList = async (req,res) => {
    console.log('---------------------------');
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({where: {id: sessions[sessionId].id}});

    console.log(user.id);
    //console.log(userSession);
    console.log(sessions[sessionId].id);
    
    if(sessions[sessionId].id == user.id){
        try{
            const list1 = await listModel.findOne({where: {UserId: user.id}});
        
            if(list1 == null){
                const list = await listModel.create({
                    listName: req.body.listName,
                    shortDesc: req.body.shortDesc,
                    UserId : user.id,
                })
                res.send('List created successfully');
            }
            else{
                return res.send('List not created successfully');
            }
        
        }catch(err){
            console.log(err);
        }
    }else{
        res.send('ID not matched!');
    }
}


const deleteList = async (req,res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({where: {id: sessions[sessionId].id}});
    const list = await listModel.findOne({where: {UserId:sessions[sessionId].id}});

    // console.log(user.id);
    // console.log(userSession);
    // console.log(sessions[sessionId].id);
    const list1 = list.id;

    console.log(list1);
    
    try{
        if(sessions[sessionId].id == user.id){
            const list = await listModel.destroy({where: {id: list1}});
            if(!list){
                return res.send('List not found');
            }
            else{
                return res.send('List deleted successfully');
            }
            
        }else{
            return res.send('Wrong ID');
            }
    }catch(err){
        console.log(err);
    }
}



const findList = async (req,res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({where: {id: sessions[sessionId].id}});
    const list = await listModel.findOne({where: {UserId:sessions[sessionId].id}});

    // console.log(user.id);
    // console.log(userSession);
    // console.log(sessions[sessionId].id);
    const list1 = list.id;

    console.log(list1);
    
    try{
        if(sessions[sessionId].id == user.id){
            const list = await listModel.findOne({where: {id: list1}});
            if(!list){
                return res.send('List not found');
            }else{
                return res.send(list);
            }
            
        }else{
            return res.send('Wrong ID');
            }
    }catch(err){
        console.log(err);
    }
}

const updateList = async (req,res) => {

    try{
        const sessionId = req.headers.cookie.split('=')[1];
        const userSession = sessions[sessionId];
    
        const user = await userModel.findOne({where: {id: sessions[sessionId].id}});
        const list = await listModel.findOne({where: {UserId:sessions[sessionId].id}});
    
        // console.log(user.id);
        // console.log(userSession);
        // console.log(sessions[sessionId].id);
        const list1 = list.id;
    
        console.log(list1);
    
        const update = req.body;

        if(sessions[sessionId].id == user.id){
            await listModel.update(req.body, {where: {id: list1}});
            if(!list){
                return res.send('List not found');
            }else{
                return res.send('List updated successfully');
            }
            
        }else{
            return res.send('Wrong ID');
            }
    }catch(err){
        console.log(err);
    }
}




module.exports = {signUp, signIn, removeUser, allUsers, createList, deleteList, findList, updateList};