import PouchDB from 'pouchdb';
import pouchdbwebsql from 'pouchdb-adapter-node-websql';
import find from 'pouchdb-find';

let adapter;
let fs = undefined;
if (process.env.IS_ELECTRON){
    
    PouchDB.plugin(pouchdbwebsql);
    adapter = "websql";

    let remote = require('electron').remote;
    fs = remote.require('fs');
}else{
    adapter = 'idb';
}

PouchDB.plugin(find);

var loanDb, personDb, serviceDb, helpDb, bankAccountDb, schoolDb, tagDb;
var DBs;

function initializeDBs(){

loanDb = new PouchDB('loans.db', {adapter});
personDb = new PouchDB('people.db', {adapter});
serviceDb = new PouchDB('services.db', {adapter});
helpDb = new PouchDB('helps.db', {adapter});
bankAccountDb = new PouchDB('bank-accounts.db', {adapter});
schoolDb = new PouchDB('schools.db', {adapter});
tagDb = new PouchDB('tags.db', {adapter});

DBs = {loanDb, personDb, serviceDb, helpDb, schoolDb, bankAccountDb, tagDb};
}

function createIndices(){
    loanDb.createIndex({index:{fields:['asker', 'recieveDate'], name:'asker-temporal'}});
    loanDb.createIndex({index:{fields:['fromAccount'], name:'bank-account-based'}});
    loanDb.createIndex({index:{fields:['asker'], name:'asker-based'}});
    loanDb.createIndex({index:{fields:['sureties'], name:'surety-based'}});
    loanDb.createIndex({index:{fields:['number'], name:'numerical'}});

    personDb.createIndex({index:{fields:['name','surname'], name:"nominal"}});
    personDb.createIndex({index:{fields:['education.school'], name:'scholastic'}});
    personDb.createIndex({index:{fields:['tags'], name:'tag-based'}});
    personDb.createIndex({index:{fields:['nationalId'], name:'identity-based'}})

    serviceDb.createIndex({index:{fields:['performer'], name:'performer'}});
    serviceDb.createIndex({index:{fields:['performer', 'recieveDate'], 
                                    name:'performer-temporal'}});

    helpDb.createIndex({index:{fields:['asker'], name:'personal'}});
    helpDb.createIndex({index:{fields:['asker', 'recieveDate'],
                                    name:'personal-temporal'}});
    helpDb.createIndex({index:{fields:['fromAccount', 'asker'],
                                    name:'financial-personal'}});
}

initializeDBs();
createIndices();

function Erase(){
    return Promise.all([loanDb.destroy(), personDb.destroy(), serviceDb.destroy(),
        helpDb.destroy(), bankAccountDb.destroy(), schoolDb.destroy(), tagDb.destroy()])
        .then(()=>{
            initializeDBs();
        })
}

var Restore, Backup;
if(process.env.IS_ELECTRON){
    Restore = async function(path){
        const directory = fs.readdirSync(path);
        for(let file of directory){
            let tempdb = new PouchDB(`${path}/${file}`, {adapter});
            let db = DBs[`${file.split('.')[0]}Db`];
            await PouchDB.replicate(tempdb, db);
            await tempdb.close()
        }
        return true;
    }

    Backup = async function(path, justPeople=false){
        let dbNames = ['loan','person','service','help','bankAccount','school','tag'];
        dbNames = dbNames.filter(db => !justPeople || db === 'person' || 
                                 db === 'tag');
        for(let db of dbNames){            
            let dumpdb = new PouchDB(`${path}/${db}.dump`, {adapter})
            await PouchDB.replicate(DBs[`${db}Db`], dumpdb);
            await dumpdb.close();
        }
        return true;
    }
}

async function Close(){
    for(let db in DBs){
        await DBs[db].close()
    }
}

export {loanDb, personDb, serviceDb, helpDb, bankAccountDb,
        schoolDb, tagDb, Erase, Backup, Restore, Close};