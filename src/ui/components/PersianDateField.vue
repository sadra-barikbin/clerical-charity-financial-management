<template>
    <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
        <template v-slot:activator="{ on }">
            <v-text-field @input="changeDateByInput" :error-messages="inputError" :value="date" :rules="rules" :label="label" :outlined="outlined" :disabled="disabled" prepend-icon="event"  v-on="on">
                <template #append>
                    <slot name="append"></slot>
                </template>
            </v-text-field>
        </template>
        <!-- <v-date-picker :min="min" :max="max" locale="fa" first-day-of-week="6" :type="dtype" v-model="ddate" @input="menu = false"></v-date-picker> -->
        <v-card>
            <v-card-title :style="{backgroundColor:color,color:'white'}">
                <v-container style="padding-top:0">
                    <v-row><v-btn color="white" text @click="pickView='year'">{{pickerDate.year()}}</v-btn></v-row>
                    <v-row :style="{fontWeight:500,fontSize:'xx-large'}">{{datePropInstance().toLocale('fa').format(type!=='month'?'dddd,D MMMM':'MMMM YYYY')}}</v-row>
                </v-container>
            </v-card-title>
            <v-card-text style="overflow:auto;max-height:330px">
                <v-container>
                    <v-row v-if="pickView!=='year'" no-gutters justify="center">
                        <v-btn icon @click="pickerDate=pickerDate.subtract(pickView==='day'?'months':'years',1)">
                            <v-icon>mdi-chevron-right</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn @click="pickView=pickView==='day'?'month':'year'" text light>{{pickView==='month'?pickerDate.year():pickerDate.format('MMMM YYYY')}}</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="pickerDate=pickerDate.add(pickView==='day'?'months':'years',1)">
                            <v-icon>mdi-chevron-left</v-icon>
                        </v-btn>
                    </v-row>
                    <v-row justify="center">
                        <table v-if="pickView!=='year'">
                            <thead v-if="pickView==='day'">
                                <tr>
                                    <th  v-for="(wd,i) in weekDayLegend" :key="`weeklegend_${i}`" >{{wd}}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row,i) in pickerDateTable" :key="`r${i}`">
                                    <td v-for="(item,j) in row" :key="`r${i}c${j}`" style="text-align:center">
                                        <v-btn v-if="pickView==='day' && item.name>0" @click="clickItem(item.name)"   class="pickerdaybtn" x-small :color="item.selected?color:undefined" text rounded :outlined="item.selected" :disabled="item.disabled">{{item.name}}</v-btn>
                                        <v-btn v-if="pickView==='month'" @click="clickItem(item.number)" :color="item.selected?color:undefined" text :outlined="item.selected" :disabled="item.disabled">{{item.name}}</v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <v-col v-else>
                            <v-list>
                                <v-list-item  @click="clickItem(pickerDate.year()+y-80)" v-for="y in 160" :key="y" v-focus="y==80">
                                    <v-list-item-content :style="{color:y==80?color:undefined}"><strong style="text-align:center">{{pickerDate.year()+y-80}}</strong></v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>        
	</v-menu>
</template>

<script>
import persianDate from 'persian-date';
export default {
    name:'PersianDateField',
    data(){
        return{
            menu:false,
            pickerDate:new persianDate(this.date?this.date.split('-').map(x=>parseInt(x,10)):null),
            weekDayLegend:persianDate.rangeName().weekdaysMin,
            pickView: this.type==='month'?'month':'day',
            inputError:null
            // ddate:this.date
        }
    },
    props:{
        type:{
            type:String,
            default:'day'
        },
        min:String,
        max:String,
        label:String,
        outlined:Boolean,
        disabled:Boolean,
        date:String,
        color:{
            type:String,
            default:'#1976d2'
        },
        rules:Array,
        dtype:String
    },
    model:{
      prop:'date',
      event:'change'
    },
    methods:{
        clickItem(item){
            if(this.pickView==='year'){
                this.pickerDate.year(item);
                this.pickView='month';
            }else if(this.pickView==='month'){
                this.pickerDate.month(item);
                if(this.type!=='month'){
                    this.pickView='day';
                }else{
                    this.menu=false;
                    let fmtstr=this.pickerDate.toLocale('en').format('YYYY-MM');
                    this.pickerDate.toLocale('fa');
                    this.inputError=null;
                    this.$emit('change',fmtstr);
                }
            }else{
                this.pickerDate.date(item);
                this.menu=false;
                let fmtstr=this.pickerDate.toLocale('en').format('YYYY-MM-DD');
                this.pickerDate.toLocale('fa');
                this.inputError=null;
                this.$emit('change',fmtstr);
            }
        },
        datePropInstance(){
            return new persianDate(this.date?this.date.split('-').map(x=>parseInt(x,10)):null);
        },
        changeDateByInput(e){
            if(!e){
                this.inputError=null;
                this.$emit('change',null);
                return;
            }
            if(this.type!=='month'){
                if(!/[0-9]{4}-[0-9]{2}-[0-9]{2}/.test(e)){
                    this.inputError='تاریخ را بدرستی وارد کنید!';
                }else{
                    this.inputError=null;
                    this.$emit('change',e);
                }
            }else{
                if(!/[0-9]{4}-[0-9]{2}/.test(e)){
                    this.inputError='تاریخ را بدرستی وارد کنید!';
                }else{
                    this.inputError=null;
                    this.$emit('change',e);
                }
            }
        }
    },
    computed:{
        pickerDateTable(){
            let table=[];
            let minDate;
            if(this.min){
                minDate=new persianDate(this.min.split('-').map(x=>parseInt(x,10)));
            }
            let maxDate;
            if(this.max){
                maxDate=new persianDate(this.max.split('-').map(x=>parseInt(x,10)));
            }
            if(this.pickView==='day'){
                let pickerDate=new persianDate(this.pickerDate).date(1);
                let firstDayOfMonth=pickerDate.day();
                let lastProcessedDay=0;
                for(let i=0;i<6;i++){
                    if(lastProcessedDay==pickerDate.daysInMonth()){break;}
                    let row=[];
                    for(let j=1;j<=7;j++){
                        if(i==0 && j<firstDayOfMonth){
                            row.push({name:j-firstDayOfMonth+1});
                        }else{
                            let theDay=pickerDate.add('days',lastProcessedDay);
                            theDay=new persianDate(theDay.toLocale('en').format('YYYY-MM-DD').split('-').map(x=>parseInt(x,10)));                                
                            let item={name:i*7+j-firstDayOfMonth+1};
                            if(minDate && minDate.diff(theDay)>0){
                                item.disabled=true;
                            }
                            if(maxDate && maxDate.diff(theDay)<0){
                                item.disabled=true;
                            }
                            if(theDay.toLocale('en').format('YYYY-MM-DD')===this.date){
                                item.selected=true;
                            }
                            row.push(item);
                            lastProcessedDay++;
                        }
                        if(lastProcessedDay==pickerDate.daysInMonth()){break;}
                    }
                    table.push(row);
                }
            }else if(this.pickView==='month'){
                let months=persianDate.rangeName().months;
                let pickerDate=new persianDate(this.pickerDate).month(1);
                for(let i=0;i<4;i++){
                    let row=[];
                    for(let j=1;j<=3;j++){
                        let item={name:months[i*3+j-1],number:i*3+j};
                        let theDay=pickerDate.add('months',i*3+j-1);
                        if(minDate && minDate.diff(theDay)>0){
                            item.disabled=true;
                        }
                        if(maxDate && maxDate.diff(theDay)<0){
                            item.disabled=true;
                        }
                        let date=this.type==='month'?this.date:this.date?this.date.slice(0,7):null;
                        if(theDay.toLocale('en').format('YYYY-MM')===date){
                            item.selected=true;
                        }
                        row.push(item);
                    }
                    table.push(row);
                }
            }
            return table;
        }
    },
    directives:{
        focus:{
            bind: (el,binding,vnode)=> {
                if (binding.value==undefined || binding.value) {
                    vnode.context.$nextTick(() => {
                        el.focus();
                    })
                }
            }
        }
    }
}
</script>

<style>
    .pickerdaybtn{
        width: 36px!important;
        height: 36px!important;
    }
</style>