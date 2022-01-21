const DatabaseInternalError =require('../errors/DatabaseInternalError')
import {serviceDb} from './Database';
import PersonRepo from './PersonRepo';
const Fasting=require('../model/service/Fasting');
const Prayer=require('../model/service/Prayer');
class ServiceRepo{
    async PutService(serv){
        let {id,rev}=await serviceDb.post(serv.brief())
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        serv._id=id;
        serv._rev=rev;
        return {id,rev};
    }
    async populate(...sers){
        let res=[];
        for(let s of sers){
            s.performer=await PersonRepo.Get(s.performer);
            res.push(s);
        }
        return res;
    }
    Remove(selector){
        return serviceDb.find({selector}).then(rs=>rs.docs.map(r=>Object.assign(r,{_deleted:true}))).then(rs2=>{
            return serviceDb.bulkDocs(rs2).then(res=>{
                let erroneous=res.filter(x=>!x.ok);
                if(erroneous.length!=0){
                    throw new DatabaseInternalError(erroneous);
                }
                return true;
            })
        })
    }
    async RemoveService(service){
        let srv=await serviceDb.get(service._id);
        return await serviceDb.remove(srv);
    }
    async GetServicesWhich(recieveStartDate,recieveEndDate,receiverType='all',serviceType='all'){
        let selector={'$and':[{recieveDate:{'$gt':recieveStartDate}},{recieveDate:{'$lt':recieveEndDate}}]};
        if(serviceType!=='all'){
            selector['$and'].push({'type':{'$eq':serviceType}});
        }
        let services=await serviceDb.find({selector}).then(rs=>rs.docs.map(
            s=>Object.assign((s.type==='fasting')?new Fasting:new Prayer,s)))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(receiverType==='all'){
            return this.populate(...services);
        }else{
            let wantedServices=[];
            for(let service of services){
                let person=await PersonRepo.Get(service.performer);
                if((person.education && receiverType==='student') || (!person.education && receiverType==='nonstudent')){
                    wantedServices.push(service);
                }
            }
            return this.populate(...wantedServices);
        }
    }
    GetServicesOf(person){
        return serviceDb.find({selector:{performer:person._id,recieveDate:{'$gt':null}},sort:['performer','recieveDate']})
        .then(r=>r.docs)
        .then(rs=>[rs.filter(x=>x.type==='fasting'),rs.filter(x=>x.type==='prayer')])
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    Count(){
        return serviceDb.info().then(r=>{
            return serviceDb.getIndexes().then(res=>{
                return r.doc_count-res.indexes.length+1;
            });
        });
    }
}
const instance = new ServiceRepo();
export default instance