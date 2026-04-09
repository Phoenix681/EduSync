import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';


export const registerUser = asyncHandler(async(req,res)=>{
    const {name,email,password,role} = req.body;

    const userExists = await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error('User already Exist');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    if(user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: user.getSignedJwtToken(),
        });
    }
    else{
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

export const getContacts = asyncHandler(async (req, res) => {
  // 1. Find all messages where the logged-in user is either the sender or receiver
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }]
  });

  // 2. Extract unique user IDs from those messages (excluding the logged-in user)
  const contactIds = [...new Set(messages.map(msg => {
    return msg.sender.toString() === req.user._id.toString() 
      ? msg.receiver.toString() 
      : msg.sender.toString();
  }))];

  // 3. Fetch the full user profiles for those specific IDs
  const contacts = await User.find({ _id: { $in: contactIds } }).select('-password');

  res.json(contacts);
});