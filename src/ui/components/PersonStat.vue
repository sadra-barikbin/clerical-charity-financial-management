<template>
  <v-col>
        <v-card v-for="figure in statFigures" :key="figure.title" :loading="figure.loading" :class="{'mb-5':true,'d-print-none':figure.no_stat}">
            <v-card-title>{{figure.title}}</v-card-title>
            <v-card-text v-if="!figure.loading">
                <v-row v-for="row in [1,2]" :key="`${figure.title}_r${row}`">
                    <v-col v-for="(item,i) in figure.items.slice((row-1)*3,row*3)" :key="`${figure.title}${i}`">
                        <v-row justify="center" class="mb-5">
                            <span>{{item.description}}</span>
                            </v-row>
                        <v-row justify="center">
                            <template v-if="!!item.data" >
                                <span class="print-small display-3 shabnam-font" style="text-align:center" >{{item.type==='date'?persianFormat(item.data):item.type==='descriptions'?item.data[0]:item.data}}</span>
                                <span v-if="item.type==='descriptions' && item.data.length>1" style="text-align:center">{{item.data[1]}}</span>
                                <span v-if="item.type==='amount'" style="align-self:flex-end" >{{item.unit==='day'?'روز':item.unit==='month'?'ماه':'تومان'}}</span>
                            </template>
                            <v-chip v-else>هنوز داده‌ای نیست!</v-chip>
                        </v-row>
                    </v-col>
                </v-row>
                <component v-if="figure.table" :person="person" :is="figure.table.component"></component>
            </v-card-text>
        </v-card>
    </v-col>
</template>

<script>
import Statistics from '@/model/Statistics';
import HelpsTable from './personStatTables/HelpsTable';
import SuretiesTable from './personStatTables/SuretiesTable';
import ServicesTable from './personStatTables/ServicesTable';
import LoansTable from './personStatTables/LoansTable';
export default {
    name:'PersonStat',
    activated(){
        if(this.person!=null) this.getStats(this.person);
    },
    mounted(){
        if(this.person!=null) this.getStats(this.person);
    },
    data(){
        return {
            statFigures:[
                {title:'روزه و نماز',items:null,loading:true,no_stat:false,table:{component:ServicesTable}},
                {title:'کمک',items:null,loading:true,no_stat:false,table:{component:HelpsTable}},
                {title:'وام',items:null,loading:true,no_stat:false,table:{component:LoansTable}},
                {title:'ضمانت',items:null,loading:true,no_stat:false,table:{component:SuretiesTable}}
            ],
        }
    },
    props:{
        person:Object
    },
    methods:{
        getStats(person){
            [Statistics.GetServiceStatsOf,
             Statistics.GetHelpStatsOf,
             Statistics.GetLoanStatsOf,
             Statistics.GetInsuranceStatsOf].forEach((f,i)=>{
                this.statFigures[i].loading=true;
                f(person).then(({stats,no_stat})=>{
                    this.statFigures[i].items=stats;
                    this.statFigures[i].loading=false;
                    this.statFigures[i].no_stat=no_stat;
                }).catch(e=>{
                    console.log(e);
                })
            });
        }
    },
    watch:{
        person(nperson){
            this.getStats(nperson);
        }
    },
}
</script>

<style scoped>
    .shabnam-font{
        font-family: 'Shabnam'!important;
    }
    @media print {
        .print-small{
            font-size: 1.75rem!important;
            line-height: 1.75em!important;
            letter-spacing: -0.008rem!important;
        }
    }
</style>