const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Name is required"],
        trim:true,
        minLength:[3,"Name must be at least 3 characters long"]
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        trim:true,
        unique:[true,"Email already exists"],
        lowercase:true,
    },
    profileImage:{
        type:String,
        trim:true,
        default:''
    }
});


userSchema.pre("save",async function(){
    if(this.profileImage) return;
    this.profileImage = `https://api.dicebear.com/9.x/initials/svg?seed=${this.username}`
});

module.exports = mongoose.model("User",userSchema);