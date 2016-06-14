myApp.controller('HomeController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {

  getUser();
  console.log('home controller running');
  $scope.message = "Home Controller!";
  $scope.day = moment();
  $scope.user_id= {};
  $scope.transactions = [];
  $scope.event = {};
  $scope.event.frequency = "NULL";
  $scope.changeTotalValue = {};
  var savedMonth = undefined;

  //notes
  // console.log('scope.day', $scope.day);
  // console.log('start of',moment().startOf('month'));
  // console.log('.day 0 gets beginning of week', moment().day(0));
  // console.log('end of month', moment().endOf('month'));


  var monthArray = [];

  var start = removeTime(moment().startOf('month'));

  console.log('thisMonth', start.month());


  console.log('month array', monthArray);



  function buildMonth(start, month){
    var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
    monthArray = [];
    while (!done) {
        monthArray.push({ days: buildWeek(date.clone(), month) });
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
    }
    var filterForBadWeek = [];
    filterForBadWeek = _.filter(monthArray[0].days, {'number': 1 })

    if (filterForBadWeek.length == 0){
      monthArray.shift();
      console.log('this ran');
    }
    $scope.monthArray = monthArray;
    $scope.month = moment().month(start.month() +1).format('MMMM');
    console.log('Currently viewed month Array', $scope.monthArray);
  }


  function buildWeek(date, month){
    var days = [];
    for (var i = 0; i < 7; i++) {
        days.push({
            name: date.format("dd").substring(0, 2),
            number: date.date(),
            isCurrentMonth: date.month() === month.month(),
            isToday: date.isSame(new Date(), "day"),
            date: moment(date, "MM-DD-YYYY"),
            transactions: applyTransactions(date)
        });

        date = date.clone();
        date.add(1, "d");
    }
    return days;
  }

  function removeTime(date) {
      return date.day(0).hour(0).minute(0).second(0).millisecond(0);
  }

  $scope.next = function() {
      if(savedMonth === undefined){
        savedMonth = start.clone();
      }
      var currentMonth = savedMonth.month()
      console.log(savedMonth.month());
      var next = removeTime(moment().month(savedMonth.month() + 2).date(0));
      savedMonth = next.clone()
      console.log('next month', next);
      buildMonth(next, next);
  };

  $scope.previous = function() {
    if(savedMonth === undefined){
      savedMonth = start.clone();
    }
    var currentMonth = savedMonth.month()
    console.log(savedMonth.month());
    var previous = removeTime(moment().month(savedMonth.month()).date(0));
    savedMonth = previous.clone()
    console.log('previous month', previous);
    buildMonth(previous, previous);
  };




  function getUser() {
  $http.get('/router').then(function(response) {
        if(response.data.username) {
            $scope.userName = response.data.username;
            $scope.user_id = response.data.id;
            getTransactions(response.data.id);
            getTotal(response.data.id);
        } else {
            $location.path("/login");
        }

    });
  }


  $scope.logout = function() {
    $http.get('/router/logout').then(function(response) {
      console.log('logged out');
      $location.path("/login");
    });
  };

  function getTransactions(id) {

    $http.get('/transactions/' + id).then(function(response){

    $scope.transactions = response.data;
    console.log("transactions", $scope.transactions);
    buildMonth(start, start);
    })

  }
function getTotal(id) {
  $http.get('/transactions/total/' + id).then(function(response){
    $scope.total = response.data;
    console.log('user total', $scope.total);
    if ($scope.total.length == 0){
      setTotal(id);
    }
  })
}
function setTotal(id) {
  $http.post('/transactions/total/' + id).then(function(response){
    getTotal(id);
  })
}
$scope.changeTotal = function(){
  var total = {};
  total.balance = $scope.changeTotalValue.balance;
  total.user_id = $scope.user_id;
  console.log(total);
  $http.put('/transactions/total', total)
    .then(function (response) {
      console.log('changed transaction', response);
      getTotal($scope.user_id);
    })
}

function applyTransactions(date){
  var transactions= []
  //filterForBadWeek = _.filter(monthArray[0].days, {'number': 1 })
  transactions = _.filter($scope.transactions, {"execute_date": date._d.toString()})
  return transactions;
}


$scope.addEvent = function(date) {
  var transaction = {}
  transaction = $scope.event;
  transaction.user_id = $scope.user_id;
  transaction.execute_date = date.toString();

  console.log("sending form data", transaction);

$http.post('/transactions/' , transaction)
  .then(function (response) {
    console.log('event response', response);
    getTransactions($scope.user_id);
    $scope.selectedDay.transactions.push(transaction);
  });
 };





  // this interacts with the modal and connects through ng-modal.js and .css in vendors and is required in in clientapp.js. The HTML for the modal is stored in Home.html. By handling modals in this way I am able to avoid creating a modal service or seperate controller to deal with $scope.
   $scope.myData = {
    link: "http://google.com",
    modalShown: false,
    hello: 'world',
    foo: 'bar'
  }
  $scope.logClose = function() {
    console.log('close!');
  };
  $scope.toggleModal = function(selectedDay) {
    console.log(selectedDay);
    $scope.myData.modalShown = !$scope.myData.modalShown;
    $scope.selectedDay = selectedDay;
  };


  $scope.myTotal = {
    modalShown: false
  }
  $scope.toggleTotalModal = function(){
    $scope.myTotal.modalShown = !$scope.myTotal.modalShown;
  }







}]);
