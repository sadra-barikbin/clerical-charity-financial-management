<template>
    <v-row><v-col>
        <template v-for="i in 2">
            <v-subheader :key="`${titles[i-1]}_${i-1}_sh`">{{titles[i-1]}}</v-subheader>
            <v-simple-table :key="`${titles[i-1]}_${i-1}_table`" v-if="items[i-1].length>0">
                <template #default>
                    <thead>
                        <tr>
                            <th>تاریخ دریافت</th>
                            <th>اجرت</th>
                            <th>مشتری</th>
                            <th>تعداد</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,idx) in items[i-1]" :key="`${titles[i-1]}${idx}`">
                            <td>{{ persianFormat(item.recieveDate) }}</td>
                            <td>{{ item.cost }}<small> تومان</small></td>
                            <td>{{item.customerName}}</td>
                            <td>{{item.count}}<small> روز</small></td>
                            <td><v-btn icon @click="deleteService(i-1,idx,false)"><v-icon dense color="#EF5373">delete</v-icon></v-btn></td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
            <v-row v-else :key="`${titles[i-1]}_${i-1}_table_else`" justify="center">
                <v-chip>هنوز داده‌ای نیست!</v-chip>
            </v-row>
        </template>
        <ok-cancel-dialog v-model="deleteConfirmDialog.show" :okClick="deleteService.bind(null,deleteConfirmDialog.category,deleteConfirmDialog.index,true)" :cancelClick="cancelDeleteConfirmDialog" title="آیا مطمئن هستید؟">
        </ok-cancel-dialog>
    </v-col></v-row>
</template>

<script>
import OkCancelDialog from '@/ui/components/OkCancelDialog';
import ServiceRepo from '@/data/ServiceRepo';
export default {
    name:'ServicesTable',
    components:{OkCancelDialog},
    created(){
        ServiceRepo.GetServicesOf(this.person).then(ls=>{
            this.items=ls;
        });
    },
    props:{
        person:Object
    },
    data(){
        return{
            items:[[],[]],
            titles:['نماز‌های برعهده گرفته شده','روزه‌های برعهده گرفته شده'],
            deleteConfirmDialog:{
                show:false,category:null,index:null
            }
        }
    },
    methods:{
        deleteService(category,idx,force=false){
            if(!force){
                this.deleteConfirmDialog.show=true;
                this.deleteConfirmDialog.category=category;
                this.deleteConfirmDialog.index=idx;
                return;
            }
            ServiceRepo.RemoveService(this.items[category][idx]).then(()=>{
                this.items[category].splice(idx,1);
                this.cancelDeleteConfirmDialog();
            });
        },
        cancelDeleteConfirmDialog(){
            this.deleteConfirmDialog.show=false;
            this.deleteConfirmDialog.category=null;
            this.deleteConfirmDialog.index=null;
        }
    }
}
</script>

<style>

</style>