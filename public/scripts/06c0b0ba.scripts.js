"use strict";angular.module("quarak",["ui.gravatar","ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","ui.utils","angularCharts"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html"}).when("/projects/:projectId",{templateUrl:"views/project.html",controller:"ProjectCtrl"}).when("/projects/:projectId/expenses",{templateUrl:"views/expense.html",controller:"ExpenseCtrl"}).when("/projects/:projectId/settlements",{templateUrl:"views/settlement.html",controller:"SettlementCtrl"}).when("/profile",{templateUrl:"views/profile.html",controller:"ProfileCtrl"}).otherwise({redirectTo:"/"})}]).config(["$httpProvider",function(a){a.interceptors.push("AuthInterceptor")}]).run(["Session",function(a){a.setCurrentUser()}]),angular.module("quarak").controller("MainCtrl",["$scope","$location","Session","Project","$timeout",function(a,b,c,d,e){a.Session=c,a.signIn=function(b){a.alerts=[],c.login(b.email,b.password).then(function(){a.getProjects()},function(){a.addAlert({type:"danger",message:"Error: email or password incorrect."})})},a.signOut=function(){c.logout()},a.alerts=[],a.closeAlert=function(b){a.alerts.splice(b,1)},a.addAlert=function(b){a.alerts.push(b),"danger"!=b.type&&e(function(){a.alerts.splice(a.alerts.indexOf(b),1)},3e3)},a.$on("$locationChangeStart",function(){a.alerts=[]}),a.getProjects=function(){d.query().$promise.then(function(b){a.projects=b,a.setActiveProject(b[0])})},a.setActiveProject=function(c){c!==a.activeProject&&(a.activeProject=c,b.path("/projects/"+c.id))},c.currentUser&&a.getProjects()}]),angular.module("quarak").controller("ExpenseCtrl",["$scope","$routeParams","Expense","Project","Session","$window",function(a,b,c,d,e,f){a.expenses=null,a.dateFormat="yyyy-MM-dd",a.open=function(b){b.preventDefault(),b.stopPropagation(),a.opened=!0},a.activeExpense=new c({date:new Date,projectId:b.projectId,payer_id:e.currentUser.id}),a.save=function(d){d.member_ids=d.members.map(function(a){return a.id}),delete d.members,_.include(a.expenses,d)?c.update(d):d.$save().then(function(){a.expenses.push(d),a.activeExpense=new c({date:new Date,projectId:b.projectId,payer_id:e.currentUser.id,members:a.project.members.filter(function(a){return a.active})})})},a.remove=function(b){var c=f.confirm("Are you absolutely sure you want to delete?");if(c){var d=a.expenses.indexOf(b);a.expenses.splice(d,1),b.$remove()}},a.displayMembers=function(a){return a.map(function(a){return a.name}).join(", ")},function(){d.get({id:b.projectId}).$promise.then(function(b){a.project=b,a.activeExpense.members=b.members.filter(function(a){return a.active})}),a.expenses=c.query({projectId:b.projectId})}()}]),angular.module("quarak").controller("SettlementCtrl",["$scope","$routeParams","Settlement","Project","Session",function(a,b,c,d,e){function f(){a.activeSettlement=new c({projectId:b.projectId,payer_id:e.currentUser.id})}function g(){a.settlements=c.query({projectId:b.projectId})}a.settlements=[],a.save=function(a){a.$save(function(){f(),g()},function(a){console.log(a)})},a.remove=function(){},function(){a.project=d.get({id:b.projectId}),g(),f()}()}]),angular.module("quarak").factory("Settlement",["$resource",function a(b){var a=b("/api/projects/:projectId/settlements/:id",{id:"@id",projectId:"@projectId"},{update:{method:"PUT"},query:{method:"GET",isArray:!0,transformResponse:function(a){return a=angular.fromJson(a),a.settlements}}});return a}]),angular.module("quarak").factory("Expense",["$resource",function b(a){var b=a("/api/projects/:projectId/expenses/:id",{id:"@id",projectId:"@projectId"},{by_month:{url:"/api/projects/:projectId/expenses_by_month",method:"GET",params:{projectId:"@projectId"}},by_category:{url:"/api/projects/:projectId/expenses_by_category",method:"GET",params:{projectId:"@projectId"}},update:{method:"PUT"},remove:{method:"DELETE",params:{projectId:"@project_id"}}});return b}]),angular.module("quarak").directive("qClearOnEsc",function(){return{restrict:"A",require:"ngModel",link:function(a,b,c,d){b.on("keydown",function(b){var c=b.which;a.$apply(function(){27===c&&(d.$setViewValue(""),d.$render())})})}}}),angular.module("quarak").factory("Session",["$q","$http","$window",function(a,b,c){var d={currentUser:null,logout:function(){return b["delete"]("/api/sign_out").success(function(){delete c.sessionStorage.currentUser,d.currentUser=null})},login:function(e,f){var g={email:e,password:f},h=a.defer();return b.post("/api/sign_in",g).success(function(a){c.sessionStorage.currentUser=JSON.stringify(a),d.currentUser=a,h.resolve(a)}).error(function(){delete c.sessionStorage.currentUser,d.currentUser=null,h.reject()}),h.promise},setCurrentUser:function(){c.sessionStorage.currentUser&&(d.currentUser=JSON.parse(c.sessionStorage.currentUser))}};return d}]),angular.module("quarak").factory("AuthInterceptor",["$rootScope","$q","$window",function(a,b,c){return{request:function(a){return a.headers=a.headers||{},c.sessionStorage.currentUser&&(a.headers.Authorization="Token token="+JSON.parse(c.sessionStorage.currentUser).token),a},responseError:function(a){return 401===a.status&&console.log("Not authorized!"),b.reject(a)}}}]),angular.module("quarak").factory("Project",["$resource",function(a){var b=a("/api/projects/:id",{id:"@id"},{update:{method:"PUT"}});return b}]),angular.module("quarak").factory("Profile",["$resource",function(a){var b=a("/api/profile",{},{update:{method:"PUT"}});return b}]),angular.module("quarak").controller("ProjectCtrl",["$scope","$routeParams","Expense","Project","Balance","Session",function(a,b,c,d,e,f){!function(){a.project=d.get({id:b.projectId}),a.expenses=c.query({projectId:b.projectId,limit:10}),a.balances=e.query({projectId:b.projectId}),c.by_month({projectId:b.projectId}).$promise.then(function(b){var c=[],d=0,e=0;angular.forEach(b.array,function(a,b){e++,d+=Math.ceil(parseInt(a)),c.push({x:b.substring(0,7),y:[Math.ceil(parseInt(a)),Math.ceil(d/e)]})}),a.monthChartData={series:["Months","Average"],data:c}}),a.monthChartConfig={legend:{display:!1,position:"right"},lineLegend:"traditional"},c.by_category({projectId:b.projectId}).$promise.then(function(b){var c=[];angular.forEach(b.array,function(a,b){c.push({x:b,y:[Math.ceil(parseInt(a))]})}),a.categoryChartData={series:["Categories"],data:c}}),a.categoryChartConfig={legend:{display:!0,position:"right"}},a.onlyActive=!0,a.filterByActive=function(b){return!a.onlyActive||b.member.active?!0:!1},a.onlyOwnExpenses=!0,a.filterByOwn=function(b){var c=$.map(b.members,function(a){return a.id});return!a.onlyOwnExpenses||$.inArray(f.currentUser.id,c)>=0?!0:!1}}()}]),angular.module("quarak").controller("ProfileCtrl",["$scope","$routeParams","Profile",function(a,b,c){a.save=function(){a.inProgress=!0,a.profile.$update(function(){a.inProgress=!1,a.addAlert({type:"success",msg:"Profile successfully saved."})},function(b){a.inProgress=!1;for(var c in b.data)a.addAlert({type:"danger",msg:b.data[c][0]})})},function(){a.profile=c.get()}()}]),angular.module("quarak").factory("Balance",["$resource",function c(a){var c=a("/api/projects/:projectId/balance",{id:"@id",projectId:"@projectId"});return c}]);