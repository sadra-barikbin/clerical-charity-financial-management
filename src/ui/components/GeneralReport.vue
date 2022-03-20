<template>
  <v-container fluid>
      <v-form @submit.prevent="retrieveData()">
        <v-row>
          <v-col>
            <v-select
              v-model="formReportTopic"
              :items="reportTopics"
              label="موضوع"
            ></v-select>
            <v-select
              v-model="peopleType"
              :items="peopleTypes"
              :label="peopleTypeLabel"
            ></v-select>
            <v-select
              v-model="serviceType"
              :items="serviceTypes"
              label="نوع عمل"
              v-show="formReportTopic==='service'">
            </v-select>
          </v-col>
          <v-col>
            <v-menu
              v-model="startDateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="startDateText"
                  label="از تاریخ"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                @input="startDateMenu = false"
                locale="fa-IR"
                :first-day-of-week="6"
              ></v-date-picker>
            </v-menu>
            <v-menu
              v-model="endDateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="endDateText"
                  label="تا تاریخ"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="endDate"
                @input="endDateMenu = false"
                locale="fa-IR"
                :first-day-of-week="6"
              ></v-date-picker>
            </v-menu>
            <div style="text-align:left">
              <v-btn color="info" block type="submit">نمایش</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-form>
      <v-row>
        <v-col>
          <component :items="tableItems" v-if="reportTopic!=null" :is="tables[reportTopic]"></component>
        </v-col>
      </v-row>
      <v-row v-if="reportTopic" justify-end>
        <v-col style="text-align:left">
          <v-btn @click="exportExcel" color="green lighten-1" 
            rounded outlined :loading="exporting.running" :disabled="exporting.dialog || !tableItems.length">
            خروجی به اکسل
            <v-icon>mdi-file-excel-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>
  </v-container>
</template>

<script>
import Statistics from '@/model/Statistics';
import ExcelReport from '@/model/report/ExcelReport';
import LoanRepo from '@/data/LoanRepo';
import ServiceRepo from '@/data/ServiceRepo';
import HelpRepo from '@/data/HelpRepo';
import LoansTable from '@/ui/components/generalReportTables/LoansTable';
import ServicesTable from '@/ui/components/generalReportTables/ServicesTable';
import AllReceiptsTable from '@/ui/components/generalReportTables/AllReceiptsTable';
import HelpsTable from '@/ui/components/generalReportTables/HelpsTable';
import persianDate from 'persian-date';

let repos={service:ServiceRepo,loan:LoanRepo,help:HelpRepo};

export default {
    name:'GeneralReport',
    data(){
      return{
        reportTopics:[{text:'همه',value:'all'},{text:'روزه‌نماز',value:'service'},{text:'وام',value:'loan'},{text:'کمک',value:'help'}],
        formReportTopic:'service',
        reportTopic:null,
        peopleTypes:[{text:'همه',value:'all'},{text:'طلبه',value:'student'},{text:'غیر‌طلبه',value:'nonstudent'}],
        peopleType:'all',
        startDateMenu:false,
        startDate:new Date().toISOString().substr(0, 10),
        endDateMenu:false,
        endDate:new Date().toISOString().substr(0, 10),
        tables:{all:AllReceiptsTable,service:ServicesTable,loan:LoansTable,help:HelpsTable},
        tableItems: [],
        serviceTypes:[{text:'همه',value:'all'},{text:'نماز',value:'prayer'},{text:'روزه',value:'fasting'}],
        serviceType:'all',
        exporting:{
          running:false,
          dialog:false
        }
      }
    },
    computed:{
      startDateText(){
        return new persianDate(new Date(this.startDate)).format("YYYY-MM-DD");
      },
      endDateText(){
        return new persianDate(new Date(this.endDate)).format("YYYY-MM-DD");
      },
      peopleTypeLabel(){
        return 'نوع '+((this.formReportTopic==='service')?'بجاآورنده':'دریافت‌کننده');
      }
    },
    methods:{
      retrieveData(){
        let startDate=new persianDate(new Date(this.startDate)).toLocale('en').format('YYYY-MM-DD');
        let endDate=new persianDate(new Date(this.endDate)).toLocale('en').format('YYYY-MM-DD');
        if(this.formReportTopic!=='all'){
          let method=`Get${this.formReportTopic[0].toUpperCase()+this.formReportTopic.slice(1)}sWhich`;
          repos[this.formReportTopic][method](startDate,endDate,this.peopleType,this.serviceType)
          .then(ls=>{
            this.tableItems=ls;
            this.reportTopic = this.formReportTopic;
          });
        }else{
          Statistics.GetReceipts(startDate,endDate,this.peopleType).then(ls=>{
            this.tableItems=ls;
            this.reportTopic = this.formReportTopic;
          })
        }
      },
      exportExcel(){
        this.exporting.dialog=true;
        this.showOpenDialog({title:'مسیر ذخیره گزارش را انتخاب کنید!',properties:['openDirectory']},ps=>{
            if(!ps.length)return;
            this.exporting.running = true;
            this.exporting.dialog = false;
            let report = new ExcelReport(this.tableItems);
            report.save(`${ps[0]}/report.xlsx`).then(()=>{
                this.exporting.running=false;
                this.showMessageBox({type:'info',buttons:['باشه'],title:'گزارش‌گیری',message:'با موفقیت انجام شد!'});
            });
        });
      }
    }
}
</script>

<style>

</style>