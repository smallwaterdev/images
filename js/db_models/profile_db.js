const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;


const profileImage = new Schema({
    field: { // genre, contentid, star, studio ...
        type:String,
        required: true,
    },
    value:{ // big-tits, 24343d3e3.., 
        type:String,
        required:true,
    },
    status:{
        type: Number, 
        default: 99
    },
    profile_url:{
        type: String,
        default:""
    },
    intro:{
        type:String,
        default:""
    }
},{
    usePushEach:true
});
profileImage.index({field: 1, value: 1}, {unique: true});

const ProfileImages = mongoose.model("profileimage", profileImage);
module.exports = ProfileImages;