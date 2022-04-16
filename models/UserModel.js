const crypto = require("crypto");
const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"]
    },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user"
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: [2, "Password must be more than 8 characters in length"],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm password"],
      validate: {
        // only works on create and save
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same"
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    photo: String
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  //1 -  only runs if password was modified
  if (!this.isModified("password")) return next();
  // 2 - hash password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  //3 - delete passwordConfirm field
  this.passwordConfirm = undefined;
  // 4 - next()
  next();
});

// compare passwords
UserSchema.methods.comparePasswords = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// DID PASSWORD CHANGE?
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};
// Reset token
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 + 60 + 1000;
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
