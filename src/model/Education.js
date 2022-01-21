const ValueError=require('../errors/ValueError')
module.exports=class Education{
    constructor(level,school,attitude,getsIncentiveTuition){
        if(level!=undefined && !Number.isInteger(level)){
            throw new TypeError()
        }
        if(level!=undefined && (level<1 || level>11)){
            throw new ValueError()
        }
        this.level=level
        this.school=school
        if(attitude!=undefined && attitude!=="MIDDLE" && attitude!=="GOOD" && attitude!=="PERFECT"){
            throw new ValueError()
        }
        this.attitude=attitude
        this.getsIncentiveTuition=getsIncentiveTuition
    }
    brief(){
        return {
            level:this.level,school:this.school._id
            ,attitude:this.attitude,getsIncentiveTuition:this.getsIncentiveTuition}
    }
    copy(){
        let temp=Object.assign(new Education,this);
        temp.school=Object.assign({},this.school);
        return temp;
    }
}