const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId) => {
return jwt.sign(
  {_id: userId},
  process.env.JWT_SECRET,
  {expiresIn: '7d'}
);
};

exports.register = async (req, res) => {
  try {
    const { email, password, name }=req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(409).json({message: 'email already exists'});
    }
    const hashedPassword =await bcrypt.hash(password,10);
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
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,  
        message: 'Email and password are required'
      });
    } 
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,  
        message: 'Invalid credentials'  
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,  
        message: 'Invalid credentials'  
      });
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

exports.me = async (req, res) => {
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
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
      error: error.message
    });
  }
};