module.exports=class Service{
    constructor(type,customerName,performer,introducerName,recieveDate,cost){
        this.type=type;
        this.recieveDate=recieveDate
        this.cost=cost
        this.customerName=customerName//type:string
        this.performer=performer
        this.introducerName=introducerName//type:string
    }
    brief(){
        return {type:this.type,recieveDate:this.recieveDate,cost:this.cost,
            customerName:this.customerName,performer:this.performer._id,introducerName:this.introducerName}
    }
}