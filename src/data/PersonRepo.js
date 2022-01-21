//const Database=require("./Database").personDb;
import {personDb} from './Database';
const Person=require('../model/Person')
const Student=require('../model/Student');
const Education=require('../model/Education');
const ItemAlreasyExistsError=require('../errors/ItemAlreadyExistsError')
const NoSuchItemExistsError=require('../errors/NoSuchItemExistsError')
const DatabaseInternalError=require('../errors/DatabaseInternalError')
import LoanRepo from './LoanRepo';
import HelpRepo from './HelpRepo';
import ServiceRepo from './ServiceRepo';
import assert from 'assert';
class PersonRepo{
    GetByNationalId(nid){
        return personDb.find({selector:{nationalId:nid}})
        .then(r=>r.docs[0]).then(r=>{
            let pp=Object.assign(('education' in r)?new Student:new Person,r);
            if('education' in r) pp.education=Object.assign(new Education,pp.education);
            return pp;
        })
        .catch(e=>{
            if(e.status==404){
                throw new NoSuchItemExistsError()
            }else{
                throw new DatabaseInternalError()
            }
        });
    }
    Get(id){
        return personDb.get(id).then(r=>{
            let pp=Object.assign(('education' in r)?new Student:new Person,r);
            if('education' in r) pp.education=Object.assign(new Education,pp.education);
            return pp;
        })
        .catch(e=>{
            if(e.status==404){
                throw new NoSuchItemExistsError()
            }else{
                throw new DatabaseInternalError(e)
            }
        });
    }
    async Search(query){
        if(!query){
            return [];
        }
        let selector;
        if(parseInt(query,10)){
            if(query.startsWith('09'))
                selector={phone:{'$regex':query}};
            else
                selector={nationalId:{'$regex':query}};
        }
        else{
            var tokens=query.split(' ');
            selector={"$or":[{name:{"$regex":tokens[0]}},{surname:{"$regex":tokens.slice(1).length==0?tokens[0]:tokens.slice(1).join(' ')}}]};
        }
        return await personDb.find({selector})
        .then(r=>r.docs.map(p=>{
            let pp=Object.assign(('education' in p)?new Student:new Person,p);
            if('education' in p) pp.education=Object.assign(new Education,pp.education);
            return pp;
        }))
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
    }
    async Put(person){
        assert(!('_id' in person));
        let r = await personDb.find({selector:{nationalId:person.nationalId}})
        .then(r => r.docs)
        .catch(e=>{
            throw new DatabaseInternalError(e);
        });
        if(r.length!=0){
            throw new ItemAlreasyExistsError(r[0]);
        }
        let payload = person.brief();
        if(person.avatar!=null || person.avatar!= undefined){
            payload._attachments={avatar:{
                content_type:person.avatar.type,
                data:person.avatar
            }}
        }
        let {id,rev}=await personDb.post(payload)
        .catch(e=>{
            throw new DatabaseInternalError(e);
        })
        person._id=id;
        person._rev=rev;
        return {_id:id,_rev:rev};
    }
    async Update(person){
        let {_rev,_id}=await personDb.get(person._id);
        let {ok,rev}=await personDb.put(Object.assign(person.brief(),{_rev,_id}));
        if(!ok) throw new DatabaseInternalError();
        if(person.avatar){
            let res=await personDb.putAttachment(_id,'avatar',rev,person.avatar.data,person.avatar.data.type);
            rev=res.rev;
            ok=res.ok;
            if(!ok) throw new DatabaseInternalError();
        }
        person._rev=rev;
        return ok;
    }
    async Remove(object){
        let selector;
        if(object instanceof Person){
            selector={_id:object._id};
        }else{
            selector=object;
        }
        let people=await personDb.find({selector}).then(rs=>rs.docs.map(r=>Object.assign(r,{_deleted:true})));
        let ids=people.map(p=>p._id);
        await LoanRepo.Remove({'$or':[{asker:{'$in':ids}},{sureties:{'$elemMatch':{'$in':ids}}}]});
        await HelpRepo.Remove({asker:{'$in':ids}});
        //I removed '{customer:{'$in':ids}},{introducer:{'$in':ids}}' from the line bottom after setting customer & introducer fields as just strings.
        await ServiceRepo.Remove({performer:{'$in':ids}});
        return await personDb.bulkDocs(people).then(res=>{
            let erroneous=res.filter(x=>!x.ok);
            if(erroneous.length!=0){
                throw new DatabaseInternalError(erroneous);
            }
            return true;
        });
    }
    RemoveTagFromPeople(tag){
        return personDb.find({selector:{'tags':{'$elemMatch':tag._id}}}).then(rs=>rs.docs)
                .then(res=>{
                    for(let r of res){
                        r.tags.splice(r.tags.indexOf(tag._id),1);
                    }
                    console.log('After tag removal:',res);
                    return personDb.bulkDocs(res).then(res2=>{
                        let erroneous=res2.filter(x=>!x.ok);
                        if(erroneous.length!=0){
                            throw new DatabaseInternalError(erroneous);
                        }
                        return true;
                    })
                });
    }
    Count(){
        return personDb.info().then(r=>{
            return personDb.getIndexes().then(res=>{
                return r.doc_count-res.indexes.length+1;
            });
        });
    }
    GetAvatarOf(person){
        return personDb.getAttachment(person._id,'avatar')
        .catch(e=>{
            if(e.status==404)
                return undefined;
            else
                throw new DatabaseInternalError(e);
        });
    }
    NidExists(nid){
        return personDb.find({selector:{nationalId:nid}}).then(rs=>{
            let res={exists:rs.docs.length!=0};
            if(res.exists){
                res.name=rs.docs[0].name;
                res.surname=rs.docs[0].surname;
            }
            return res;
        })
    }
}
const instance=new PersonRepo();
export default instance
