const mongoose= require('mongoose')
const passportLocalMongoose= require('passport-local-mongoose')


const clientSchema= new mongoose.Schema({
    email:{ 
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    username: {
        type: String,
        required: true
    }
})

clientSchema.plugin(passportLocalMongoose)

module.exports= mongoose.model('Client', clientSchema)