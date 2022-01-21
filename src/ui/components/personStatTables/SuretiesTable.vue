<template>
    <v-row><v-col>
        <v-subheader>{{title}}</v-subheader>
        <v-simple-table v-if="items.length>0">
            <template #default>
                <thead>
                    <tr>
                        <th>گیرنده وام</th>
                        <th>تاریخ دریافت</th>
                        <th>مبلغ وام</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,idx) in items" :key="`${title}${idx}`">
                        <td>{{ item.asker.fullName }}</td>
                        <td>{{ persianFormat(item.recieveDate) }}</td>
                        <td>{{ item.totalAmount }}<small> تومان</small></td>
                    </tr>
                </tbody>
            </template>
        </v-simple-table>
        <v-row v-else justify="center">
            <v-chip>هنوز داده‌ای نیست!</v-chip>
        </v-row>
    </v-col></v-row>
</template>

<script>
import LoanRepo from '@/data/LoanRepo';
export default {
    name:'SuretiesTable',
    created(){
        LoanRepo.GetInsuredLoansOf(this.person).then(ls=>{
            this.items=ls;
        });
    },
    props:{
        person:Object
    },
    data(){
        return{
            items:[],
            title:'افراد مورد ضمانت'
        }
    }
}
</script>

<style>

</style>