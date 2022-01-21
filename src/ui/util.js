import persianDate from 'persian-date';
var months=persianDate.rangeName().months;
import Vue from 'vue';
var dialog;
if(process.env.IS_ELECTRON){
    dialog=require('electron').remote.dialog;
}
Vue.mixin({
    methods:{
        todayString(){
            return new persianDate().toLocale('en').format('YYYY-MM-DD');
        },
        persianFormat(date){//date:With format yyyy-mm[-dd] and from Jalali calendar
            let [y,m,d]=date.split('-').map(x=>parseInt(x,10));
            return (d?(String(d)+" "):'')+months[m-1]+" "+String(y);
        },
        showMessageBox({type,buttons,title,message}){
            if(process.env.IS_ELECTRON){
                dialog.showMessageBox({type,buttons,title,message});
            }else{
                alert(message);//TODO complete this!
            }
        },
        showOpenDialog({title,properties},cb){
            if(process.env.IS_ELECTRON){
                dialog.showOpenDialog({title,properties},cb);
            }
        }
    }
});
export default{}