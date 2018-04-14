var express = require('express');
var router = express.Router();
var kafka = require('./kafka/client');


/* GET home page. */
router.post('/', function(req, res, next) {
    payload = {
        action:"billing",
        type:"add_bill",
        bill: {
            user:req.body.user,
            movie: req.body.movie,
            amount: req.body.amount,
            tax: req.body.tax
        }
    }
    kafka.make_request('requestTopic',payload, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            throw err;
        }
        else
        {
            console.log(results);
            res.send(results);   
        }
    });
  
});

router.get('/:billID', function(req,res){
    payload = {
        action:"billing",
        type:"get_bill",
        bill_id:req.params.billID
    }
    kafka.make_request('requestTopic',payload, function(err,results){
        console.log('in result');
        console.log(results);
        if(err){
            throw err;
        }
        else
        {
            console.log(results);
            res.send(results);   
        }
    }); 
});

module.exports = router;