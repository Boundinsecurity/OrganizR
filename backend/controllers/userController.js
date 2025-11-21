import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_organizer_app_12345';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

// Register Function
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid Email" });
    }
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already registered" });
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const user = await User.create({ name, email, password: hash })
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

// Login Function
export async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email And Password Are Required" })
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
        const token = createToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

// Get Current User
export async function getCurrentUser(req, res) {
    try {
        const user = req.user; // from middleware
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

// Update User Profile
export async function updateProfile(req, res) {
    try {
        const user = req.user; // from middleware
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and Email are required" });
        }

        // Check if email belongs to someone else
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        user.name = name;
        user.email = email;
        await user.save();

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Profile Update Failed" });
    }
}

// Change Password 
export async function updatePassword(req, res) {
    const user = await User.findById(req.user._id); 
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Current and new password required" });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        return res.status(400).json({ success: false, message: "Current password incorrect" });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password too short" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
}

// Forgot Password - generate token and (in production) send email
export async function forgotPassword(req, res) {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ success: false, message: "Email is required" })

        const user = await User.findOne({ email })
        if (!user) return res.status(200).json({ success: true, message: "If that email is registered, you'll receive reset instructions." })

        // generate token
        const token = crypto.randomBytes(20).toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
        await user.save()

        // In production: send email containing reset link with token.
        // For development convenience we'll return the token in response.
        console.log(`Password reset token for ${email}: ${token}`)

        res.json({ success: true, message: "Password reset token generated. (In production this would be emailed.)", token })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

// Reset Password - validate token and set new password
export async function resetPassword(req, res) {
    try {
        const { token } = req.params
        const { password } = req.body

        if (!token) return res.status(400).json({ success: false, message: "Token is required" })
        if (!password || password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" })

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" })

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        user.password = hash
        user.resetPasswordToken = null
        user.resetPasswordExpires = null
        await user.save()

        res.json({ success: true, message: "Password has been reset. You can now log in." })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Server Error" })
    }
}