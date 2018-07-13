const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
/**
 * _id is unique and used as the reference key for star and director collections.
 * (Because the number of items for genre and studio is relatively big, population is not employeed for those two)
 * indexUrl is the primary reference for finding a video, it is the link of the origin page.
 *      (Should not preceive by front-end users)
 * effective is a boolean value that indicates if this item can be used. 
 * 
 */

const VideoUrl = new Schema({
    resolution: {
        type:String,
        required: true
    },
    videoUrl:{
        type:String,
        required: true
    },
});
/**
 * db.contents.createIndex({view:-1})
 * db.contents.createIndex({duration:-1})
 * db.contents.createIndex({rating:-1})
 * db.contents.createIndex({favorite:-1})
 * db.contents.createIndex({releaseDate:-1})
 */
const content = new Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        default:mongoose.Types.ObjectId(),
    },
    domain: { // javfinder.is
        type:String,
        required: true
    },
    index:{ // ABC-123
        type:String,
        default:"unknown"
    },
    indexUrl:{ //Key for searching
        type: String, // page url
        required: true,
        unique: true
    },
    imgSummaryUrl:{
        type: String, 
        default: ""
    },
    imgPreviewUrls:{
        type: [String],
        default:[]
    },
    title:{
        type: String, 
        required: true
    },
    starnames:{
        type: [String],
        default: []
    },
    genres:{ // big tits, blowjob, deep throat
        type: [String],
        default: []
    },
    studio:{
        type: String, 
        default:"unknown"
    },
    director:{
        type: String,
        default:"unknown"
    },
    videoDomain:{
        type: String,                                   // {"domain":"", // video holder domain, e.g. openload, ...
        default: "unknown"              // "url":""}
    },
    videoUrl:{
        type:String,
        default:""
    },
    videoUrls:[VideoUrl],

    duration:{
        type: Number,
        default:0
    },
    notes:{ 
        type: String, // json string
        default:""
    },
    favorite:{
        type:Number,
        default:0
    },
    rating:{
        type:Number,
        default:0
    },
    view:{
        type:Number,
        default:0
    },
    releaseDate:{
        type:Date,
        default: Date.now
    },
    status:{
        type: Number,
        default: 99 // 99 is good
    }
},{
    timestamps: true,
    // timestamps will insert two field, updatedAt and createdAt:
    // the values are ISODate object
    usePushEach:true
});

content.index({view:-1});
content.index({duration:-1});
content.index({rating:-1});
content.index({favorite:-1});
content.index({releaseDate:-1});

const Contents = mongoose.model("content", content); // Dish => Dishes automatically.
module.exports = Contents;