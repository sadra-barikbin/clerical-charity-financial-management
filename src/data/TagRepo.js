const DatabaseInternalError =require('../errors/DatabaseInternalError');
const ItemAlreasyExistsError=require('../errors/ItemAlreadyExistsError');
const UnremovableDueToDependenciesError=require('../errors/UnremovableDueToDependenciesError');
const NoSuchItemExistsError=require('../errors/NoSuchItemExistsError')
import PersonRepo from '../data/PersonRepo';
import {tagDb,personDb} from "./Database";
class TagRepo{
    async Put(tag){
        let r=await tagDb.find({selector:{tag}})
        .then(r=>r.docs)
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(r.length!=0){
            throw new ItemAlreasyExistsError(r[0]);
        }
        var {id,rev}=await tagDb.post({tag})
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        return {_id:id,_rev:rev};
    }
    GetTags(){
        return tagDb.allDocs({include_docs:true}).then(r=>r.rows.map(x=>x.doc))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    Get(id){
        return tagDb.get(id)
        .catch(e=>{
            if(e.status==404){
                throw new NoSuchItemExistsError()
            }else{
                throw new DatabaseInternalError(e)
            }
        });
    }
    RemoveTags(){
        return tagDb.destroy().then(res=>{
            console.log(res);
        }).catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    async RemoveTag({_id,_rev},force=false,removeDepends=false){
        if(!force){
            let people=await personDb.find({selector:{'tags':{'$elemMatch':_id}},
                                            fields:['name','surname'],
                                            limit:10}).then(r=>r.docs);
            if(people.length!=0){
                let message=`${people[0].name} ${people[0].surname} `+(people.length>1?`و ${people.length-1} نفر دیگر `:'')+'این برچسب را دار'+(people.length>1?'ند!':'د!');
                throw new UnremovableDueToDependenciesError([{message,depends:people}]);
            }
        }else{
            if(removeDepends){
                await PersonRepo.Remove({'tags':{'$elemMatch':_id}});
            }else{
                await PersonRepo.RemoveTagFromPeople(await tagDb.get(_id));
            }
        }
        return await tagDb.remove({_id,_rev});
    }
}
const instance=new TagRepo();
export default instance