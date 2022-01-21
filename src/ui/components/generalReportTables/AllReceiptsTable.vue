<template>
   <v-data-table
    :headers="headers"
    :items="items"
    class="elevation-1"
  >
      <template #[`item.recieveDate`]="{item}">
        {{persianFormat(item.recieveDate)}}
      </template>
      <template #[`item.recievedMoney`]="{item}">
        {{item.recievedMoney}}<span class="light"> تومان</span>
      </template>
      <template #[`item.type`]="{item}">
        {{item.type==="loan"?'وام':item.type==='help'?'کمک':item.type==='fasting'?'روزه':'نماز'}}
      </template>
      <template #[`item.description`]="{item}">
        <div>
          <span v-for="(desc,i) in item.description" :key="i" style="display:block">{{desc}}</span>
        </div>
      </template>
  </v-data-table>
</template>

<script>
export default {
    name:'AllReceiptsTable',
    data(){
        return{
            headers:[
                { text: 'نام کامل',sortable: false,value: 'reciever'},
                { text: 'تاریخ دریافت',value: 'recieveDate' },
                { text: 'مبلغ', value: 'recievedMoney' },
                { text: 'بابت',sortable: false, value: 'type' },
                { text: 'توضیحات',sortable: false, value: 'description' }
            ]
        }
    },
    props:{
        items:Array
    }

}
</script>

<style>

</style>