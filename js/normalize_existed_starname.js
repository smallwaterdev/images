 
///////// Database configurations //////////
const mongoose = require('mongoose');
const bluebird = require('bluebird');
const EventEmitter = require('events');
const fs = require('fs');
const metaDB = require('../../db_models/meta_db');
const updateNewValueByOldValue = require('../../db_operations/normalize_db_ops').updateNewValueByOldValue;
const name_converter = require('./name_converter').name_converter;

/*const lastnames = [
    'abe','aizawa','aoi',
    'hatano','hoshina','hamasaki', 'honda',
    'kimijima','kimura','kitano','kisaki','katase',
    'mizuno','mizuki','minami','mizusawa',
    'nikaidou','nagai',
    'ogino',
    'sasaki','shinoda', 'sazanami','sakura',
    'yuzuki',
];
const firstnames = [
    'ayuri','aki','aya','airi','ai','aya', 
    'chie',
    'erika',
    'honoka','haruka','hitomi',
    'ikumi',
    'mao','mai','mio','misaki','megumi',
    'nao','nozomi',
    'rika','rina','riko',
    'shuri','sora',
    'yu','yui','yuki','yuu','yukari','yukine','yuuri',
];*/
let map_ = new Map();
function addstat(name){
    let counter = map_.get(name);
    if(typeof counter === 'number'){
        map_.set(name, counter + 1);
    }else{
        map_.set(name, 1);
    } 
}
function showStat(){
    map_[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
    }
    for (let [key, value] of map_) {     // get data sorted
        console.log(key + ' ' + value);
    }
}


const launcher = new EventEmitter();
const starnameValidEvent = new EventEmitter();
const abort_chars = '()01234567890 ,';

mongoose.Promise = bluebird;
const mongodb_url = require('../../config').mongodb_url;
const mongodb_option = require('../../config').mongodb_option;
const connect = mongoose.connect(mongodb_url, {});
connect.then((db)=>{
        console.log("[mongodb] connected correctly to server");
        launcher.emit('db ready');
    }, (err)=>{
        console.log("[mongodb] connection failed")
        console.log(err);
});

let invalid_counter = 0;
let reverse_counter = 0;
let not_sure_counter = 0;

function readNames(filename){
    let text = fs.readFileSync(filename).toString();
    let names = text.split('\n');
    console.log(filename, names.length);
    return names;
}
let lastnames = readNames('./smallData/scripts/normalize_starnames/lastnames');
let firstnames = readNames('./smallData/scripts/normalize_starnames/firstnames');


function addFirstName(name){
    if(firstnames.indexOf(name) === -1){
        firstnames.push(name);
    }
}
function addLastName(name){
    if(lastnames.indexOf(name) === -1){
        lastnames.push(name);
    }
}

function starname_validate(name){
    for(let i of name){
        if(abort_chars.indexOf(i) !== -1){
            return null;
        }
    }
    let first_last = name.split('-');
    if(first_last.length > 2){
        return null;
    }
    return name;
}


function check_reverse(name, callback){
    let first_last = name.split('-');
    let new_name =  first_last[1] + '-' + first_last[0];
    //addstat(first_last[1]);
    //addstat(first_last[0]);
    metaDB.find({field:"starname", name: new_name}, callback);
}
function check_right_order(name){
    let first_last = name.split('-');
    if(firstnames.indexOf(first_last[0]) !== -1 || lastnames.indexOf(first_last[1]) !== -1){
        addFirstName(first_last[0]);
        addLastName(first_last[1]);
        return 1; // "OK";
    }else if(firstnames.indexOf(first_last[1]) !== -1 || lastnames.indexOf(first_last[0]) !== -1){
        return 2; // 'wrong order'
    }else{
        return 3; // "Unknown"
    }
}
starnameValidEvent.on('next', (i)=>{
    metaDB.find({field:"starname"}, null, {skip: i, limit:1, sort:{name:1}}, (err, stars)=>{
        if(err){
            starnameValidEvent.emit('err', (err));
        }else if(stars.length > 0){
            //console.log(`====== Current star ${i} ${stars[0].name} ======`);
            let name = starname_validate(stars[0].name);
            if(name === null && name_converter[stars[0].name]){
                updateNewValueByOldValue('starname', stars[0].name,name_converter[stars[0].name], (result)=>{
                    if(result.success){
                        //console.log('Reverse name done');
                        starnameValidEvent.emit('next', (i + 1));
                    }else{
                        console.log('Update (reverse) name error');
                        starnameValidEvent.emit('err', (new Error(result.reasons[0])));
                    }
                });
                
            }else if(name === null){
            
                console.log('Invalid name: ' + stars[0].name);
                invalid_counter++;
                starnameValidEvent.emit('next', (i + 1));   
            
            }else{
                if(name.split('-').length === 1){
                    //console.log('Good name: ' + name);
                    starnameValidEvent.emit('next', (i + 1));
                }else{
                    check_reverse(name, (err, result)=>{
                        if(err){
                            starnameValidEvent.emit('err', (err));
                        }else if(result.length > 0){
                            let r = check_right_order(name);
                            switch(r){
                                case 1:{
                                    //console.log('Good name: ' + name);
                                    starnameValidEvent.emit('next', (i + 1));
                                };break;
                                case 2:{
                                    let last_first = name.split('-');
                                    let new_n = last_first[1] + '-' + last_first[0];
                                    console.log('******* Reverse name: ' + name + ' to ' + new_n);
                                    reverse_counter++;
                                    updateNewValueByOldValue('starname', name,new_n, (result)=>{
                                        if(result.success){
                                            //console.log('Reverse name done');
                                            starnameValidEvent.emit('next', (i + 1));
                                        }else{
                                            console.log('Update (reverse) name error');
                                            starnameValidEvent.emit('err', (new Error(result.reasons[0])));
                                        }
                                    });
                                };break;
                                default:{
                                    console.log('----------- Not sure name: ' + stars[0].name);
                                    addstat(stars[0].name.split('-')[0]);
                                    addstat(stars[0].name.split('-')[1]);
                                    not_sure_counter ++;
                                    starnameValidEvent.emit('next', (i + 1));
                                };break;
                            }
                        }else{
                            //console.log('Good name: ' + name);
                            starnameValidEvent.emit('next', (i + 1));
                        }
                    });
                }
            }
        }else{
            starnameValidEvent.emit('done');
        }
    });
});
starnameValidEvent.on('done', ()=>{
    console.log('finished');
    showStat();
    console.log('reverse counter ', reverse_counter);
    console.log('not sure counter ', not_sure_counter);
    console.log('invalid counter', invalid_counter);
    fs.writeFileSync('./smallData/scripts/normalize_starnames/firstnames', firstnames.join('\n'));
    fs.writeFileSync('./smallData/scripts/normalize_starnames/lastnames', lastnames.join('\n')); 
    mongoose.connection.close();
});
starnameValidEvent.on('err', (err)=>{
    console.log('**** error ******');
    console.log(err.message);
});
function clear_starname_task(){
    starnameValidEvent.emit('next', 0);
}
launcher.once('db ready', ()=>{
    clear_starname_task();
});