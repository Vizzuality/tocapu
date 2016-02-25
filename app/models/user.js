'use strict';

import mongoose from 'mongoose';
import validate from 'mongoose-validator';
import bcrypt from 'bcrypt-nodejs';

const Schema = mongoose.Schema;
const userSchema = new Schema();
const emailValidator = [
  validate({validator: 'isEmail', message: 'Email is not valid.'})
];

userSchema.add({
  email: {type: String, required: true, validate: emailValidator},
  password: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

// Fenerating a hash
userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Checking if password is valid
userSchema.methods.validPassword = password => {
  return bcrypt.compareSync(password, this.password);
};

export default mongoose.model('User', userSchema);
