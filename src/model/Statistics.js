import HelpRepo from '@/data/HelpRepo';
import ServiceRepo from '@/data/ServiceRepo';
import LoanRepo from '@/data/LoanRepo';
import PersonRepo from '@/data/PersonRepo';
import Receipt from '@/model/Receipt';
class Statistics{
    async GetHelpStatsOf(person){
        let helps=await HelpRepo.GetHelpsOf(person);
        let res=[{description:'تعداد دفعات دریافت کمک',data:helps.length,type:'count'}];
        res.push({description:'مجموع ارزش کمک‌های نقدی دریافتی',
            data:helps.reduce((sum,h)=>{
                if(h.type === 'CASH'){
                    return sum + h.amount;
                }else{
                    return sum;
                }
            },0),
            type:'amount',unit:'tomans'});
        res.push({description:'زمان دریافت آخرین کمک',data:helps.length?helps[helps.length-1].recieveDate:null,type:'date'});
        if(helps.length){
            let h=helps[helps.length-1];
            if(h.type === 'cash'){
                res.push({description:'آخرین کمک دریافتی',data:h.amount,type:'amount',unit:'tomans'})
            }else{
                res.push({description:'آخرین کمک دریافتی',data:h.items,type:'descriptions',unit:'stuff'})
            }
        }
        return {stats:res,no_stat:helps.length==0};
    }
    async GetServiceStatsOf(person){
        let [fastings,prayers]=await ServiceRepo.GetServicesOf(person);
        let res=[{description:'تعداد دفعات دریافت روزه و نماز',data:fastings.length+prayers.length,type:'count'}];
        res.push({description:'میزان نماز دریافتی',data:prayers.reduce((sum,p)=>sum+p.count,0),type:'amount',unit:'day'});
        res.push({description:'میزان روزه دریافتی',data:fastings.reduce((sum,p)=>sum+p.count,0),type:'amount',unit:'day'});
        return {stats:res,no_stat:(fastings.length+prayers.length)==0};
    }
    async GetInsuranceStatsOf(person){
        let loans=await LoanRepo.GetInsuredLoansOf(person);
        let res=[];
        res.push({description:'تعداد دفعات ضمانت وام',data:loans.length,type:'count'});
        res.push({description:'زمان آخرین ضمانت وام',data:loans.length?loans[loans.length-1].recieveDate:null,type:'date'});
        return {stats:res,no_stat:loans.length==0};
    }
    async GetLoanStatsOf(person){
        let loans=await LoanRepo.GetLoansOf(person);
        let res=[];
        res.push({description:'مجموع ارزش وام‌های دریافتی',data:loans.reduce((sum,h)=>sum+h.totalAmount,0),type:'amount',unit:'tomans'});
        res.push({description:'زمان دریافت آخرین وام',data:loans.length?loans[loans.length-1].recieveDate:null,type:'date'});
        let badPerform=null;
        for(let loan of loans){
            let delayedInsts=loan.delayedInstallmentNumbers.sort();
            if(delayedInsts.length>4){
                badPerform='با قاعده پنج قسط متناوب';
                break;
            }else if(delayedInsts.length>=3){
                let found=false;
                for(let i of [0,1]){
                    if((delayedInsts[i]+1==delayedInsts[i+1])&&(delayedInsts[i+1]+1==delayedInsts[i+2])){
                        badPerform='با قاعده سه قسط متوالی';
                        found=true;
                        break;
                    }
                }
                if(found)break;
            }
        }
        if(loans.length!=0){
            let data=[];
            data.push(badPerform?'بد‌حساب':'خوش‌حساب');
            if(badPerform)data.push(badPerform);
            res.push({description:'وضعیت کلّی',data,type:'descriptions'});
        }
        return {stats:res,no_stat:loans.length==0};
    }
    async GetGeneralStats(){
        return {people:{total:await PersonRepo.Count()},loans:{total:await LoanRepo.Count()}};
    }
    async GetReceipts(startDate,endDate,peopleType){
        let res=[];
        res=res.concat((await LoanRepo.GetLoansWhich(startDate,endDate,peopleType)).map(l=>new Receipt(l)));
        res=res.concat((await HelpRepo.GetHelpsWhich(startDate,endDate,peopleType)).map(h=>new Receipt(h)));
        res=res.concat((await ServiceRepo.GetServicesWhich(startDate,endDate,peopleType)).map(s=>new Receipt(s)));
        return res;
    }
}
const instance=new Statistics();
export default instance