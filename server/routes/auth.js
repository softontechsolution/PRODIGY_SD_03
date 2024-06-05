const router = require('express').Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const User = require("../models/User");

router.post("/login");

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    //Check all the missing fields
    if(!name || !email || !password) return res.status(400).json({ error : `please enter all the required fields`});

    //Check name validation
    if(name.length > 25) return res.status(400).json({ error : `Name can only be less than 25 characters`})

    //Check if email is valid
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!emailReg.test(email)) return res.status(400).json({ error : `please enter a valid email address`});

    //check if password is valid
    if(password.length <= 6) return res.status(400).json({ error : `Password must be atleast 6 character long`})
    try {

        const doesUserAlreadyExist = await User.findOne({email});

        if(doesUserAlreadyExist) return res.status(400).json({ error : `A user with that email [${email}] already exists so please try another one!`});

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword });

        // Save the usser
        const result = await newUser.save();

        result._doc.password = undefined;
        
        return res.status(201).json({ ...result._doc });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error : err.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    //Check all the missing fields
    if(!email || !password) return res.status(400).json({ error : "please enter all the required fields!"});

    //Check if email is valid
    const emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if(!emailReg.test(email)) return res.status(400).json({ error : `please enter a valid email address`});

    try {
        //checking database if user is available
        const doesUserExist = await User.findOne({email});

        //if no user with such email
        if(!doesUserExist) return res.status(400).json({ error : "Invalid email or password!"});

        //if there were any user present
        const doesPasswordMatch = await bcrypt.compare(password, doesUserExist.password);

        //if password does not match
        if(!doesPasswordMatch) return res.status(400).json({ error : "Invalid email or password!"});

        //Creating Login Token
        const payload = { _id: doesUserExist._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h", });

        const user = {...doesUserExist._doc, password: undefined};
        return res.status(200).json({ token, user });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error : err.message });
    }
});

router.get("/me", auth, async (req, res) => {
    return res.status(200).json({ ...req.user._doc });
});

module.exports = router;