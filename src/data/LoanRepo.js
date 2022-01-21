const DatabaseInternalError =require('../errors/DatabaseInternalError')
const NoSuchItemExistsError=require('../errors/NoSuchItemExistsError')
import BankAccountRepo from './BankAccountRepo';
import Loan from '@/model/Loan';
import {loanDb} from './Database';
import PersonRepo from './PersonRepo';
import assert from 'assert';
class LoanRepo{
    async Put(loan){
        assert(!('_id' in loan));
        let {id,rev}=await loanDb.post(loan.brief())
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        loan._id=id;
        loan._rev=rev;
        return {id,rev};
    }
    static async populate(...loans){
        let res=[];
        for(let l of loans){
            l.asker=await PersonRepo.Get(l.asker);
            l.sureties=[await PersonRepo.Get(l.sureties[0]),await PersonRepo.Get(l.sureties[1])];
            l.fromAccount=await BankAccountRepo.Get(l.fromAccount);
            res.push(l);
        }
        return res;
    }
    async GetLoan(id){
        let loan=await loanDb.get(id).then(r=>Object.assign(new Loan,r))
        .catch(e=>{
            if(e.status==404){
                throw new NoSuchItemExistsError();
            }else{
                throw new DatabaseInternalError(e);
            }
        });
        loan.asker=await PersonRepo.Get(loan.asker);
        return loan;
    }
    FindByNumber(num){
        return loanDb.find({selector:{number:{'$regex':num}}}).then(rs=>rs.docs.map(r=>{
            return Object.assign(new Loan,r);
        }));
    }
    GetLoansOf(people){//**WARNING: For a person, its object is shared among all its loans */
        let selector;
        if(!Array.isArray(people))
            selector={asker:people._id,recieveDate:{'$gt':null}};
        else
            selector={asker:{'$in':people.map(p=>p._id)}};//,recieveDate:{'$gt':null}};
        return loanDb.find({selector,sort:['asker']}).then(rs=>rs.docs.map(r=>{
            let l=Object.assign(new Loan,r);
            if(Array.isArray(people)){
                let askers=people.filter(p=>p._id===l.asker);
                assert(askers.length==1);
                l.asker=askers[0];
            }else{
                l.asker=people;
            }
            return l;
        })).catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    async GetLoansWhich(recieveStartDate,recieveEndDate,receiverType='all'){
        let selector={'$and':[{recieveDate:{'$gt':recieveStartDate}},{recieveDate:{'$lt':recieveEndDate}}]};
        let loans=await loanDb.find({selector}).then(rs=>rs.docs.map(l=>Object.assign(new Loan,l)))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(receiverType==='all'){
            return await LoanRepo.populate(...loans);
        }else{
            let wantedLoans=[];
            for(let loan of loans){
                let person=await PersonRepo.Get(loan.asker);
                if((person.education && receiverType==='student') || (!person.education && receiverType==='nonstudent')){
                    wantedLoans.push(loan);
                }
            }
            return await LoanRepo.populate(...wantedLoans);
        }
    }
    async GetInsuredLoansOf(person){
        let selector={sureties:{'$elemMatch':person._id}};
        let loans=await loanDb.find({selector}).then(rs=>rs.docs.map(r=>Object.assign(new Loan,r)))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        for(let loan of loans){
            loan.asker=await PersonRepo.Get(loan.asker);
        }
        return loans;
    }
    async Update(loan){
        let {_rev,_id}=await loanDb.get(loan._id);
        let {ok,rev}=await loanDb.put(Object.assign(loan.brief(),{_rev,_id}));
        if(!ok) throw new DatabaseInternalError();
        loan._rev=rev;
        return ok;
    }
    Remove(selector){
        return loanDb.find({selector}).then(rs=>rs.docs.map(r=>Object.assign(r,{_deleted:true}))).then(rs2=>{
            return loanDb.bulkDocs(rs2).then(res=>{
                let erroneous=res.filter(x=>!x.ok);
                if(erroneous.length!=0){
                    throw new DatabaseInternalError(erroneous);
                }
                return true;
            })
        })
    }
    Count(){
        return loanDb.info().then(r=>{
            return loanDb.getIndexes().then(res=>{
                return r.doc_count-res.indexes.length+1;
            });
        });
    }
}
const instance=new LoanRepo()
export default instance
