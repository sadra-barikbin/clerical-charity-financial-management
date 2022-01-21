<template>
   <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="10"
    class="elevation-1"
  >
    <template #[`item.asker`]="{ item }">
      {{item.asker.fullName}}
    </template>
    <template #[`item.recieveDate`]="{item}">
      {{persianFormat(item.recieveDate)}}
    </template>
    <template #[`item.fromAccount`]="{item}">
      {{item.fromAccount?item.fromAccount.account:'--'}}
    </template>
    <template #[`item.amount`]="{item}">
      <template v-if="item.type==='CASH'">
        {{item.amount}}<span class="light"> تومان</span>
      </template>
      <template v-else>
        {{item.items}}
      </template>
    </template>
  </v-data-table>
</template>

<script>
export default {
    name:'HelpsTable',
    data(){
        return{
            headers:[
                {text: 'نام و نام خانوادگی',align: 'start',sortable: false,value: 'asker'},
                { text: 'تاریخ دریافت', value: 'recieveDate'},
                { text: 'مبلغ/کالا', value: 'amount' },
                { text: 'از حساب', value: 'fromAccount',sortable:false },
            ],
        }
    },
    props:{
        items:Array
    }
}
</script>

<style>

</style>