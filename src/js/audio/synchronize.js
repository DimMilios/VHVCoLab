'use strict';

// global variables?
var C_path
var w_path_sec
var rec_time
var score_meter_value

function calculate_C_D_path(D_array,wp_array){

    var len = D_array.length;
    var Dpath = new Array(len+1);
    var Cpath = new Array(len);
    for (let i=0; i<(len+1); ++i) Dpath[i] = 0;
    for (let i=0; i<len; ++i) Cpath[i] = 0;
    for (let i=len-1; i>=0; --i){
        Dpath[p] = D_array[wp_array[p,0]],[wp_array[p,1]];
        Cpath[p] = Dpath[p]-Dpath[p+1]; 
    }
    /* different syntax for the same process ?
    var p = len-1;
    while (p>=0){
        Dpath[p] = D_array[wp_array[p,0]],[wp_array[p,1]];
        Cpath[p] = Dpath[p]-Dpath[p+1];
        p = p - 1;
    }
    */
    C_path = Cpath; //assign to global variable?
}

function score_2_rec_time(wp_s_array,score_meter,score_bpm,score_rythm,){ //score_rythm only nominator (integer)
    var score_time = ((score_meter-1)*score_rythm)* 60/score_bpm; // time in seconds
    var i = 0;
    var rectime = 0;
    while (wp_s_array[i,0] > score_time){
        rectime = wp_s_array[i,1];
        ++i;
    }
    rec_time=rectime //assign to global variable?

}

function rec_time_2_score(wp_s_array,selected_rec_time,score_bpm,score_rythm,){ //score_rythm only nominator (integer)
    var i = 0;
    var scoretime = 0;
    while (wp_s_array[i,1] > selected_rec_time){
        scoretime = wp_s_array[i,1];
        ++i;
    }
    var scoremetervalue = scoretime*score_bpm/(60*score_rythm); // score meter number ( +- 1 ???)
    score_meter_value=scoremetervalue //assign to global variable?
    console.log("go to meter #", score_meter_value)

}