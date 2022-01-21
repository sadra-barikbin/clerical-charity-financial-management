const Service =require("./Service")
const ValueError=require('../../errors/ValueError')
module.exports=class Fasting extends Service{
    constructor(count,customerName,performer,introducer,recieveDate,cost){
        super("fasting",customerName,performer,introducer,recieveDate,cost);
        if(count!=undefined && count<1){
            throw new ValueError("count must be at least one");
        }
        this.count=count//its unit is day
    }
    brief(){
        return Object.assign({count:this.count},super.brief())
    }
}