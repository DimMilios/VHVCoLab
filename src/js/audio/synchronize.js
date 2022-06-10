'use strict';

var synchronizeButton = document.getElementById('Synchronize');
synchronizeButton.addEventListener('click', startSynchronization);


// global variables

var D_array,wp_array,wp_s_array

var C_path
var rec_time
var score_measure_value


window.score_measure_value = score_measure_value
window.D_array = D_array
window.C_path = C_path
window.wp_array = wp_array
window.wp_s_array = wp_s_array
window.rec_time = rec_time

/*
function startSynchronization(audio_file,midi_file){
    console.log('syncButton clicked');

    wp_array = (wp from server)
    wp_s_array = (wp_s from server)
    D_array = (D from server)

    Synchronize.disabled = true;
}
*/




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
    rec_time=rectime //assign to global variable

}

function rec_time_2_score(wp_s_array,selected_rec_time,score_bpm,score_rythm,){ //score_rythm only nominator (integer)
    var i = 0;
    var scoretime = 0;
    while (wp_s_array[i,1] > selected_rec_time){
        scoretime = wp_s_array[i,1];
        ++i;
    }
    var scoremetervalue = scoretime*score_bpm/(60*score_rythm); // score meter number ( +- 1 ???)
    score_measure_value=scoremetervalue //assign to global variable?
    console.log("go to meter #", score_measure_value)

}