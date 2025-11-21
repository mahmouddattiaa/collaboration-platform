const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const signToken = (userId) => {
    return jwt.sign(
        { _id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name
        });
        const token = signToken(newUser._id);
        res.status(201).json({
            success: true,
            message: 'User Registered Successfully',
            user: {
                _id: newUser._id,
                email: newUser.email,
                name: newUser.name
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Email and password are required');
        }
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }
        const token = signToken(user._id);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

exports.me = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                email: req.user.email,
                name: req.user.name
            }
        });
    } catch (error) {
        next(error);
    }
};