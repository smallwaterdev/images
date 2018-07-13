const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;


// db.genres.createIndex({name:1, contentId:1}, {unique:true})
// db.genres.createIndex({name:1, duration:-1})
// db.genres.createIndex({name:1, view:-1})
// db.genres.createIndex({name:1, favorite:-1})
// db.genres.createIndex({name:1, rating:-1})
// db.genres.createIndex({name:1, releaseDate:-1})
const genre = new Schema({
    name: { // big tits
        type:String,
        required: true
    },
    contentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'content', // is from the content collection
    },
    profile_url:{
        type:String,
        default:""
    },
    count: {
        type:Number,
        default:0
    }, // lazy update
    status:{
        type:Number,
        default:99
    },
    duration:{
        type:Number,
        default:0
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
    }
},{

    timestamps: true,
    // timestamps will insert two field, updatedAt and createdAt:
    // the values are ISODate object
    usePushEach:true
});
genre.index({name:1, contentId:1}, {unique:true});
genre.index({name:1, duration:-1});
genre.index({name:1, view:-1});
genre.index({name:1, favorite:-1});
genre.index({name:1, rating:-1});
genre.index({name:1, releaseDate:-1});

var Genres = mongoose.model("genre", genre); // Dish => Dishes automatically.
module.exports = Genres;