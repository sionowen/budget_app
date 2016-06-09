myApp.controller('HomeController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
  console.log('home controller running');
  $scope.message = "Home Controller!";
  $scope.day = moment();
  $scope.user_id= {};
  var savedMonth = undefined;

  //notes
  // console.log('scope.day', $scope.day);
  // console.log('start of',moment().startOf('month'));
  // console.log('.day 0 gets beginning of week', moment().day(0));
  // console.log('end of month', moment().endOf('month'));


  var monthArray = [];
//  var daysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var start = removeTime(moment().startOf('month'));

  console.log('thisMonth', start.month());

  buildMonth(start, start);
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
    console.log("bad week pre if", filterForBadWeek);
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
            transactions: []
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
      var previous = scope.month.clone();
      removeTime(previous.month(previous.month()-1).date(1));
      scope.month.month(scope.month.month()-1);
      buildMonth(scope, previous, scope.month);
  };


  getUser();

  function getUser() {
  $http.get('/router').then(function(response) {
        if(response.data.username) {
            $scope.userName = response.data.username;
            $scope.user_id = response.data._id;
            console.log('User Data: ', $scope.userName);
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



}]);
