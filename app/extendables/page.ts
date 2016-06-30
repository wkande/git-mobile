import {Loading} from 'ionic-angular';

export class PageClass {

    // ASYNC LOADER
    dataLoaded: boolean = false;
    error = {flag:false, status:null, message:null};
    spinner = {flag:false, message:null};
    async = {cnt:1, completed:0}; // Number of async calls to load the view

    constructor(){
    }

    startAsyncController(cnt, message){
        this.async = {cnt:cnt, completed:0};
        this.dataLoaded = false;
        this.spinner = {flag:true, message:message};
        this.error = {flag:false, status:null, message:null};
    }

    asyncController(success, err){
        if(this.error.flag) return; // Once async call has already failed ignore the rest
        if(err){
            this.error = {flag:true, status:err.status, message:err.message};
            this.spinner.flag = false;
        }
        else{
            this.async.completed++;
            if(this.async.cnt == this.async.completed){
                this.spinner.flag = false;
                this.dataLoaded = true;
            }
        }
    }



}
