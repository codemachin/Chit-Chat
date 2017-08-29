myApp.service('shopService', function($http){
	

	
	this.getLogin = function (data){
		return $http.post('./api/v1/users/login',data)
	} // end delete blog

	this.forgot = function(id){

		return $http.get('./mail/requestPass/'+id)

	} //end get all blogs

	this.verify = function(id){

		return $http.get('./otp/verify/'+id)

	} //end get all blogs

	this.updatePass = function(data){

		return $http.post('./account/update',data)

	} //end get all blogs

	this.postSignup = function(data){

		return $http.post('./api/v1/users/signup',data)

	} //end get all blogs

	
});