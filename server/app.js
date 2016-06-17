var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment')
//server connection
var pg = require('pg');
// If we are running on Heroku, use the remote database (with SSL)
var connectionString = "";
if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL + "?ssl=true";
} else {
    // running locally, use our local database instead
    connectionString = 'postgres://localhost:5432/budget';
}


//passport connection
var passport = require('./strategies/user_sql.js');
var session = require('express-session');



//Route inclusion
var login = require('./router/login');
var register = require('./router/register');
var router = require('./router/routes');
var transactions = require('./router/transactions')

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Serve back static files
app.use(express.static(path.join(__dirname, './public')));

// Passport Session Configuration //
app.use(session({
   secret: 'secret',
   key: 'user',
   resave: 'true',
   saveUninitialized: false,
   cookie: {maxage: 60000, secure: false}
}));

// start up passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/register', register);
app.use('/router', router);
app.use('/login', login)
app.use('/transactions', transactions)
app.use('/', login);

// Handle index file separately
// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, './public/views/login.html'));
// })

app.set('port', process.env.PORT || 8675);
app.listen(app.get('port'), function() {
    console.log('Listening on port: ', app.get('port'));
});
