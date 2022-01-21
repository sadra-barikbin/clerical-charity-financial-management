<template>
    <v-container>
        <v-form ref="help" v-model="formValid">
            <v-subheader>مشخصات کمک را وارد کنید</v-subheader>
            <search-bar required v-model="helped" label="کمک گیرنده" :rules="[s=> !!s||'یک مورد انتخاب کنید!']"></search-bar>
            <v-radio-group dense v-model="type" row>
                <template v-slot:label>
                    <span>نوع کمک</span>
                </template>
                <v-radio label="نقدی" value="cash" selected></v-radio>
                <v-radio label="جنسی" value="good"></v-radio>
            </v-radio-group>
            <v-text-field v-if="type==='cash'" required v-model="amount" label="مبلغ" :rules="[v=>/^\d+$/.test(v)||'مبلغ را صحیح وارد کنید!']" suffix="تومان"></v-text-field>
            <v-text-field v-else required v-model="amount" label="کالا"></v-text-field>
            <v-textarea rows="2" v-model="reason" label="بابت"></v-textarea>
            <persian-date-field :rules="[v=>!!v|| 'این فیلد را خالی نگذارید!']" :max="todayString()" v-model="date" label="زمان دریافت"></persian-date-field>
            <v-select v-if="type==='cash'" required :rules="[v=>!!v|| 'یک مورد را انتخاب کنید!']" v-model="account" :items="availableBankAccounts" label="از محل حساب"></v-select>
            <v-btn @click="newHelp" :disabled="!formValid || working" color="info">تایید</v-btn>
        </v-form>
    </v-container>
</template>

<script>
import SearchBar from './SearchBar';
import PersianDateField from '@/ui/components/PersianDateField';
import BankAccountRepo from '@/data/BankAccountRepo';
import HelpRepo from '@/data/HelpRepo';
import CashHelp from '@/model/help/CashHelp';
import GoodsHelp from '@/model/help/GoodsHelp';
export default {
    name:'NewHelp',
    components:{
        SearchBar,PersianDateField
    },
    activated(){
        BankAccountRepo.GetAccounts().then(ss=>{
            this.availableBankAccounts=ss.map(x=>{return {text:`بانک ${x.account}`,value:x}});
        });
    },
    data(){
        return{
            availableBankAccounts:[],
            formValid:false,
            helped:null,
            amount:null,
            reason:null,
            date:this.todayString(),
            account:null,
            type:'cash',
            working:false
        }
    },
    methods:{
        newHelp(){
            this.working = true;
            let help;
            if(this.type === 'cash'){
                help = new CashHelp(parseInt(this.amount,10), this.account,
                                    this.helped, this.date, this.reason);
            }else{
                help = new GoodsHelp(this.amount, this.helped, this.date,
                                     this.reason);
            }
            HelpRepo.PutHelp(help).then(()=>{
                this.showMessageBox({type:'info',buttons:['باشه'],title:'کمک جدید',message:'با موفقیت ثبت شد!'});
                this.$refs.help.reset();
                this.working = false;
                this.type = 'cash';
            }).catch(e=>{
                console.log(e);
            });
        }
    }

}
</script>

<style>

</style>