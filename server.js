const express = require('express');
const cors = require('cors');
const app = express();
const db = require("./models");
const bcrypt = require('bcrypt');
const auth = require('./middleware/auth');
const logger = require('./logger');
const cookieParser = require('cookie-parser');
// const session = require('express-session');
const bodyParser = require('body-parser');
// const redis = require('redis');
// const redisStore = require('connect-redis')(session);
// const client = redis.createClient();
// client.connect();


// async function run(){
//     const client = redis.createClient();
//     await client.connect();

//     console.log(client.isOpen);

//     await client.disconnect();
// }

// run();


// app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/api', require('./routes/index'));


app.get('/', (req,res) => { 
    res.send('Hello');
})

app.listen(3000, ()=> {
    logger.info('Listening at port 3000');
});


db.sequelize.authenticate().then(()=> { 
    logger.info('Connection successful');
}).catch((err) =>{
    logger.error(err);
})   



