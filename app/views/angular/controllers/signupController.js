myApp.controller('signupController',['$http','$routeParams','shopService',function($http,$routeParams,shopService) {

  //create a context
  var main = this;
  this.email="";
  this.password="";
  this.firstName="";
  this.lastName="";
  this.userName="";
  
  this.baseUrl = './users/signup';
  

  this.signup = function(){

  	var myData = {

      		  firstName: main.firstName,
      			lastName: main.lastName,
            email: main.email,
            password: main.password,
            userName: main.userName

        }
   
      shopService.postSignup(myData)
        .then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            if(response.data.status==200){
            	window.location = "/chat"
            } else{
            	alert(response.data.message)
            }
            
            

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert("some error occurred. Check the console.");
          console.log(response);
        });


  }// end load single match




}]); // end controller