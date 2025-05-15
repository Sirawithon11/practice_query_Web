const express = require('express') ;
const {getItems , createItem ,updateItems , deleteItems , getItem} = require('../controller/items')
const router = express.Router() ;

router.route('').get(getItems).post(createItem) ;
router.route('/:id').get(getItem).put(updateItems).delete(deleteItems) ;


module.exports = router ;
