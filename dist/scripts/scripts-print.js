"use strict";angular.module("happyChiefApp",["ngCookies","ngResource","ngSanitize","ngRoute"]).controller("PrintController",["$rootScope","$scope","$location","Recipe",function(a,b,c,d){console.log(c.path()),c.path().replace("/","")?d.get(c.path().replace("/","")).success(function(b){a.steps={},a.shopGroups={},a.data=b,a.now=new Date;for(var c in a.data.ingredients){var d=a.data.ingredients[c];"undefined"==typeof a.steps[d.step]&&(a.steps[d.step]=[]),a.steps[d.step].push(d),"undefined"==typeof a.shopGroups[d.shopGroup]&&(a.shopGroups[d.shopGroup]=[]),a.shopGroups[d.shopGroup].push(d)}}):window.location="/"}]).run(["$rootScope","$route","$location",function(){}]),angular.module("happyChiefApp").service("Recipe",["$http",function(a){return{get:function(b){return a.get("/recipes/"+b)},save:function(b){return b._id?a.put("/recipes/"+b._id,b):a.post("/recipes",b)},remove:function(b){return a.delete("/recipes/"+b)},randomList:function(b){return a({url:"/recipes/random/"+(b||5),method:"GET"})},getList:function(b){return a({url:"/recipes",method:"GET",params:b})}}}]);