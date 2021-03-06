var conn = require('../pool');
var pageclicks = require('../schemas/pageclickslog');
var movieclicks = require('../schemas/movieclickslog');
var componentclicks = require('../schemas/componentclicklog');
var usertrace = require('../schemas/usertrace');

function handle_request(msg, callback){

    var res = {
        statusCode:200,
        message:""
    };

    if (msg.type === "get_revenue_by_movie"){
        let query = "select movie_id, movie_name, ifnull(revenue, 0) as revenue from\n" +
            "(select movie_id, title as movie_name from movies) a\n" +
            "left outer join\n" +
            "(select movie_id, sum(amount) as revenue from billing where is_cancelled <> 1 group by movie_id) b using (movie_id) order by revenue desc";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_revenue_by_movie_hall"){
        let query = "select movie_hall_id, movie_hall_name, ifnull(revenue, 0) as revenue from\n" +
            "(select movie_hall_id, movie_hall_name from movie_hall) a\n" +
            "left outer join\n" +
            "(select movie_hall_id, sum(amount) as revenue from billing where is_cancelled <> 1 group by movie_hall_id) b using (movie_hall_id) order by revenue desc";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_movie_hall_info"){
        let query = "select movie_hall_id, movie_hall_name, ticket_price, city, max_seats\n" +
            "from movie_hall left outer join screen using (movie_hall_id) group by movie_hall_id order by movie_hall_name";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "add_movie_hall"){
        let insertQuery = "insert into movie_hall (movie_hall_name, ticket_price, city)\n" +
            "values (?,?,?)";
        conn.query(insertQuery, [msg.movie_hall_name, msg.ticket_price, msg.city], function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                let selectQuery = "select distinct movie_hall_id from movie_hall where movie_hall_name = ? order by movie_hall_id desc";
                conn.query(selectQuery, [msg.movie_hall_name], function (err, result) {
                    if (err){
                        console.log(err);
                    }
                    else {
                        let movie_hall_id = result[0].movie_hall_id;
                        let insertScreensQuery = "insert into screen (movie_hall_id, screen_number, date_of_movie, max_seats) \n" +
                            "values (?, 1, current_date(), ?),\n" +
                            "(?, 1, current_date() + interval 1 day, ?), (?, 1, current_date() + interval 2 day, ?),\n" +
                            "(?, 1, current_date() + interval 3 day, ?), (?, 1, current_date() + interval 4 day, ?),\n" +
                            "(?, 1, current_date() + interval 5 day, ?), (?, 1, current_date() + interval 6 day, ?),\n" +
                            "(?, 2, current_date(), ?),\n" +
                            "(?, 2, current_date() + interval 1 day, ?), (?, 2, current_date() + interval 2 day, ?),\n" +
                            "(?, 2, current_date() + interval 3 day, ?), (?, 2, current_date() + interval 4 day, ?),\n" +
                            "(?, 2, current_date() + interval 5 day, ?), (?, 2, current_date() + interval 6 day, ?),\n" +
                            "(?, 3, current_date(), ?),\n" +
                            "(?, 3, current_date() + interval 1 day, ?), (?, 3, current_date() + interval 2 day, ?),\n" +
                            "(?, 3, current_date() + interval 3 day, ?), (?, 3, current_date() + interval 4 day, ?),\n" +
                            "(?, 3, current_date() + interval 5 day, ?), (?, 3, current_date() + interval 6 day, ?)";
                        let params = [];
                        for (let i = 0; i < 21; i++){
                            params.push(movie_hall_id);
                            params.push(msg.max_seats);
                        }
                        conn.query(insertScreensQuery, params, function (err, result) {
                            if (err){
                                console.log(err);
                            }
                            else {
                                res.message = "Movie Hall Added Successfully";
                                callback(null, res);
                            }
                        });
                    }
                });
            }
        });
    }

    if (msg.type === "edit_movie_hall"){
        let updateQuery = "update movie_hall inner join screen using (movie_hall_id) \n" +
            "set movie_hall.movie_hall_name = ?, movie_hall.ticket_price = ?, movie_hall.city = ?, screen.max_seats = ?\n" +
            "where movie_hall_id = ?";
        let params = [msg.movie_hall_name, msg.ticket_price, msg.city, msg.max_seats, msg.movie_hall_id];
        conn.query(updateQuery, params, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = "Movie Hall Info updated";
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_user_bill_details"){
        let query = "select billing_id, username, title as movie_name, movie_hall_name, screen_number, amount, \n" +
            "billing.date, if(is_cancelled = 1, 'Cancelled', 'Booked') as booking_status\n" +
            "from billing inner join users using (user_id)\n" +
            "inner join movies using (movie_id) \n" +
            "inner join movie_hall using (movie_hall_id)";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_movies_in_hall"){
        let query = "select movie_hall_id, screen_id, movie_hall_name, ticket_price, city, movie_id, screen_number, " +
            "slot1, slot2, slot3, slot4, max_seats, title as movie_name, see_it_in\n" +
            "from movie_hall inner join screen using (movie_hall_id) left outer join movies using (movie_id)\n" +
            "where movie_hall_id = (?) group by movie_id, screen_number order by movie_hall_id, screen_number";
        conn.query(query, [msg.movie_hall_id], function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "add_movie"){
        let insertQuery = "insert into movies (title, trailer_link, movie_characters, release_date, rating, photos, movie_length, see_it_in)\n" +
            "values (?,?,?,?,?,?,?,?)";
        let params = [msg.title, msg.trailer_link, msg.movie_characters, msg.release_date, msg.rating, msg.photos, msg.movie_length, msg.see_it_in];
        conn.query(insertQuery, params, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                let selectQuery = "select distinct movie_id from movies where title = ?";
                conn.query(selectQuery, [msg.title], function (err, result) {
                    if (err){
                        console.log(err);
                    }
                    else {
                        let movie_id = result[0].movie_id;
                        let insertTypeQuery = "insert into movie_type (movie_id, type) values (?,?)";
                        conn.query(insertTypeQuery, [movie_id, msg.movie_type], function (err, result) {
                            if (err){
                                console.log(err);
                            }
                            else {
                                res.message = "Movie Added Successfully";
                                callback(null, res);
                            }
                        });
                    }
                });
            }
        });
    }

    if (msg.type === "search_movie"){
        let query = "select movie_id, title as movie_name, trailer_link, movie_characters, DATE_FORMAT(release_date, '%Y-%m-%d') AS release_date, \n" +
            "rating, photos, movie_length, see_it_in, movie_type.type as genre\n" +
            "from movies inner join movie_type using (movie_id) \n" +
            "where title like '%"+ msg.searchtext +"%' order by movie_name";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "search_movie_hall"){
        let query = "select movie_hall_id, movie_hall_name, ticket_price, city, max_seats\n" +
            "from movie_hall left outer join screen using (movie_hall_id)\n" +
            "where movie_hall_name like '%"+ msg.searchtext +"%' \n" +
            "group by movie_hall_id order by movie_hall_name";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "search_bill_by_date"){
        let query = "select billing_id, username, title as movie_name, movie_hall_name, screen_number, amount,\n" +
            "billing.date, if(is_cancelled = 1, 'Cancelled', 'Booked') as booking_status\n" +
            "from billing inner join users using (user_id)\n" +
            "inner join movies using (movie_id)\n" +
            "inner join movie_hall using (movie_hall_id)\n" +
            "where date(billing.date) = STR_TO_DATE(?, '%m/%d/%Y')";
        conn.query(query, [msg.searchtext], function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "search_bill_by_month"){
        let query = "select billing_id, username, title as movie_name, movie_hall_name, screen_number, amount,\n" +
            "billing.date, if(is_cancelled = 1, 'Cancelled', 'Booked') as booking_status\n" +
            "from billing inner join users using (user_id)\n" +
            "inner join movies using (movie_id)\n" +
            "inner join movie_hall using (movie_hall_id)\n" +
            "where month(billing.date) = month(str_to_date(?, '%b'))";
        conn.query(query, [msg.searchtext], function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "edit_movie"){
        let updateQuery = "update movies inner join movie_type using (movie_id)\n" +
            "set title = ?, trailer_link = ?, movie_characters = ?, release_date = ?, rating = ?, photos = ?, movie_length = ?, see_it_in = ?, movie_type.type = ?\n" +
            "where movie_id = ?";
        let params = [msg.title, msg.trailer_link, msg.movie_characters, msg.release_date, msg.rating, msg.photos, msg.movie_length, msg.see_it_in, msg.movie_type, msg.movie_id];
        conn.query(updateQuery, params, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = "Edit Movie Successful";
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_user_details"){
        let query = "select user_id, username, first_name, last_name, address, city, state, zipcode, phone, email \n" +
            "from users where role = 0";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "delete_user"){
        let deleteQuery = "delete from users where user_id = ?";
        conn.query(deleteQuery, [msg.user_id], function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = "User Deleted Successfully ";
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_movies_graph_data"){
        let query = "select title as movie_name, year(billing.date) as movie_year, sum(amount) as revenue \n" +
            "from billing inner join movies using (movie_id) where is_cancelled <> 1\n" +
            "group by movie_id,movie_year order by revenue desc limit 10";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_cities_graph_data"){
        let query = "select city as city_name, year(billing.date) as city_year, sum(amount) as revenue \n" +
            "from billing inner join movie_hall using (movie_hall_id) where is_cancelled <> 1\n" +
            "group by city_name,city_year order by revenue desc limit 10";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_movie_halls_graph_data"){
        let query = "select movie_hall_name, sum(amount) as revenue \n" +
            "from billing inner join movie_hall using (movie_hall_id)\n" +
            "where month(billing.date) = month(current_date() - interval 1 month) and is_cancelled <> 1\n" +
            "group by movie_hall_id order by revenue desc limit 10";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_page_clicks"){
        pageclicks.find((err, result) => {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        }).select({"_id":0, "page":1, "clicks":1});
    }

    if (msg.type === "get_movie_clicks"){
        movieclicks.find((err, result) => {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        }).select({"_id":0, "title":1, "clicks":1});
    }

    if (msg.type === "get_movie_reviews"){
        let query = "select title as movie_name, count(movie_id) as reviews \n" +
            "from movie_review inner join movies using (movie_id) group by movie_id";
        conn.query(query, function (err, result) {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                res.message = result;
                callback(null, res);
            }
        });
    }

    if (msg.type === "get_less_seen"){
        componentclicks.find((err, result) => {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                less_seen = [result[0]];
                res.message = less_seen;
                callback(null, res);
            }
        }).sort("clicks");
    }

    if (msg.type === "get_user_trace"){
        usertrace.find((err, result) => {
            if (err){
                res.statusCode = 401;
                res.message = err;
                callback(err, res);
            }
            else {
                let i;
                let response_to_send = [];
                let response_obj;
                for(i = 0; i < result.length; i++){
                    response_obj = {};
                    response_obj.user_name = result[i].user.username;
                    response_obj.city = (result[i].user.city == null ? '' : result[i].user.city);
                    response_obj.state = (result[i].user.state == null ? '' : result[i].user.state);
                    response_obj.zipcode = (result[i].user.zipcode == null ? '' : result[i].user.zipcode);
                    response_obj.path = result[i].path.join("-->");
                    response_to_send.push(response_obj);
                }
                res.message = response_to_send;
                callback(null, res);
            }
        }).select({"_id":0, "path":1, "user":1});
    }

}

exports.handle_request = handle_request;