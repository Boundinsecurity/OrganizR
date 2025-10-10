import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_organizer_app_12345';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) =>jwt.sign({id: userId}, JWT_SECRET, {expiresIn: TOKEN_EXPIRES})

// Register Function

export async function registerUser(req,res){
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({success: false, message: "All fields are required"});
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({success: false, message: "Invalid Email"});
    } 
    if(password.length < 8){
        return res.status(400).json({success: false, message: "Password must be atleast 8 characters"});
    }

    try{
        if(await User.findOne({email}))
            return res.status(409).json({success: false, message: "User Already Exist"});
    

        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({name,email,password: hashed});  
        const token = createToken(user._id);
        res.status(201).json({success: true,token , user: {id: user._id, name: user.name, email: user.email} });

    }
    catch(err){
        console.log(err);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

// Login Function

export async function loginUser(req,res){
    const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({success: false, message: "Email And Password Are Required"})
    }

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({success: false, message: "Invalid Credentials"});

        }
        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(401).json({success: false, message: "Invalid Credentials"});
        }
        const token =  createToken(user._id);
        res.json({success: true, token, user: {id: user._id, name: user.name, email: user.email}});
    }

    catch(err){
        console.log(err);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

// Get Current User
export async function getCurrentUser(req,res){
    try {
        const user = await User.findById(req.user.id).select("name email");
        if(!user){
            return res.status(100).json({success: false, message: "User not found"});
        }
        res.json({success: true,user});
    } 
    catch(err){
        console.log(err);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

// Update User

export async function updateProfile(req,res){
    const {name,email} = req.body;
    
    if(!name || !email || !validator.isEmail(email)){
        return res.status(400).json({success: false, message: "Valid name and email required"});
    }

    try {
        const exists = await User.findOne({email, _id: {$ne: req.user.id}});

        if(exists){
            return res.status(409).json({success: false, message:"Email already in use by another account"});
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {name,email},
            {new: true, runValidators: true, select: "name email"}
        );
        res.json({success: true, user});
    } 
    catch(err){
        console.log(err);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

// Change Password

export async function updatePassword(req,res){
    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword || newPassword.length <8){
        return res.status(400).json({success: false, message: "Password Invalid or too short"});
    }

    try {
        const user = await User.findById(req.user.id).select("password");
        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }
        const match = await bcrypt.compare(currentPassword, user.password);
        if(!match){
            return res.status(401).json({success: false, message: "Current passsword incorrect"});

        }
        user.password = await bcrypt.hash(newPassword,10);
        await user.save();
        res.json({success: true,message: "Password Changed"});
    } 
    catch(err){
        console.log(err);
        res.status(500).json({success: false, message: "Server Error"});
    }
}