const ValueError = require('../../errors/ValueError');
var ExcelJS = require('exceljs');
const Loan = require('../Loan');
const Help = require('../help/Help');
const CashHelp = require('../help/CashHelp');
const Service = require('../service/Service');
const Receipt = require('../Receipt');

let remote = require('electron').remote;
let fs = remote.require('fs');

module.exports = class ExcelReport{
    prepareForExcel(item){
        let res = Object.assign({},item);
        if(item instanceof Loan){
            if( typeof(res.asker) === 'string' || 
                typeof(res.sureties[0]) === 'string' || 
                typeof(res.sureties[1]) === 'string' ||
                typeof(res.fromAccount) === 'string'
                ){
                throw new ValueError("ExcelReport input items must be populated!");
            }
            res.askerName=res.asker.fullName;
            res.askerNid=res.asker.nationalId;
            delete res.asker;
            res.surety1name=res.sureties[0].fullName;
            res.surety1nid=res.sureties[0].nationalId;
            res.surety2name=res.sureties[1].fullName;
            res.surety2nid=res.sureties[1].nationalId;
            delete res.sureties;
            res.fromAccount=res.fromAccount.account;
            res.delayedInstallmentsCnt=res.delayedInstallmentNumbers.length;
            delete res.delayedInstallmentNumbers;
        }else if(item instanceof Help){
            if(typeof(res.asker) === 'string' || 
              ((item instanceof CashHelp) && (typeof(res.fromAccount) === 'string'))){
                throw new ValueError("ExcelReport input items must be populated!");
            }
            res.type = res.type === 'CASH'?'نقدی':'جنسی';
            res.amount = res.amount || res.items;
            delete res.items;
            res.askerName = res.asker.fullName;
            res.askerNid = res.asker.nationalId;
            delete res.asker;
            if(res.fromAccount){
                res.description = res.fromAccount.account;
                delete res.fromAccount;
            }
        }else if(item instanceof Service){
            if(typeof(res.performer)==='string'){
                throw new ValueError("ExcelReport input items must be populated!");
            }
            res.performerName=res.performer.fullName;
            res.performerNid=res.performer.nationalId;
            delete res.performer;
            res.type=res.type==='fasting'?'روزه':'نماز';
        }else if(item instanceof Receipt){
            res.description = res.description.join('\r\n');
            res.type = res.type === 'loan'?'وام':
                       res.type === 'help'?'کمک':
                       res.type === 'fasting'?'روزه':
                       res.type === 'prayer'?'نماز':
                       res.type === 'cash-help'?'کمک نقدی':'کمک جنسی';
        }
        return res;
    }
    sheetTypes={
        'loan':{columns:[
            { header: 'نام کامل',key: 'askerName'},
            { header: 'شماره ملّی',key: 'askerNid'},
            { header: 'نام ضامن اوّل',key: 'surety1name'},
            { header: 'شماره ملّی ضامن اوّل',key: 'surety1nid'},
            { header: 'نام ضامن دوم',key: 'surety2name'},
            { header: 'شماره ملّی ضامن دوم',key: 'surety2nid'},
            { header: 'مبلغ کل', key: 'totalAmount',width:15},
            { header: 'تاریخ دریافت',key: 'recieveDate'},
            { header: 'تاریخ آغاز بازپرداخت',key: 'payBackStartDate'},
            { header: 'تعداد اقساط', key: 'shareCount'},
            { header: 'از حساب',key: 'fromAccount'},
            { header: 'تعداد اقساط معوّقه',key: 'delayedInstallmentsCnt'},
            { header: 'شماره وام',key: 'number'},
            { header: 'توضیحات',key: 'description',width:40}
        ],title:'گزارش وام'},
        'help':{columns:[
            { header: 'نام کامل',key: 'askerName'},
            { header: 'شماره ملّی',key: 'askerNid'},
            { header: 'نوع', key: 'type'},
            { header: 'مبلغ/کالا', key: 'amount',width:15},
            { header: 'تاریخ دریافت',key: 'recieveDate'},
            { header: 'بابت',key: 'reason',width:40},
            { header: 'توضیحات',key: 'description',width:40}
        ],title:'گزارش کمک'},
        'service':{columns:[
            { header: 'نام کامل',key: 'performerName'},
            { header: 'شماره ملّی',key: 'performerNid'},
            { header: 'تاریخ دریافت',key: 'recieveDate'},
            { header: 'نام مشتری',key: 'customerName'},
            { header: 'نام معرّف',key: 'introducerName'},
            { header: 'اجرت', key: 'cost',width:15},
            { header: 'بابت',key: 'type'},
            { header: '(روز)تعداد',key: 'count'}
        ],title:'گزارش روزه‌نماز'},
        'receipt':{columns:[
            { header: 'نام کامل',key: 'reciever'},
            { header: 'شماره ملّی',key: 'recieverNid'},
            { header: 'شماره تماس',key: 'recieverPhone'},
            { header: 'نوع',key: 'type'},
            { header: 'توضیحات',key: 'description',width:50}
        ],title:'گزارش دریافتی‌ها'}
    }
    constructor(items){
        for(let i=0;i<items.length-1;i++){
            if(typeof(items[i])!==typeof(items[i+1])){
                throw new ValueError("ExcelReport constructor argument items must be of the same type!")
            }
        }
        let sheetType=  (items[0] instanceof Loan)?'loan':
                        (items[0] instanceof Help)?'help':
                        (items[0] instanceof Service)?'service':
                        (items[0] instanceof Receipt)?'receipt':null;
        if(!sheetType){
            throw new ValueError("ExcelReport constructor argument items must be of types Loan,Help,Service or Receipt");
        }
        this.workbook = new ExcelJS.Workbook();
        const sheet = this.workbook.addWorksheet(this.sheetTypes[sheetType].title,
                                                {properties:{defaultColWidth:20}});
            
        sheet.columns=this.sheetTypes[sheetType].columns;
        for(let item of items){
            sheet.addRow(this.prepareForExcel(item));
        }
        sheet.getRow(1).fill={
            type:'pattern',
            pattern:'solid',
            fgColor:{argb:'C066BB6A'}
        }
        sheet.views=[{state:'normal',rightToLeft:true}];
    }
    async save(path){
        let output=fs.createWriteStream(path);
        await this.workbook.xlsx.write(output);
        output.close();
    }
}