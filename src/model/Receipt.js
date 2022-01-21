const Loan=require('./Loan');
const CashHelp=require('./help/CashHelp');
const GoodsHelp=require('./help/GoodsHelp');
const Service=require('./service/Service');
const Person=require('./Person');
const ValueError=require('../errors/ValueError')
module.exports=class Receipt{
    constructor(obj){
        this.recieveDate=obj.recieveDate;
        if(obj instanceof Loan){
            if(!(obj.asker instanceof Person && obj.fromAccount.account)){
                throw new ValueError("Reciept constructor argument must be populated!");  
            }
            this.reciever=obj.asker.fullName;
            this.recieverNid=obj.asker.nationalId;
            this.recieverPhone=obj.asker.phone;
            this.type='loan';
            this.recievedMoney=obj.totalAmount;
            this.description=[`در ${obj.shareCount} قسط`];
            this.description.push(`از حساب ${obj.fromAccount.account}`);
            if(obj.number){
                this.description.unshift(`با شماره ${obj.number}`);
            }
        }else if(obj instanceof CashHelp){
            if(!(obj.asker instanceof Person && obj.fromAccount.account)){
                throw new ValueError("Reciept constructor argument must be populated!");  
            }
            this.reciever=obj.asker.fullName;
            this.recieverNid=obj.asker.nationalId;
            this.recieverPhone=obj.asker.phone;
            this.type='cash-help';
            this.recievedMoney = obj.amount;
            this.description = [`از حساب ${obj.fromAccount.account}`,
                                `بابت ${obj.reason}`];
        }else if(obj instanceof GoodsHelp){
            if(!(obj.asker instanceof Person)){
                throw new ValueError("Reciept constructor argument must be populated!");  
            }
            this.reciever=obj.asker.fullName;
            this.recieverNid=obj.asker.nationalId;
            this.recieverPhone=obj.asker.phone;
            this.type='goods-help';
            this.recievedMoney = 0;
            this.description=[`اقلام: ${obj.items}`,
                              `بابت ${obj.reason}`];
        }else if(obj instanceof Service){
            if(!(obj.performer instanceof Person)){
                throw new ValueError("Reciept constructor argument must be populated!");  
            }
            this.reciever=obj.performer.fullName;
            this.recieverNid=obj.performer.nationalId;
            this.recieverPhone=obj.performer.phone;
            this.type=obj.type;
            this.recievedMoney=obj.cost;
            this.description=[`معرّف: ${obj.introducerName}`];
            this.description.push(`به تعداد ${obj.count} روز`);
        }else throw new ValueError("Reciept is only constructed from Loan,Service and Help!");
    }
}