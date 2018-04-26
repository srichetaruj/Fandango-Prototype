var express = require('express');
var router = express.Router();
var kafka = require('./kafka/client');

router.get('/getrevenuebymovie', (req, res) => {
    payload = {
        action: "admin",
        type: "get_revenue_by_movie"
    };
    kafka.make_request('requestTopic',payload, function(err,results){
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

router.get('/getrevenuebymoviehall', (req, res) => {
    payload = {
        action: "admin",
        type: "get_revenue_by_movie_hall"
    };
    kafka.make_request('requestTopic',payload, function(err,results){
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

router.get('/getmoviehallinfo', (req, res) => {
    payload = {
        action: "admin",
        type: "get_movie_hall_info"
    };
    kafka.make_request('requestTopic',payload, function(err,results){
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

router.post('/addmoviehall', (req, res) => {
    payload = {
        action: "admin",
        type: "add_movie_hall",
        movie_hall_name: req.body.movie_hall_name,
        ticket_price: req.body.ticket_price,
        city: req.body.city,
        max_seats: req.body.max_seats
    };
    kafka.make_request('requestTopic',payload, function(err,results){
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

<<<<<<< HEAD
=======
router.post('/editmoviehall', (req, res) => {
    payload = {
        action: "admin",
        type: "edit_movie_hall",
        movie_hall_id: req.body.movie_hall_id,
        movie_hall_name: req.body.movie_hall_name,
        ticket_price: req.body.ticket_price,
        city: req.body.city,
        max_seats: req.body.max_seats
    };
    kafka.make_request('requestTopic',payload, function(err,results){
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

router.get('/getuserbilldetails', (req, res) => {
    payload = {
        action: "admin",
        type: "get_user_bill_details"
    };
    kafka.make_request('requestTopic',payload, function(err,results){
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

>>>>>>> 01ec5579dd35744eb05fcf433bcc3f6beec3e45a
module.exports = router;