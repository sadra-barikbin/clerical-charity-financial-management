<template>
  <v-container>
      <template v-for="(serviceType,index) in serviceTypes">
        <v-form :ref="serviceType.type" v-model="serviceType.formValid" :key="serviceType.type">
            <strong>{{serviceType.title}}</strong>
            <!-- TODO: set regex rule foe customer name -->
            <v-text-field class="mt-3" required v-model="serviceType.customerName" label="نام سفارش دهنده" :rules="[v=>!!v|| 'این فیلد را خالی نگذارید!']"></v-text-field>
            <search-bar required v-model="serviceType.performer" label="بجا آورنده"  :rules="[s=> !!s||'یک مورد انتخاب کنید!']"></search-bar>
            <v-text-field required v-model="serviceType.introducerName" label="نام معرّف"  :rules="[v=> !!v||'این فیلد را خالی نگذارید!']"></v-text-field>
            <persian-date-field :rules="[v=>!!v|| 'این فیلد را خالی نگذارید!']" :max="todayString()" v-model="serviceType.date" label="زمان دریافت"></persian-date-field>
            <v-text-field  required v-model="serviceType.count" label="تعداد" hint="چند روز؟" dense min="1" :rules="[s=> !!s||'تعداد را خالی نگذارید!']" type="number"></v-text-field>
            <v-text-field  required v-model="serviceType.cost"  label="هزینه"  dense :rules="[v=>/^\d+$/.test(v)||'هزینه را صحیح وارد کنید!']" suffix="تومان"></v-text-field>
            <v-btn @click="newService(index)" :disabled="!serviceType.formValid || working" color="info" class="mt-2 mb-3">تایید</v-btn>
        </v-form>
        <v-spacer :key="`${index}-spacer`"></v-spacer>
      </template>      
  </v-container>
</template>

<script>
import SearchBar from './SearchBar';
import PersianDateField from '@/ui/components/PersianDateField';
import ServiceRepo from '@/data/ServiceRepo';
import Prayer from '@/model/service/Prayer';
import Fasting from '@/model/service/Fasting';
export default {
    name:'NewService',
    components:{SearchBar,PersianDateField},
    data(){
        return{
            serviceTypes:[
                {type:'prayer',title:'نماز جدید',customerName:null,
                performer:null,introducerName:null,count:1,cost:null,
                date:this.todayString(),formValid:false},

                {type:'fasting',title:'روزه جدید',customerName:null,
                performer:null,introducerName:null,count:1,cost:null,
                date:this.todayString(),formValid:false}
            ],
            working:false
        }
    },
    methods:{
        newService(index){
            let serviceType=this.serviceTypes[index];
            let constructor=serviceType.type==='prayer'?Prayer:Fasting;
            let service=new constructor(parseInt(serviceType.count,10),serviceType.customerName,serviceType.performer,serviceType.introducerName,serviceType.date,serviceType.cost);
            this.working=true;
            ServiceRepo.PutService(service).then(()=>{
                this.showMessageBox({type:'info',buttons:['باشه'],title:`${serviceType.title}`,message:'با موفقیت اضافه شد!'});
                this.$refs[serviceType.type][0].reset();
                this.working=false;
            }).catch(e=>{
                console.log(e);
            })
        }
    }
}
</script>

<style>

</style>