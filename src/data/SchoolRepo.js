const DatabaseInternalError =require('../errors/DatabaseInternalError');
const ItemAlreasyExistsError=require('../errors/ItemAlreadyExistsError');
const NoSuchItemExistsError=require('../errors/NoSuchItemExistsError')
const UnremovableDueToDependenciesError=require('../errors/UnremovableDueToDependenciesError');
import PersonRepo from '../data/PersonRepo';
import {schoolDb,personDb} from "./Database";
class SchoolRepo{
    async Put(school){
        let r=await schoolDb.find({selector:{school}})
        .then(r=>r.docs)
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(r.length!=0){
            throw new ItemAlreasyExistsError(r[0]);
        }
        var {id,rev}=await schoolDb.post({school})
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        return {_id:id,_rev:rev};
    }
    GetSchools(){
        return schoolDb.allDocs({include_docs:true}).then(r=>r.rows.map(x=>x.doc))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    Get(id){
        return schoolDb.get(id)
        .catch(e=>{
            if(e.status==404){
                throw new NoSuchItemExistsError()
            }else{
                throw new DatabaseInternalError(e)
            }
        });
    }
    RemoveSchools(){
        return schoolDb.destroy().then(res=>{
            console.log(res);
        }).catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    async RemoveSchool({_id,_rev},force=false){
        if(!force){
            let students=await personDb.find({selector:{'education.school':_id},
                                            fields:['name','surname'],
                                            limit:10}).then(r=>r.docs);
            if(students.length!=0){
                let message=`${students[0].name} ${students[0].surname} `+(students.length>1?`و ${students.length-1} نفر دیگر `:'')+'اهل این مدرسه '+(students.length>1?'هستند!':'است!');
                throw new UnremovableDueToDependenciesError([{message,depends:students}]);
            }
        }else{
            await PersonRepo.Remove({'education.school':_id});
        }
        return await schoolDb.remove({_id,_rev});
    }
}
const instance=new SchoolRepo();
export default instance