const Person=require('./Person');
module.exports=class Student extends Person{
    setEducation(education){
        this.education=education
    }
    brief(){
		return Object.assign(super.brief(),{education:this.education.brief()})
    }
    copy(){
        let temp=Object.assign(new Student,this);
		temp.tags=temp.tags.map(tag=>Object.assign({},tag));
        //ٌWarning: what if birthDate type is date?then you're copying refrence
        temp.education=temp.education.copy();
		return temp;
    }
}