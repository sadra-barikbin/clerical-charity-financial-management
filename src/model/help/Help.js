module.exports=class Help{
    constructor(type, asker, recieveDate, reason){
        this.type = type        
        this.asker = asker
        this.recieveDate = recieveDate
        this.reason = reason
    }
    brief(){
        return {type:this.type, asker:this.asker._id,
                recieveDate:this.recieveDate, reason:this.reason}
    }
}