const DatabaseInternalError =require('../errors/DatabaseInternalError')
const ItemAlreasyExistsError=require('../errors/ItemAlreadyExistsError')
const UnremovableDueToDependenciesError=require('../errors/UnremovableDueToDependenciesError');
import {bankAccountDb,helpDb,personDb,loanDb} from './Database';
import HelpRepo from './HelpRepo';
import LoanRepo from './LoanRepo';
class BankAccountRepo{
    async Put(account){
        let r=await bankAccountDb.find({selector:{account}})
        .then(r=>r.docs)
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(r.length!=0){
            throw new ItemAlreasyExistsError(r[0]);
        }
        let {id,rev}=await bankAccountDb.post({account})
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        return {_id:id,_rev:rev};
    }
    Get(id){
        return bankAccountDb.get(id);
    }
    GetAccounts(){
        return bankAccountDb.allDocs({include_docs:true}).then(r=>r.rows.map(x=>x.doc))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    async RemoveAccount({_id,_rev},force=false){
        if(!force){
            let hasDepends=false;
            let dependencies=[];
            for(const [i,db] of [helpDb,loanDb].entries()){
                let dependsIds=await db.find({selector:{'fromAccount':_id},
                                            fields:['asker'],
                                            limit:10}).then(r=>r.docs);
                if(dependsIds.length==0){
                    continue;
                }
                hasDepends=true;
                let depends=await personDb.allDocs({include_docs:true,keys:dependsIds.map(d=>d.asker)}).then(res=>res.rows.map(r=>r.doc));
                let name=i==0?'کمک':'وام';
                let message=`${depends[0].name} ${depends[0].surname} `+(depends.length>1?`و ${depends.length-1} نفر دیگر `:'')+`از این حساب ${name} گرفته‌`+(depends.length>1?'اند!':'است!');
                dependencies.push({message,depends});
            }
            if(hasDepends){
                throw new UnremovableDueToDependenciesError(dependencies);
            }                      
        }else{
            await HelpRepo.Remove({'fromAccount':_id});
            await LoanRepo.Remove({'fromAccount':_id});
        }
        return await bankAccountDb.remove({_id,_rev});
    }
}
const instance=new BankAccountRepo()
export default instance