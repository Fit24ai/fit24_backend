const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const { GOALS, LEVELS } = require('../utils/constant');

// const userSchema = mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//       validate(value) {
//         if (!validator.isEmail(value)) {
//           throw new Error('Invalid email');
//         }
//       },
//     },
//     password: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 8,
//       validate(value) {
//         if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
//           throw new Error('Password must contain at least one letter and one number');
//         }
//       },
//       private: true, // used by the toJSON plugin
//     },
//     role: {
//       type: String,
//       enum: roles,
//       default: 'user',
//     },
//     isEmailVerified: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// add plugin that converts mongoose to json

const UserGender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      //   required: true,
    },
    lastName: {
      type: String,
      //   required: true,
    },
    email: {
      type: String,
      //   trim: true,
      //   lowercase: true,
      //   required: true,
      //   unique: true,
    },
    mobileNumber: {
      type: String,
      //   required: true,
      //   unique: true,
    },
    password: {
      type: String,
      //   required: true,
    },
    gender: {
      type: String,
      enum: UserGender,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dob: {
      type: String,
    },
    age: {
      type: Number,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    country: {
      type: String,
    },
    address: {
      type: String,
    },
    terraUserId: {
      type: String,
    },
    goal: {
      type: String,
      enum: GOALS,
    },
    level: {
      type: String,
      enum: LEVELS,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
