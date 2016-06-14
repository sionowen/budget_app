var express = require('express');
var router = express.Router();
var path = require('path');
var pg = require('pg');
var connectionString = 'postgres://localhost:5432/budget';


router.get('/:id', function(req, res) {

  var user_id = req.params.id;
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

router.post('/', function(req, res) {

  var event = req.body;
  if (event.frequency == "NULL"){
    event.frequency = null;
    console.log("setting frequency to null");
  }
  console.log("event added", event);
  pg.connect(connectionString, function(err, client, done){
    if (err) {
      res.sendStatus(500);
      return
    }
    client.query('INSERT INTO events (transaction, name, amount, recurring, frequency, execute_date, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',  [event.transaction, event.name, event.amount, event.recurring, event.frequency, event.execute_date, event.user_id],
      function(err, result){
      done();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);

    })
  })

})


router.get('/total/:id', function(req, res) {

  var user_id = req.params.id;

  pg.connect(connectionString, function (err, client, done) {
    if (err) {
      res.sendStatus(500);
      return;
    }
    client.query('SELECT * FROM total WHERE user_id =' + user_id, function (err, result) {
      done();



    res.send(result.rows);

    });
  });
});

router.post('/total/:id', function(req, res) {

  var user_id = req.params.id;

  pg.connect(connectionString, function(err, client, done){
    if (err) {
      res.sendStatus(500);
      return
    }
    client.query('INSERT INTO total (balance, user_id) VALUES ($1, $2)',  [0, user_id],
      function(err, result){
      done();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);

    })
  })

})

router.put('/total', function(req, res) {

  var total = req.body;
  console.log("look here", total);
  pg.connect(connectionString, function(err, client, done){
    if (err) {
      res.sendStatus(500);
      return
    }
    client.query('UPDATE total SET balance = $1 WHERE user_id =' + total.user_id, [total.balance],
      function(err, result){
      done();
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }

      res.sendStatus(200);

    })
  })

})

module.exports = router;
