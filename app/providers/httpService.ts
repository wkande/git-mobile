import {Injectable} from 'angular2/core';
import {Http, Headers} from 'angular2/http';
import {Utils} from './utils.ts';

/**
 * Injectable to fire GitHub APIs
 * @return {Object}
 */
@Injectable()
export class HttpService {

    constructor(private http: Http) {
    }


    /**
     * Loads a generic URL.
     *
     * http://blog.ninja-squad.com/2015/10/13/es6-part-2/
     *
     * @param  {string} url   the URL to call
     * @param  {object} user  the authenticated user
     * @return {promise}
     */
    load = function(url:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        return new Promise(function(resolve, reject) {
            self.http.get(url, {headers:self.header})
            .subscribe(res => {
              console.log(res)
                  var data = res.json();
                  data.gm_pagination = res.headers.get('Link');
                  data.gm_contentType = res.headers.get('Content-Type');
                  resolve(data);
              }, error => {
                  reject( buildError(error) );
              }, () => {
                ;
              });
        });
    }



    getProfile = function(username:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS

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


    loadMediaHtml = function(url:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Accept', 'application/vnd.github.v3.html+json');
    console.log(this.header)
        return new Promise(function(resolve, reject) {
            self.http.get(url, {headers:self.header})
            .subscribe(res => {
              console.log(res)
                  resolve(res._body);
              }, error => {
                console.log(error)
                  reject( buildError(error) );
              }, () => {
                ;
              });
        });
    }

    /**
     * Calls the MD to HTML convertor @GitHub
     * @param  {string} md md contents
     * @return {JSON}    HMTL content inside JSON object
     */
    mdToHtml = function(md:string, user:any) {
        var self = this;
        var body = {"text":md,"mode":"gfm", "content":md};
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS


        return new Promise(function(resolve, reject) {
            self.http.post('https://api.github.com/markdown', JSON.stringify(body), {headers:self.header})
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
    else{
        err.status = error.status;
    }
    return err;
}
