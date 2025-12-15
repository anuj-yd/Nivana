const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  // ✅ FIX: 'required: true' हटा दिया गया
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true // REMOVED! Validation logic ko code mein handle karenge.
  }, 
  mood: {
    type: String, 
    required: true
  },
  score: {
    type: Number, 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mood', MoodSchema);