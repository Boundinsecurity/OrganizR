import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_organizer_app_12345';

export default async function authMiddleware(req,res,next){
    // Grab the bearer token from authorisation header
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({success: false, message: "Not authorized, token missing"});    
    }

    const token = authHeader.split(' ')[1];

    // Verify and attach the user object 

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');

        if(!user){
            return res.status(401).json({success: false, message: "User not found"});
        }

        req.user=user;
        next();
    } 
    catch (err) {
        console.log("JWT verification failed", err);
        return res.status(401).json({success: false, message: "Token Invalid or expired"});
    }
}
