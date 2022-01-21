import {helpDb} from './Database';
import BankAccountRepo from './BankAccountRepo';
import PersonRepo from './PersonRepo';
const CashHelp = require('../model/help/CashHelp');
const GoodsHelp = require('../model/help/GoodsHelp');
const DatabaseInternalError =require('../errors/DatabaseInternalError')

class HelpRepo{
    static async populate(...helps){
        let res = [];
        for(let h of helps){
            h.asker = await PersonRepo.Get(h.asker);
            if(h.fromAccount){
                h.fromAccount = await BankAccountRepo.Get(h.fromAccount);
            }
            res.push(h);
        }
        return res;
    }
    async PutHelp(help){
        let {id,rev} = await helpDb.post(help.brief())
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        help._id = id;
        help._rev = rev
        return id;
    }
    async GetHelpsOf(person){
        let helps = await helpDb.find({selector:{asker:person._id,
                                                 recieveDate:{'$gt':null}},
                                                 sort:['asker', 'recieveDate']})
                                .then(r => r.docs)
                                .catch(e => {throw new DatabaseInternalError(e);});
        for(let h of helps){
            if(h.fromAccount){
                h.fromAccount=await BankAccountRepo.Get(h.fromAccount);
            }
        }
        return helps;
    }
    async RemoveHelp(help){
        let hlp = await helpDb.get(help._id);
        return await helpDb.remove(hlp);
    }
    async GetHelpsWhich(recieveStartDate,recieveEndDate,receiverType='all'){
        let selector = {'$and':[{recieveDate:{'$gt':recieveStartDate}},
                                {recieveDate:{'$lt':recieveEndDate}}]};
        let helps = await helpDb.find({selector})
                                .then(rs=>rs.docs
                                            .map(l => (l.type === 'CASH') ?
                                                    Object.assign(new CashHelp,l):
                                                    Object.assign(new GoodsHelp,l)))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(receiverType==='all'){
            return await HelpRepo.populate(...helps);
        }else{
            let wantedHelps=[];
            for(let help of helps){
                let person=await PersonRepo.Get(help.asker);
                if((person.education && receiverType==='student') || (!person.education && receiverType==='nonstudent')){
                    wantedHelps.push(help);
                }
            }
            return await HelpRepo.populate(...wantedHelps);
        }
    }
    Remove(selector){
        return helpDb.find({selector}).then(rs=>rs.docs.map(r=>Object.assign(r,{_deleted:true}))).then(rs2=>{
            return helpDb.bulkDocs(rs2).then(res=>{
                let erroneous=res.filter(x=>!x.ok);
                if(erroneous.length!=0){
                    throw new DatabaseInternalError(erroneous);
                }
                return true;
            })
        }).catch(e=>{
            console.log(e);
            throw new DatabaseInternalError(e);
        })
    }
    Count(){
        return helpDb.info().then(r=>{
            return helpDb.getIndexes().then(res=>{
                return r.doc_count-res.indexes.length+1;
            });
        });
    }
}
const instance = new HelpRepo()
export default instance
