var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/budget';


router.get('/:id', function(req, res) {

  var user_id = req.params.id;
  console.log(user_id);
  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    client.query('SELECT * FROM events WHERE user_id =' + user_id, function (err, result) {
      done();



    res.send(result.rows);

    });
  });
});



module.exports = router;
