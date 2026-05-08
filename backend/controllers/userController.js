import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';


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
  //Finding all messages where the logged-in user is either the sender or receiver
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }]
  });

  //Extracting unique user IDs from those messages (excluding the logged-in user)
  const contactIds = [...new Set(messages.map(msg => {
    return msg.sender.toString() === req.user._id.toString() 
      ? msg.receiver.toString() 
      : msg.sender.toString();
  }))];

  //Fetch the full user profiles for those specific IDs
  const contacts = await User.find({ _id: { $in: contactIds } }).select('-password');

  res.json(contacts);
});

// @desc    Forgot Password
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // 1. Generate a random reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash the token and set it to the user's database record
  // (We hash it in the DB so if the DB is hacked, the hackers can't use the tokens)
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

  await user.save();

  // 3. Create the Reset URL (pointing to your React frontend)
  // We send the UNHASHED token in the URL so the user can use it
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    // 4. Send the email
    await sendEmail({
      email: user.email,
      subject: 'EduSync Password Reset Token',
      message: message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    // If the email fails to send, clear the token from the database so it can't be used
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  // 1. Hash the token from the URL to compare it to the one in the DB
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // 2. Find the user with that matching token AND check if it hasn't expired yet
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  // 3. Set the new password
  // (Your existing Mongoose pre-save hook will automatically hash this new password for you!)
  user.password = req.body.password;
  
  // 4. Clear the temporary token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

// @desc    Toggle bookmark a module
// @route   PUT /api/users/bookmarks/:moduleId
// @access  Private
export const toggleBookmark = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const moduleId = req.params.moduleId;

  // Check if the module is already in the array
  const isBookmarked = user.bookmarkedModules.includes(moduleId);

  if (isBookmarked) {
    // If it's there, pull (remove) it
    user.bookmarkedModules.pull(moduleId);
  } else {
    // If it's not there, push (add) it
    user.bookmarkedModules.push(moduleId);
  }

  await user.save();

  // Return the updated array so the frontend can immediately update the UI
  res.status(200).json(user.bookmarkedModules);
});

// @desc    Get user's bookmarked modules
// @route   GET /api/users/bookmarks
// @access  Private
export const getBookmarks = asyncHandler(async (req, res) => {
  // Find the user, and "populate" the bookmarkedModules array with the actual module data
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarkedModules',
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user.bookmarkedModules);
});