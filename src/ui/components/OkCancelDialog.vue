<template>
    <v-dialog v-model="show" persistent :max-width="maxWidth">
        <v-card>
        <v-card-title class="headline mb-1">{{title}}</v-card-title>
        <v-card-subtitle>{{subtitle}}</v-card-subtitle>
        <v-card-text>
            <slot name="text"></slot>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="cancelClick" :disabled="cancelDisabled">
                    انصراف
            </v-btn>
            <v-btn color="green darken-1" text @click="okClick" :disabled="okDisabled">
                    تایید
            </v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name:'Dialog',
    props:{
        show:Boolean,
        title:String,
        subtitle:String,
        okClick:Function,
        cancelClick:Function,
        okDisabled:Boolean,
        cancelDisabled:Boolean,
        maxWidth:{
            type:String,
            default:"320"
        }
    },
    model:{
        prop:'show',
        event:'dialogShow'
    }
}
</script>

<style scoped>
.headline{
    font-family: 'Shabnam'!important;
}
</style>