myApp.controller('resetController',['$http','$routeParams','shopService',function($http,$routeParams,shopService) {

  //create a context
  var main = this;
  this.email="";
  this.otp="";
  this.pass="";
  
  
  

  this.forgotMail = function(id){

    shopService.forgot(id)
      .then(function successCallback(response) {
            
            if(response.data.loginStatus==false){
                window.location="#/"
            }
            else if(response.data.status==200){
              alert(response.data.message);
              window.location="#/verifyOTP"

            } else {
              alert(response.data.message)
            }
          
          

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert("some error occurred. Check the console.");
          console.log(response);
        });
  }

  this.otpVerify = function(id){

    
    shopService.verify(id)
      .then(function successCallback(response) {
            
            if(response.data.loginStatus==false){
                window.location="#/"
            }
            else if(response.data.status==200){
              alert(response.data.message);
              window.location="#/updatePass"

            } else {
              alert(response.data.message)
            }
          
          

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert("some error occurred. Check the console.");
          console.log(response);
        });
  }

  this.updatePass = function(id){

    var data={
      password:main.pass
    }

    shopService.updatePass(data)
      .then(function successCallback(response) {
            
            if(response.data.verifying==false){
                window.location="#/"
            }
            else if(response.data.status==200){
              alert(response.data.message);
              window.location="#/"

            } else {
              alert(response.data.message)
            }
            
          

        }, function errorCallback(response) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          alert("some error occurred. Check the console.");
          console.log(response);
        });
  }





}]); // end controller