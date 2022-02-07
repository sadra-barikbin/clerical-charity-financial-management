import PouchDB from 'pouchdb';

import find from 'pouchdb-find';
import fs from 'fs';

let adapter;
if (process.env.IS_ELECTRON){
    PouchDB.plugin(require('pouchdb-adapter-node-websql'));
    adapter = "websql";
}else{
    adapter = 'idb';
}

PouchDB.plugin(find);

var loanDb = new PouchDB('loans.db', {adapter});
loanDb.createIndex({index:{fields:['asker', 'recieveDate'], name:'asker-temporal'}});
loanDb.createIndex({index:{fields:['fromAccount'], name:'bank-account-based'}});
loanDb.createIndex({index:{fields:['asker'], name:'asker-based'}});
loanDb.createIndex({index:{fields:['sureties'], name:'surety-based'}});
loanDb.createIndex({index:{fields:['number'], name:'numerical'}});

var personDb = new PouchDB('people.db', {adapter});
personDb.createIndex({index:{fields:['name','surname'], name:"nominal"}});
personDb.createIndex({index:{fields:['education.school'], name:'scholastic'}});
personDb.createIndex({index:{fields:['tags'], name:'tag-based'}});
personDb.createIndex({index:{fields:['nationalId'], name:'identity-based'}})

var serviceDb = new PouchDB('services.db', {adapter});
serviceDb.createIndex({index:{fields:['performer'], name:'performer'}});
serviceDb.createIndex({index:{fields:['performer', 'recieveDate'], 
                                name:'performer-temporal'}});

var helpDb = new PouchDB('helps.db', {adapter});
helpDb.createIndex({index:{fields:['asker'], name:'personal'}});
helpDb.createIndex({index:{fields:['asker', 'recieveDate'],
                             name:'personal-temporal'}});
helpDb.createIndex({index:{fields:['fromAccount', 'asker'],
                             name:'financial-personal'}});

var bankAccountDb = new PouchDB('bank-accounts.db', {adapter});

var schoolDb = new PouchDB('schools.db', {adapter});

var tagDb = new PouchDB('tags.db', {adapter});

function Erase(){
    return Promise.all([loanDb.destroy(), personDb.destroy(), serviceDb.destroy(),
        helpDb.destroy(), bankAccountDb.destroy(), schoolDb.destroy(), tagDb.destroy()]);
}

var DBs = {loanDb, personDb, serviceDb, helpDb, schoolDb, bankAccountDb, tagDb};
var Restore, Backup;
if(process.env.IS_ELECTRON){
    Restore = async function(path){
        const directory = fs.opendirSync(path);
        for(let file of directory.files){
            DBs[file.path.split('.')[0]] = new PouchDB(file.path, {adapter})
        }
        return true;
    }

    Backup = function(path, justPeople=false){
        let dbs = [];
        let dbNames = ['loan','person','service','help','bankAccount','school','tag'];
        dbNames = dbNames.filter(db => !justPeople || db === 'person' || 
                                 db === 'tag');
        for(let db of dbNames){
            let file = fs.createWriteStream(`${db}Db.dump`);
            
            dbs.push(DBs[`${db}Db`].dump(file));
        }
        let archive = archiver('zip');
        let output = fs.createWriteStream(`${path}/backup.dump`);
        archive.pipe(output);
        return Promise.all(dbs).then(()=>{
            archive.glob('*Db.dump');
            return archive.finalize().then(()=>{
                for(let db of dbNames){
                    fs.unlink(`${db}Db.dump`, ()=>{})
                }
            })
        })
    }
}

function Close(){
    for(let db in DBs){
        DBs[db].close()
    }
}

export {loanDb, personDb, serviceDb, helpDb, bankAccountDb,
        schoolDb, tagDb, Erase, Backup, Restore, Close};