const express = require('express')
const User = require('../models/User');
const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); //to generate login key(jwt = jsonwebtoken)
var fetchuser = require('../middleware/fetchuser')

const router = express.Router()
const JWT_SECRET = '$eCrET' //JWT Secret

// ROUTE 1: Create a user using POST at path "/api/auth/createUser". Doesn't require auth
router.post('/createUser', [
    //validations
    body('email','Enter a valid email').isEmail(),
    body('name','Name should include atleast 3 characters').isLength({min:3}),
    body('password','Password should include atleast 8 characters').isLength({min:8})
], async (req,res)=>{
    //get errors from validations written above
    const errors = validationResult(req);
    //if there exist errors, return result with statuscode 400 and error array where each element is error of every failed validation
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    //Check whether the user with same email exists already
    try{
        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({errors: "User with the email you provided already exists!"})
        }
        //hash the password
        const salt = await bcrypt.genSalt(10); //generate salt
        secPass = await bcrypt.hash(req.body.password, salt); //hash the password
        //Create new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        })
        
        //Generating auth token
        const data = {
            user:{
                id: user.id  //Including user id to make it easy to fetch user from db
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET); //sign the token

        console.log("User Added!")
        res.json({authToken})
    }
    catch(error){
        console.log(error.message);
        res.status(500).send("Internal Server Error!")
    }
})

// ROUTE 2: Authenticate a user using POST at path "/api/auth/login". Doesn't require auth
router.post('/login', [
    //validations
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists()
], async (req,res)=>{
    //get errors from validations written above
    const errors = validationResult(req);
    //if there exist errors, return result with statuscode 400 and error array where each element is error of every failed validation
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {email,password} = req.body
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Username or passsword is incorrect!"});
        }
        //compare password entered by user with password in database
        const passswordCompare = await bcrypt.compare(password,user.password);
        if(!passswordCompare){
            return res.status(400).json({error:"Username or passsword is incorrect!"});
        }
        //return user data in response
        const data = {
            user:{
                id: user.id  //Including user id to make it easy to fetch user from db
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET); //sign the token
        console.log("User "+user.email+" logged in succesfully")
        res.json({authToken}) //send the token in response
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error!")
    }
})

// ROUTE 3: Get Logged in user details using POST at path "/api/auth/getUser". Login Required.
router.post('/getUser', fetchuser, async (req,res)=>{
    try{
        console.log("Getting User ID")
        const userId = req.user.id;
        console.log("Got user id "+userId)
        //find user and select all details except password
        const user = await User.findById(userId).select("-password");
        res.send(user);
    }
    catch(error){
        console.error(error.message);
        res.send()
    }
})

module.exports = router;