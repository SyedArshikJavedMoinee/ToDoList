const { request, response } = require('express');
const model = require('../models');
const userModel = model.Users;
const listModel = model.List;
const itemModel = model.Items;
const verificationModel = model.UserVerification;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const { loggers, Logger } = require('winston');
const SECRET_KEY = 'HELLO';
// const uuidv4 = require('uuid').v4;
const cron = require('node-cron');
let nodemailer = require('nodemailer');
const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const Op = Sequelize.Op;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

var sessions = {};


// let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.AUTH_EMAIL,
//         pass: process.env.AUTH_PASS,
//     }

// })

// transporter.verify((error,success) => {
//     if(error){
//         console.log(error);
//     }else{
//         console.log("Ready for messages");
//         console.log("success");
//     }
// })

const signUp = async (req, res) => {

    //existing user check
    //hashed password
    //user create
    //token
    const { username, email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ where: { email: email } })
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" })
        }

        console.log({ data: email });
        const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

        //console.log('hello ');


        const result = await userModel.create({
            username: username,
            email: email,
            password: hashedPassword,
            verified: false
        })


        const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY)
        res.status(201).json({ user: result, token: token });
        // sendOTPVerifictationEmail({_id, email}, res);
        logger.info('User created successfully');

        // req.session.email = req.body.email;
    } catch (err) {
        logger.error('Error creating user', err);
        res.send("Something went wrong");
    }

}

// const sendOTPVerifictationEmail = async({_id, email}, res)=>{
//     console.log('s');
//     try{
//         const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

//         const mailOptions = {
//             from: process.env.AUTH_EMAIL,
//             to: email,
//             subject: 'Verify your email',
//             html: `<p> Enter <b>${otp}</b> to verify your email</p>`,
//         };

//         const saltRounds = 10;
//         const hashedOTP = await bcrypt.hash(opt, saltRounds);
//         const newOTPVerification = await new UserVerification({
//             userId: _id,
//             uniqueString: hashedOTP,
//             expiresAt: Date.now()+3600000,
//         });

//         await newOTPVerification.save();
//         await transporter.sendMail(mailOptions);
//         res.json({status: 'Pending'})
//     }catch(error){
//         res.json({status: 'Error'})
//     }
// }

const signIn = async (req, res) => {
    const { email, password } = req.body;
    // req.session.email = req.body.email;
    // req.session.save();


    try {
        const existingUser = await userModel.findOne({ where: { email: email } })

        //console.log(existingUser.id);

        const id = existingUser.id;

        if (!existingUser) {
            logger.info('User not found');
            return res.status(404).json({ message: "User not found" })
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            logger.info('Password incorrect');
            return res.status(401).json({ message: "Password doesn't match" })
        }


        const sessionId = uuidv4();
        sessions[sessionId] = { id, email };
        res.set('Set-Cookie', `session=${sessionId}`);
        res.send('Success');
        logger.info('User signed in successfully');
        const token = jwt.sign({ email: existingUser.email, id: id }, SECRET_KEY);
        // res.cookie('jwt', token, {httpOnly: true});

        //res.status(201).json({user: existingUser, token: token});

        const userVer = jwt.verify(token, SECRET_KEY);
        //console.log(userVer);

    } catch (err) {
        logger.error('Error verifying', err);
        res.send("Something went wrong");

    }
}



const removeUser = async (req, res) => {
    try {
        const user = await userModel.findOne({ where: { id: req.params.id } });

        if (!user) {
            logger.info("User not found");
            return res.status(404).json({ message: "User not found" })
        }
        else {
            await userModel.destroy({ where: { id: req.params.id } });
            logger.info("User deleted successfully");
            return res.status(200).json({ message: "User removed" })
        }
    } catch (err) {
        logger.error('Error while deleting user', err);
        res.send("Something went wrong");
    }
}

const allUsers = async (req, res) => {
    const users = await userModel.findAll({});
    logger.info("Users found");
    res.send(users);

    //console.log(JSON.stringify(users));
}



const createList = async (req, res) => {
    console.log('---------------------------');
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });

    //console.log(user.id);
    //console.log(userSession);
    //console.log(sessions[sessionId].id);

    if (sessions[sessionId].id == user.id) {
        try {
            const list1 = await listModel.findOne({ where: { UserId: user.id } });

            if (list1 == null) {
                const list = await listModel.create({
                    listName: req.body.listName,
                    shortDesc: req.body.shortDesc,
                    UserId: user.id,
                })
                logger.info('List created successfully');
                res.send('List created successfully');
            }
            else {
                logger.info('List not created successfully');
                return res.send('List not created successfully');
            }

        } catch (err) {
            logger.error('Error creating list', err);
        }
    } else {
        logger.error('Error');
        res.send('ID not matched!');
    }
}


const deleteList = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });
    const list = await listModel.findOne({ where: { UserId: sessions[sessionId].id } });

    // console.log(user.id);
    // console.log(userSession);
    // console.log(sessions[sessionId].id);
    const list1 = list.id;

    //console.log(list1);

    try {
        if (sessions[sessionId].id == user.id) {
            const list = await listModel.destroy({ where: { id: list1 } });
            if (!list) {
                logger.info('List not found');
                return res.send('List not found');
            }
            else {
                logger.info('List deleted successfully');
                return res.send('List deleted successfully');
            }

        } else {
            logger.error('Error');
            return res.send('Wrong ID');
        }
    } catch (err) {
        logger.error('List not deleted successfully', err);
    }
}



const findList = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });
    const list = await listModel.findOne({ where: { UserId: sessions[sessionId].id } });

    // console.log(user.id);
    // console.log(userSession);
    // console.log(sessions[sessionId].id);
    const list1 = list.id;

    //console.log(list1);

    try {
        if (sessions[sessionId].id == user.id) {
            const list = await listModel.findOne({ where: { id: list1 } });
            if (!list) {
                logger.info('List not found');
                return res.send('List not found');
            } else {
                logger.info('List found');
                return res.send(list);
            }

        } else {
            return res.send('Wrong ID');
        }
    } catch (err) {
        logger.error(err);
    }
}

const updateList = async (req, res) => {

    try {
        const sessionId = req.headers.cookie.split('=')[1];
        const userSession = sessions[sessionId];

        const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });
        const list = await listModel.findOne({ where: { UserId: sessions[sessionId].id } });

        // console.log(user.id);
        // console.log(userSession);
        // console.log(sessions[sessionId].id);
        const list1 = list.id;

        //console.log(list1);

        const update = req.body;

        if (sessions[sessionId].id == user.id) {
            await listModel.update(req.body, { where: { id: list1 } });
            if (!list) {
                logger.info('List not found');
                return res.send('List not found');
            } else {
                logger.info('List updated successfully');
                return res.send('List updated successfully');
            }

        } else {
            return res.send('Wrong ID');
        }
    } catch (err) {
        logger.error(err);
    }
}


const createItem = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });
    const list1 = await listModel.findOne({ where: { UserId: user.id } });
    console.log(user.id);
    console.log(list1.id);

    if (sessions[sessionId].id == user.id) {
        const list = await itemModel.create({
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate,
            completionStatus: req.body.completionStatus,
            completionDateTime: req.body.completionDateTime,
            UserId: user.id,
            ListId: list1.id
        })

        logger.info('Item created successfully');
        console.log(req.body.dueDate);
        return res.send('item created successfully');
    }
    else {
        return res.send('Wrong ID');

    }
}

const deleteItem = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];
    const list2 = await itemModel.findOne({ where: { UserId: sessions[sessionId].id } });
    const uid = list2.UserId;


    if (sessions[sessionId].id == uid) {
        await itemModel.destroy({ where: { id: req.params.id } });
        res.send(`${req.params.id} deleted successfully`);
    }
    else {
        return res.send('Wrong');

    }
}


const getItem = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];
    const list2 = await itemModel.findOne({ where: { UserId: sessions[sessionId].id } });
    const uid = list2.UserId;
    try {
        if (sessions[sessionId].id == uid) {
            const items = await itemModel.findAll({ where: { UserId: uid } });
            return res.status(200).send(items);
        }
        else {
            logger.error('Error');
            return res.send('Wrong');
        }
    } catch (err) {
        logger.error('Error');
        return res.send('Wrong');
    }
}


const updateItem = async (req, res) => {
    try {
        const sessionId = req.headers.cookie.split('=')[1];
        const userSession = sessions[sessionId];

        const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });
        // const list = await listModel.findOne({ where: { UserId: sessions[sessionId].id } });
        const item = await itemModel.findOne({ where: { id: req.params.id } });

        // console.log(user.id);
        // console.log(userSession);
        // console.log(sessions[sessionId].id);
        console.log(item.id);

        if (sessions[sessionId].id == user.id) {
            await itemModel.update(req.body, { where: { id: item.id } });
            if (!item) {
                logger.info('Item not found');
                return res.send('Item not found');
            } else {
                logger.info('Item updated successfully');
                return res.send('Item updated successfully');
            }

        } else {
            logger.error('Error');
            return res.send('Wrong ID');
        }

    }
    catch (err) {
        logger.error('error');
        return res.send('Error');
    }
}


// } catch (err) {
//     logger.error(err);
// }


const getAllItems = async (req, res) => {
    try {
        const items = await itemModel.findAll({});
        logger.info('Success');
        return res.status(200).send(items);
    } catch (e) {
        logger.error('error');
        res.error(e);
    }
}


const sendMail = async (req, res) => {

    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];

    const user = await userModel.findOne({ where: { id: sessions[sessionId].id } });

    console.log(sessions[sessionId].email);

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'kaylin.jast@ethereal.email',
            pass: 'dGtWQQNwTxdKBjXxvr'
        }
    });

    cron.schedule('0 0 * * *', () => {
        transporter.sendMail({
            to: sessions[sessionId].email,
            from: "fromuser@mail.com",
            subject: "Test",
            text: "Content"
        })
    })

    res.send({ message: 'Success' });

}



const countTasks = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];
    const list2 = await itemModel.findOne({ where: { UserId: sessions[sessionId].id } });
    const uid = list2.UserId;
    try {
        if (sessions[sessionId].id == uid) {
            const totalTasks = await itemModel.count({
                where: { UserId: uid }
            })

            const completedTasks = await itemModel.count({
                where: { completionStatus: 1, UserId: uid }
            })

            const remainingTasks = await itemModel.count({
                where: { completionStatus: 0, UserId: uid }
            })
            logger.info('Success');
            return res.status(200).send('Total Task Count: ' + totalTasks + '\nCompleted Tasks Are: ' + completedTasks + '\nRemaining Tasks Are: ' + remainingTasks);
        }
        else {
            logger.error('Error');
            return res.send('Error Occured');
        }
    } catch {
        logger.error('Error');
        return res.send('Error Occured');
    }
}

const notCompletedOnTime = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];
    const list2 = await itemModel.findOne({ where: { UserId: sessions[sessionId].id } });
    const uid = list2.UserId;
    try {
        if (sessions[sessionId].id == uid) {
            const count = await itemModel.count({
                where: {
                    UserId: uid,
                    dueDate: {
                        [Op.lt]: sequelize.col('completionDateTime')
                    }
                }
            })
            logger.info('Success');
            return res.send('ss');
        }
        else {
            logger.error('Error');
            return res.send(err);
        }
    } catch {
        logger.error(err);
        return res.send(err);
    }
}

const average = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];
    const list2 = await itemModel.findOne({ where: { UserId: sessions[sessionId].id } });
    const uid = list2.UserId;

    //yyyy-MM-dd
    const cdt = '2022-09-01';
    try {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        const date1 = new Date(cdt);
        const date2 = new Date(today);
        const diffTime = Math.abs(date1 - date2);

        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (sessions[sessionId].id == uid) {
            const count = await itemModel.count({ where: { UserId: uid, completionStatus: 1 } })
            const avg = count / diffDays;
            logger.info('Success');
            return res.send('Success');
        }
        else {
            logger.error('Error');
            return res.send('error');
        }
    } catch {
        logger.error('Error in the catch block');
        return res.send('error');
    }
}

const subString = async (req, res) => {
    const sessionId = req.headers.cookie.split('=')[1];
    const userSession = sessions[sessionId];
    const list2 = await itemModel.findOne({ where: { UserId: sessions[sessionId].id } });
    const uid = list2.UserId;
    try {
        if (sessions[sessionId].id == uid) {
            const result = await sequelize.query("SELECT Distinct t1.title from items t1, items t2 where t1.id = t2.id AND t1.title LIKE '%fifth%'", { type: QueryTypes.SELECT });
            logger.info('Success');
            return res.status(200).send(result);
        }
        else {
            logger.error('Error');
            return res.send('error');
        }
    } catch {
        logger.error('Error in the catch block');
        return res.send('error');
    }
}

module.exports = {
    signUp, signIn, removeUser, allUsers, createList, deleteList, findList, updateList, createItem, deleteItem, getItem, updateItem,
    getAllItems, sendMail, countTasks, notCompletedOnTime, average, subString
};