var mongoose = require('mongoose');
var Movie= require('../schemas/movies');
var pool = require('./../pool');

function handle_request(msg, callback){

    var res = {};

    if(msg.type =='getMovieDetail'){
      pool.getConnection(function(err, connection){
         connection.query("select * from movies m join movie_type mt where m.movie_id = "+msg.data ,function(err,rows){
           connection.release();//release the connection
           if(err) {
              res.code = "500";
              data = {success: false,message: "Cannot get Movie. Some internal error occured!"};
              res.value = data;
              callback(null, res);
            }
            if(rows!=undefined && rows.length>0) {
              var movie = rows[0];
              movie.type = rows.map(function(row,index){
                return row.type;
              })
              console.log(JSON.stringify(movie));
              data = {success: true,message: "Movie fetched successfully",movie : movie};
              res.code = "200";
              res.value = data;
              callback(null, res);
            }
            else{
              data = {success: false,message: "Movie does not exist"};
              res.code = "400";
              res.value = data;
              callback(null, res);
            }
         });
      })

    }
    if(msg.type == 'starMovie'){
      pool.getConnection(function(err, connection){
        connection.query("insert into movie_review (`movie_id`,`user_id`,`star`,`review_date`)  values ("
        + msg.data.movieid+
        ","+ msg.data.userid+
        ","+ msg.data.rating+
        ", CURDATE());" ,function(err,results, fields){
            connection.release();//release the connection
            if(err) {
              res.code = "500";
              data = {success: false,message: "Cannot add Movie review. Some internal error occured!"};
              res.value = data;
              callback(null, res);
            }else{
              data = {success: true,message: "Movie starred successfully!"};
              res.code = "200";
              res.value = data;
              callback(null, res);
            }
      });
    });
  }
  if(msg.type == 'reviewsOfMovie'){
    pool.getConnection(function(err, connection){
      connection.query("select u.username, mr.comment, mr.star, mr.review_date  from movie_review mr join users u on u.user_id = mr.user_id and mr.movie_id = "+ msg.data+";",function(err,rows){
        connection.release();//release the connection
        if(err) {
           console.log(err);
           res.code = "500";
           data = {success: false,message: "Cannot get Movie Reviewers. Some internal error occured!"};
           res.value = data;
           callback(null, res);
         }
         if(rows!=undefined && rows.length>0) {
           data = {success: true,message: "Movie Reviewers fetched successfully",movieReviewers : rows};
           res.code = "200";
           res.value = data;
           callback(null, res);
         }
         else{
           data = {success: false,message: "No Reviews Yet! Be the first one to review :-)"};
           res.code = "400";
           res.value = data;
           callback(null, res);
         }
      });
    })
  }

  if( msg.type == 'submitCommentToMovie'){
    pool.getConnection(function(err, connection){
      connection.query("insert into movie_review (`movie_id`,`user_id`,`comment`,`review_date`)  values ("
      + msg.data.movieid+
      ","+ msg.data.userid+
      ",'"+ msg.data.comment+
      "', CURDATE());" ,function(err,results, fields){
          connection.release();//release the connection
          if(err) {
            console.log(err);
            res.code = "500";
            data = {success: false,message: "Cannot add Movie comment. Some internal error occured!"};
            res.value = data;
            callback(null, res);
          }else{
            data = {success: true,message: " commented to movie successfully!"};
            res.code = "200";
            res.value = data;
            callback(null, res);
          }
    });
    })
  }


}

exports.handle_request = handle_request;
