/**
 * Author: Warren Anderson
 * Compnay: Wyoming Software, Inc.
 */

import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Utils} from './utils.ts';
import 'rxjs/add/operator/timeout';

/**
 * Injectable to fire GitHub APIs
 * @return {Object} exported class
 */
@Injectable()
export class HttpService {

    baseURL:string = 'https://api.github.com';


    constructor(private http: Http) {
    }


    getBaseURL = function(){
        return this.baseURL;
    }


    /**
     * Loads a generic URL. Places all data on a data object returned as JSON.
     * Pagination links from GitHub are extracted from the response header and
     * placed on the data object.
     *
     * @param  {string} url   the URL to call
     * @param  {object} user  the authenticated user
     * @return {promise}      the data or error object
     */
    load = function(url:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        this.header.set('Accept', 'application/vnd.github.v3+json');
        return new Promise(function(resolve, reject) {
            self.http.get(url, {headers:self.header})
            .timeout(5000, new Error('The server did not respond in a timely manner.'))
            .subscribe(res => {
                  var data = res.json();
                  data.gm_pagination = res.headers.get('Link');
                  data.gm_contentType = res.headers.get('Content-Type');
                  resolve(data);
              }, error => {
                console.log("ERR",error)
                  reject( buildError(error) );
              }, () => {
                ;
              });
        });
    }


    /**
     * Loads a user/org profile as a convinence method. Places all data on a
     * data object returned as JSON.
     * Adds the since key generated form the created_at response key.
     *
     * @param  {string} username    the user/org name to acquire
     * @param  {object} user        the authenticated user
     * @return {promise}            the data or error object
     */
    getProfile = function(username:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        this.header.set('Accept', 'application/vnd.github.v3+json');

        return new Promise(function(resolve, reject) {
            self.http.get('https://api.github.com/users/'+username, {headers:self.header})
            .subscribe(res => {
                var data = res.json();
                var create = new Date(data.created_at);
                var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                data.since = months[create.getMonth()]+"-"+create.getDate()+"-"+create.getFullYear();
                resolve(data);
              }, error => {
                  reject( buildError(error) );
              }, () => {
                ;
              });
        });
    }

    /**
     * Loads a know mediaHTML (README) file as a convinence method. Places all
     * data on a data object returned as JSON.
     *
     * @param  {string} url         the url for the mediaHTML file
     * @param  {object} user        the authenticated user
     * @return {promise}            the data or error object
     */
    loadMediaHtml = function(url:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Accept', 'application/vnd.github.v3.html+json');
        return new Promise(function(resolve, reject) {
            self.http.get(url, {headers:self.header})
            .subscribe(res => {
                  resolve(res._body);
              }, error => {
                  reject( buildError(error) );
              }, () => {
                ;
              });
        });
    }

    /**
     * Calls the MD to HTML convertor @GitHub. Returns the HTML of the MD file
     * as a JSON object.
     *
     * @param  {string}   - md md contents
     * @return {JSON}     - The data or error object
     */
    mdToHtml = function(md:string, user:any) {
        var self = this;
        var body = {"text":md,"mode":"gfm", "content":md};
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        this.header.set('Accept', 'application/vnd.github.v3+json');
        return new Promise(function(resolve, reject) {
            self.http.post(this.baseURL+'/markdown', JSON.stringify(body), {headers:self.header})
            .subscribe(res => {
                resolve(res);
              }, error => {
                  reject( buildError(error) );
              }, () => {
                ;
              });
        });
    }

}

/**
 * Creates astandard error object that is returned to errored call of the
 * HttpService class.
 * @param  {object} error     - The error from a failed promise
 * @return {object}           - An error object
 */
function buildError(error){
    if(!error.json){ // No json() function
        var e = {status:null, message:null};
        e.status = 500;
        e.message = error;
        return e;
    }
    var err = error.json();
    // If status is 200 then there was a bad request OR maybe a network disconnect
    // The type will = 3 as well when normally it is 2
    if (error.status == 200){
        err.status = 400;
        err.message = `Network timeout or bad request. Most likely
        the internet is not accessable. Please try again later.`;
    }
    else if(error.status == 422){ // Some searches require exact qualifiers with permissions
        err.status = error.status;
        err.message = error.statusText;
        if(err.message = "Unprocessable entity"){
            err.message += ": Try fixing the qualifier string if this is a search. The requested resource"+
            "may not exist or you may not have permission to view them.";
        }
    }
    else{
        err.status = error.status;
    }
    return err;
}
