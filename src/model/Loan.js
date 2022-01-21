const persianDate=require('persian-date');
module.exports=class Loan{
    constructor(shareCount,totalAmount,asker,sureties,fromAccount,payBackStartDate,recieveDate,description,number){
        this.shareCount=shareCount;
        this.totalAmount=totalAmount;
        this.asker=asker;
        this.description=description;
        this.sureties=sureties;
        this.fromAccount=fromAccount;
        this.payBackStartDate=payBackStartDate;
        this.recieveDate=recieveDate;
        this.number=number;
        this.delayedInstallmentNumbers=[];
    }
    brief(){
        /**
         *These three lines in bottom are due to yet unspecified policy of loading objects from db.
            Whether we load dependencies of an object(e.g. sureties or asker of a loan along with the loan itself)
            or not. ---?Lazy loading?---
         */
        let asker=this.asker._id===undefined?this.asker:this.asker._id;
        let sureties=this.sureties.map(s=>s._id===undefined?s:s._id);
        let fromAccount=this.fromAccount._id===undefined?this.fromAccount:this.fromAccount._id;
        let temp={
            shareCount:this.shareCount,totalAmount:this.totalAmount,
            asker,description:this.description,
            sureties,fromAccount,
            payBackStartDate:this.payBackStartDate,recieveDate:this.recieveDate,
            delayedInstallmentNumbers:this.delayedInstallmentNumbers
        };
        if(this.number) temp['number']=this.number;
        return temp;
    }
    getShareDate(shareNum){//shareNum starts from 1
        return new persianDate(this.payBackStartDate.split('-').map(r=>parseInt(r,10))).add('months',shareNum-1)
    }
    isSharePast(shareNum){
        let date=new persianDate(this.payBackStartDate.split('-').map(r=>parseInt(r,10))).add('months',shareNum-1);
        return date.diff(new persianDate())<=0;
    }
}