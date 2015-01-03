/**
 * EccoZ
 * https://github.com/ahackl/EccoZ
 * Copyright (c) 2014 ; Licensed GPL 2.0
 */

var _service = angular.module('eccoz.services', []);


// based on:
// http://forum.ionicframework.com/t/how-to-call-a-function-at-specific
// -time-interval-in-application-instead-of-controller-level/8652/4
/*
_service.factory('ClockSrv', function($interval){
    'use strict';
    var service = {
        clock: addClock,
        cancelClock: removeClock
    };

    var clockElts = [];
    var clockTimer = null;
    var cpt = 0;

    function addClock(fn){
        var elt = {
            id: cpt++,
            fn: fn
        };
        clockElts.push(elt);
        if(clockElts.length === 1){ startClock(); }
        return elt.id;
    }
    function removeClock(id){
        for(var i in clockElts){
            if(clockElts[i].id === id){
                clockElts.splice(i, 1);
            }
        }
        if(clockElts.length === 0){ stopClock(); }
    }
    function startClock(){
        if(clockTimer === null){
            clockTimer = $interval(function(){
                for(var i in clockElts){
                    clockElts[i].fn();
                }
            }, 1000);
        }
    }
    function stopClock(){
        if(clockTimer !== null){
            $interval.cancel(clockTimer);
            clockTimer = null;
        }
    }

    return service;
});
*/