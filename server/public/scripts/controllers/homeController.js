myApp.controller('HomeController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {

  getUser();
  $scope.message = "Home Controller!";
  $scope.day = moment();
  $scope.user_id= {};
  $scope.transactions = [];
  $scope.event = {};
  $scope.event.frequency = "NULL";
  $scope.changeTotalValue = {};
  $scope.stopPrevious = moment().month();
  $scope.runningTotal = 0;
  $scope.runningTotalArray = [];
  var savedMonth = undefined;

  //notes
  // console.log('scope.day', $scope.day);
  // console.log('start of',moment().startOf('month'));
  // console.log('.day 0 gets beginning of week', moment().day(0));
  // console.log('end of month', moment().endOf('month'));


  var monthArray = [];

  var start = removeTime(moment().startOf('month'));

  console.log('thisMonth', start.month());


  console.log('current month', moment().month());



  function buildMonth(start, month){
    var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
    monthArray = [];
    $scope.month = moment().month(start.month() +1).format('MMMM');
    var viewedMonth = moment().month(start.month() +1);
    $scope.viewedMonth = viewedMonth.month();
    while (!done) {
        monthArray.push({ days: buildWeek(date.clone(), month, viewedMonth) });
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
    }
    var filterForBadWeek = [];
    filterForBadWeek = _.filter(monthArray[0].days, {'number': 1 })

    if (filterForBadWeek.length == 0){
      monthArray.shift();
    }
    $scope.monthArray = monthArray;

    console.log('Currently viewed month Array', $scope.monthArray);
  }


  function buildWeek(date, month, viewedMonth){
    var days = [];
    for (var i = 0; i < 7; i++) {
        days.push({
            name: date.format("dd").substring(0, 2),
            number: date.date(),
            isCurrentMonth: date.month() === month.month(),
            isViewedMonth: date.month() === viewedMonth.month(),
            isToday: date.isSame(new Date(), "day"),
            date: moment(date, "MM-DD-YYYY"),
            transactions: applyTransactions(date),
            endOfDay: calculateEndOfDay(date, viewedMonth)
        });
        date = date.clone();
        date.add(1, "d");
    }
    return days;
  }


//calculateEndOfDay(moment(Wed Jun 15 2016 00:00:00 GMT-0500 (CDT)));
  function calculateEndOfDay(date, viewedMonth){


    if(date._d.toString() == moment().startOf('month')._d.toString()){

      $scope.runningTotal = $scope.total[0].balance;
      return  calculateTransactionEffect(date);
    //Write another elseIF HERE to check if the day is the first day of a different month, if so this is where I would set
  }else if(date < moment().startOf('month')){

      return 0;

    } else if(date.month() != viewedMonth.month()  ){

      return 0;

    } else if(date.date() == 1 && date.month() == viewedMonth.month()  ){
      $scope.runningTotal = $scope.runningTotalArray[$scope.runningTotalArray.length -1]
      return calculateTransactionEffect(date);
    }else{

      return calculateTransactionEffect(date);

    }

  }
function calculateTransactionEffect(date){
  var daysTransactions = applyTransactions(date);
  var expenses = _.filter(daysTransactions, {'transaction': 'expense'})
  var incomes = _.filter(daysTransactions, {'transaction': 'income'})
  var eodChanger = $scope.runningTotal;

  for(var i = 0; i < expenses.length; ++i){
    eodChanger -= expenses[i].amount;
  }
  for (var i = 0; i < incomes.length; i++) {
    eodChanger += incomes[i].amount;
  }
  $scope.runningTotal = eodChanger
  return eodChanger
}

  function removeTime(date) {
      return date.day(0).hour(0).minute(0).second(0).millisecond(0);
  }

  $scope.next = function() {
    $scope.runningTotalArray.push($scope.runningTotal);
      if(savedMonth === undefined){
        savedMonth = start.clone();
      }
      var currentMonth = savedMonth.month()
      console.log(savedMonth.month());
      var next = removeTime(moment().month(savedMonth.month() + 2).date(0));
      savedMonth = next.clone()
      console.log('next month', next);
      buildMonth(next, moment());
  };

  $scope.previous = function() {
    $scope.runningTotalArray.pop()
    if(savedMonth === undefined){
      savedMonth = start.clone();
    }
    var currentMonth = savedMonth.month()
    console.log(savedMonth.month());
    var previous = removeTime(moment().month(savedMonth.month()).date(0));
    savedMonth = previous.clone()
    console.log('previous month', previous);
    buildMonth(previous, moment());
  };




  function getUser() {
  $http.get('/router').then(function(response) {
        if(response.data.username) {
            $scope.userName = response.data.username;
            $scope.user_id = response.data.id;
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
    buildMonth(start, moment());
    })

  }
function getTotal(id) {
  $http.get('/transactions/total/' + id).then(function(response){
    $scope.total = response.data;
    getTransactions(id);
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
    savedMonth = start.clone();
  });
 };

$scope.deleteEvent = function(transaction){
  console.log(transaction);
  $http.delete('/transactions/'+ transaction.id).then(function(response){
      getTransactions($scope.user_id);
      $scope.selectedDay.transactions = _.reject($scope.selectedDay.transactions, transaction);
      savedMonth = start.clone()
  })
}




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
