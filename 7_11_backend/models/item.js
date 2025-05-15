const mongoose = require('mongoose') ;

const itemsSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : true ,

    } ,
    type : {
        type : String ,
        required : true
    } ,
    
    price : {
        type : Number ,
        required : true
    } ,

    amount : {
        type : Number ,
        required : true
    } ,

    creatDate : {
        type : Date ,
        default : Date.now
    } 

})

module.exports = mongoose.model('items',itemsSchema) ;