const https = require('https');
const http = require('http');
const fs = require('fs');
const contentDB = require('./db_models/content_db');
const metaDB = require('./db_models/meta_db');
const EventEmitter = require('events');


const mongoose = require('mongoose');
const bluebird = require('bluebird');
mongoose.Promise = bluebird;
const mongodb_url = require('./config').mongodb_url;
const mongodb_option = require('./config').mongodb_option;
const connect_ = mongoose.connect(mongodb_url, {});

function connect(callback){
    connect_.then((db)=>{
        console.log("[mongodb] connected correctly to server");
        callback();
    }, (err)=>{
        console.log("[mongodb] connection failed")
        console.log(err);
    });
}
function disconnect(){
    mongoose.connection.close();
}
function getContents(options, callback){
    contentDB.find({}, null, options, (err, contents)=>{
        if(err){
            callback({success: false, reasons:[err.message]});
        }else{
            callback({success: true, reasons:[], value: contents});
        }
    });
}
function getStarnames(options, callback){
    metaDB.find({field: 'starname'}, null, options, (err, items)=>{
        if(err){
            callback({success: false, reasons:[err.message]});
        }else{
            callback({success: true, reasons:[], value: items});
        }
    });
}
function donwloadImage(url, to, filename, callback){
    let protocol_http_ = url.indexOf('https') === -1 ? http:https;
    const file = fs.createWriteStream(to + '/' + filename);
    protocol_http_.get(url, function(response) {   
        if (response.statusCode !== 200) {
            callback({success: false, reasons:['Invalid status code']});
        }else{
            response.pipe(file);
            response.on('end', ()=>{
                callback();
            });
        }
    });
}
/**
 * A scheduler function that start #numWorker workers to run the task function:
 * @argument arr A array of Item that is the input of the task
 * @argument numWorker Specify the number of workers
 * @argument task A function that takes an Item as input and a callback function
 * @argument callback A callback will be trigger when all task are done.
 * 
 * The task function's callback argument task an optional error as input. Error message will be 
 * record in an array, and gives to the final callback function.
 * The callback argument task an object input {success: true|false, [reason:[string]]}
 */
function scheduler(arr, numWorker, task, callback){
    const sche = new EventEmitter();
    let error_message = [];
    let worker_counter = 0;
    sche.once('done', ()=>{
        if(error_message.length === 0){
            callback({success: true});
        }else{
            callback({success: false, reason: error_message});
        }
    });

    sche.on('worker_complete', ()=>{
        worker_counter ++;
        if(worker_counter === numWorker){
            sche.emit('done');
        }
    });

    sche.on('next', (i)=>{
        if(i >= arr.length){
            sche.emit('worker_complete');
        }else{
            task(arr[i], (err_or_result)=>{
                if(err_or_result){
                    if(typeof err_or_result.message === 'string'){
                        // err
                        error_message.push(err_or_result.message);
                    }else if(err_or_result.success === false && err_or_result.reasons){
                        error_message = error_message.concat(err_or_result.reasons);
                    }  
                }
                sche.emit('next', i+numWorker);
            }); 
        }
    });

    let temp_i = 0;
    while(temp_i < numWorker){
        sche.emit('next', temp_i);
        temp_i++;
    }
}
module.exports.connect = connect;
module.exports.disconnect = disconnect;
module.exports.scheduler = scheduler;
module.exports.getContents = getContents;
module.exports.getStarnames = getStarnames;
module.exports.donwloadImage = donwloadImage;