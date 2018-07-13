const EventEmitter = require('events');
const fs = require('fs');

const downloadImage = require('./helper').donwloadImage;
const scheduler = require('./helper').scheduler;
const connect = require('./helper').connect;
const disconnect = require('./helper').disconnect;
const request = require('request');
const cheerio = require('cheerio');
const getStarnames = require('./helper').getStarnames;

function compare_names(n1, n2){
    if(n1.length !== n2.length){
        return false;
    }
    for(let i of n1){
        if(n2.indexOf(i) === -1){
            return false;
        }
    }
    return true;
}
function getStarnameProfileUrl(starname, callback){
    let compared_names = starname.split('-');
    while(starname.indexOf('-') !== -1){
        starname = starname.replace('-', '+');
    }
    let url = "https://xxx.xcity.jp/idol/?num=24&page=1&q=" + starname;
    request(
        url, 
        (error, response, data)=>{
            if(error || response.statusCode != 200){
                if(error){
                    callback({success: false, reasons: [error.message]});
                }else{
                    callback({success: false, reasons:[`Invalid status code ${response.statusCode}`]});
                }
            }else{
                const $ = cheerio.load(data);
                // core: the video content
                let idols = $('#avidol .itemBox').toArray();
                if(idols.length === 0){
                    callback({success: false, reasons:[`Not found`]});
                    return;
                }
                let imgUrl = null;
                for(let idol of idols){
                    try{
                        let title_names = $('.tn a', idol).attr('title').toLowerCase().split(' ');
                        if(compare_names(compared_names,  title_names)){
                            imgUrl = $('.tn a img', idol).attr('src');
                            if(imgUrl.indexOf('http') === -1){
                                imgUrl = 'https:' + imgUrl;
                                callback({success: true, reasons:[], value: imgUrl});
                                return;
                            }
                        }
                    }catch(err){
                        console.log('[Error] ', starname, ' ',$('.tn a', idol).attr('title'));
                    }
                }
                callback({success: false, reasons:[`Not found`]});
                return;
            }
        }
    );
}


connect(()=>{
    getStarnames({skip:0, limit:400, sort:{name:-1}}, (results)=>{
        if(results.success){
            scheduler(results.value, 10, (star, __callback__)=>{
                getStarnameProfileUrl(star.name, (data)=>{
                    if(data.success){
                        downloadImage(data.value, './star_profile_images', star.name + '.jpg', __callback__)
                    }else{
                        console.log(star.name, ' not found');
                        __callback__();
                    }
                })
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
