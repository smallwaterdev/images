
const EventEmitter = require('events');
const fs = require('fs');
const getContents = require('./helper').getContents;
const downloadImage = require('./helper').donwloadImage;
const scheduler = require('./helper').scheduler;
const connect = require('./helper').connect;
const disconnect = require('./helper').disconnect;
connect(()=>{
    getContents({skip:220, limit:200, sort:{releaseDate:-1}}, (results)=>{
        if(results.success){
            scheduler(results.value, 10, (content, __callback__)=>{
                if(content.imgSummaryUrl){
                    console.log('[Downloading...] ' + content.imgSummaryUrl);
                    downloadImage(content.imgSummaryUrl, './content_images', content._id + '.png', __callback__);
                }else{
                    __callback__();
                }
            }, (err)=>{
                console.log('done', err);
                disconnect();
            }); 
        }else{
            console.log('err', results.reasons);
            disconnect();
        }
    });
});