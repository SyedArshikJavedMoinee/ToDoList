const jwt = require('jsonwebtoken');
const SECRET_KEY ="HELLO";

function checkAuth(req, res, next){

    try{
        console.log('first');

        const idToken = req.header('Authorization').split(" ")[1];
        console.log('pls');
        
        const decoded = jwt.verify(idToken, SECRET_KEY);
        console.log('ss');
        
        req.userData = decoded;
        console.log('third');
        
        next();
    
    }catch(e){
        
        res.send('Please authenticate');
    }
}

module.exports = {
    checkAuth:checkAuth
}
