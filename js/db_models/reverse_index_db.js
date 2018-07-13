const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;


const reverseIndex = new Schema({
    keyword: { // genre, meta,
        type:String,
        required: true,
        unique: true
    },
    counter:{
        type:Number,
        default:1,
    },
    status:{
        type: Number, 
        default: 99
    },
    contentids:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'content', // is from the content collection
    }],
},{
    usePushEach:true
});
reverseIndex.index({counter: -1});

const ReverseIndexes = mongoose.model("reverseindex", reverseIndex);
module.exports = ReverseIndexes;