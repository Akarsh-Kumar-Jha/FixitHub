const mongoose = require("mongoose");
const { generateFromEmail, generateUsername } = require("unique-username-generator");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
        minLength:[3,"Name must be at least 3 characters long"]
    },
    username:{
        type:String,
        trim:true,
        unique:[true,"Username already exists"],
        lowercase:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true,
        unique:[true,"Email already exists"],
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[6,"Password must be at least 6 characters long"]
    }
},{timestamps:true});

userSchema.pre("save",async function(){
    console.log('Unique Username Generating.......... :');
    if(this.username) return
    const usrName = await generateFromEmail(this.email, 3);
    console.log('Unique Username Generated✅ :',usrName);
    this.username = usrName;
});

userSchema.statics.findByEmail = function(email){
    return this.findOne({email});
}
userSchema.statics.findByUsername = function(username){
    return this.findOne({username});
}

module.exports = mongoose.model("User",userSchema);