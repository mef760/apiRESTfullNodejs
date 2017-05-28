'use strict'
const mongoose= require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')

const validatePass =  { 
    validator: function(p){ return this.password_confirmation == p}, 
    message: "Las contraseñas no son iguales"
}
var UserSchema = Schema({
    email: { type: String, unique: true, lowercase: true, required: true, minlength: 8 },
    displayName: {type:String, required: true},
    avatar: String,
    password: { type:String, minlength: 6, validate: validatePass }, //{ type: String, select: false},
    signupDate:  { type: Date, default: Date.now()},
    lastLogin: Date,
    address: String,
    telephone: String,
    mobile: String,
})
UserSchema.virtual("password_confirmation").get(function(){ return this.value }
    ).set( function(passwordconf){ this.value=passwordconf })

UserSchema.plugin(uniqueValidator)

UserSchema.pre('save', function(next){
    let user= this
    if(!user.isModified('password')) return next()

    bcrypt.genSalt(10,(err,salt)=>{
        if(err) return next(err)
        bcrypt.hash(user.password,salt,null,(err,hash)=>{            
            if (err) return next(err)
            user.password = hash
            next()
        })
    })
})
UserSchema.methods.comparePassword = function(candidate, cb){
    bcrypt.compare(candidate, this.password, (err,isMatch)=>{
        if (err) return cb(err)
        cb(null, isMatch)
    })
}
UserSchema.methods.gravatar = function(){
    if (!this.email) return 'https://gravatar.com/avatar/?s=2006d=retro'

    const md5= crypto.createHash('md5').update(this.email).digest('hex')
    return `https://gravatar.com/avatar/${md5}?s=2006d=retro`
}

module.exports = mongoose.model('User', UserSchema)