<template>
  <v-container>
        <v-subheader>مشخصات وام را وارد کنید</v-subheader>
        <v-form v-model="valid" ref="form" class="pa-2">
            <search-bar required v-model="asker" label="گیرنده وام"></search-bar>
            <v-text-field  required :rules="[v=>/^\d+$/.test(v)||'مبلغ را صحیح وارد کنید!']" v-model="amount" suffix="تومان" label="مبلغ"></v-text-field>
            <v-text-field  required :rules="[v=>/^[1-9]\d*$/.test(v)||'تعداد را صحیح وارد کنید!']" v-model="shareCnt" label="تعداد اقساط"></v-text-field>
            <persian-date-field :rules="[v=>!!v|| 'این فیلد را خالی نگذارید!']" v-model="recieveDate" label="تاریخ دریافت"></persian-date-field>
            <persian-date-field  :rules="[v=>!!v|| 'این فیلد را خالی نگذارید!']" type="month" :min="minPaybackDate" v-model="paybackStartDate" label="تاریخ آغاز بازپرداخت">
              <template #append>
                <v-btn @click="setPaybackAccordRecieveDate()" v-if="!paybackAccordsRecieveDate" small rounded outlined class="mb-2" color="info" dense>مشابه تاریخ دریافت</v-btn>
              </template>
            </persian-date-field>
            <search-bar required v-model="surety1" label="ضامن اول"></search-bar>
            <search-bar required v-model="surety2" label="ضامن دوم"></search-bar>
            <v-text-field :rules="[v=>!v || /^\d+$/.test(v) ||'شماره را صحیح وارد کنید!']" v-model="number"  label="شماره وام" hint="اگر این وام شماره دارد"></v-text-field>
            <v-select v-model="fromAccount" :rules="[v=>!!v|| 'یک مورد را انتخاب کنید!']" :items="availableBankAccounts" label="از محل حساب"></v-select>
            <v-textarea dense rows="3" v-model="description" label="توضیحات"></v-textarea>
            <v-btn @click="makeLoan" :disabled="!valid || working" color="success">ثبت</v-btn>
        </v-form>
  </v-container>
</template>

<script>
import SearchBar from './SearchBar';
import LoanRepo from '@/data/LoanRepo';
import BankAccountRepo from '@/data/BankAccountRepo';
import Loan from '@/model/Loan';
import PersianDateField from '@/ui/components/PersianDateField';
import persianDate from 'persian-date';
export default {
    name:'NewLoan',
    components:{
      PersianDateField,SearchBar
    },
    activated(){
      BankAccountRepo.GetAccounts().then(ss=>{
            this.availableBankAccounts=ss.map(x=>{return {text:`بانک ${x.account}`,value:x}});
        });
    },
    data(){
      return{
        asker:null,
        amount:null,
        shareCnt:null,
        paybackStartDate:new persianDate().add('months',1).toLocale('en').format('YYYY-MM'),
        recieveDate:new persianDate().toLocale('en').format('YYYY-MM-DD'),
        description:null,
        surety1:null,
        surety2:null,
        fromAccount:null,
        availableBankAccounts:[],
        number:null,
        valid:false,
        working:false
      }
    },
    methods:{
      makeLoan(){
        if(this.asker._id===this.surety1._id || this.asker._id===this.surety2._id){
          this.showMessageBox({type:'error',buttons:['باشه'],title:'وام جدید',message:'گیرنده وام نمی تواند با ضامن‌ها یکی باشد!'});
          return;
        }
        if(this.surety1._id===this.surety2._id){
          this.showMessageBox({type:'error',buttons:['باشه'],title:'وام جدید',message:'ضامن‌ها نمی توانند یکی باشند!'});
          return
        }
        if(this.recieveDate.slice(0,7)>=this.paybackStartDate){
          this.showMessageBox({type:'error',buttons:['باشه'],title:'وام جدید',message:"تاریخ آغاز بازپرداخت باید بیشتر از تاریخ دریافت باشد!"});
          return;
        }
        let l=new Loan(parseInt(this.shareCnt,10),parseInt(this.amount,10),this.asker,[this.surety1,this.surety2],this.fromAccount,this.paybackStartDate,this.recieveDate,this.description,this.number);
        this.working=true;
        LoanRepo.Put(l)
        .then(()=>{
          this.showMessageBox({type:'info',buttons:['باشه'],title:'وام جدید',message:'با موفقیت ایجاد شد!'});
          this.$refs.form.reset();
          this.working=false;
        })
        .catch(e=>{
          //error UI
          console.log(e);
        })
      },
      setPaybackAccordRecieveDate(){
        this.paybackStartDate=this.minPaybackDate;
      },
    },
    computed:{
      paybackAccordsRecieveDate:function(){
        let payback=this.minPaybackDate;
        return this.paybackStartDate===payback;
      },
      minPaybackDate:function(){
        if(!this.recieveDate){
          return null;
        }
        let [y,m,d]=this.recieveDate.split('-').map(r=>parseInt(r,10));
        let pdate=new persianDate([y,m,d]).add('months',1);
        return pdate.toLocale('en').format('YYYY-MM');
      }
    }

     
}
</script>

<style>

</style>