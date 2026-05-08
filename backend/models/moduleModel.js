import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for this slide'],
  },
  content: {
    type: String,
    required: [true, 'Please add content to your slide'],
  },
  order: {
    type: Number,
    required: true,
  },
  image: { type: String },
});


const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a module title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a short description for the module'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    
    slides: [slideSchema],
  },
  {
    timestamps: true,
  }
);

const Module = mongoose.model('Module', moduleSchema);
export default Module;