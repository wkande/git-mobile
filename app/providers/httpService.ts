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
     * Loads a generic URL. If the URL is null the promise never resolves and the caller just waits
     * as now error is generated.
     *
     * http://blog.ninja-squad.com/2015/10/13/es6-part-2/
     *
     * @param  {string} url the URL to call
     * @return {promise}
     */
    xxxxxxxxxxxxx_load_old = function(url:string, user:any) {
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        return new Promise(resolve => {
                this.http.get(url, {headers:this.header})
                .subscribe(res => {
                    var data = res.json();
                    data.gm_pagination = res.headers.get('Link');
                    data.gm_contentType = res.headers.get('Content-Type');
                    resolve(data);
                }, error => {
                    var data = error;//.json();
                    data.gmErrorCode = error.status;
                    data.message = error.status+' - '+data.message;
                    resolve(data);
                });
        });
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
                var data = res.json();
                data.gm_pagination = res.headers.get('Link');
                data.gm_contentType = res.headers.get('Content-Type');
                resolve(data);
            }, error => {
                error.message = JSON.parse(error._body).message;
                reject(error);
            });
        });
    }

    /**
     * Get the user profile at GitHub
     * @param  {string} login  login ID @GitHub
     * @return {JSON}             user information
     */
    xxxxxxxxxxx_getProfile = function(username:string, user:any) {
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        return new Promise(resolve => {
            this.http.get('https://api.github.com/users/'+username, {headers:this.header})
            .subscribe(res => {
                var data = res.json();
                var create = new Date(data.created_at);
                var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                data.since = months[create.getMonth()]+"-"+create.getDate()+"-"+create.getFullYear();
                resolve(data);
            }, error => {
                var data = error;//.json();
                data.gmErrorCode = error.status;
                data.message = error.status+' - '+data.message;
                resolve(data);
            });
        });
    }


    getProfile = function(username:string, user:any) {
        var self = this;
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS

        return new Promise(function(resolve, reject) {
            self.http.get('https://api.github.com/users/'+username, {headers:this.header})
            .subscribe(res => {
                var data = res.json();
                var create = new Date(data.created_at);
                var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                data.since = months[create.getMonth()]+"-"+create.getDate()+"-"+create.getFullYear();
                resolve(data);
            }, error => {
                error.message = JSON.parse(error._body).message;
                reject(error);
            });
        });
    }

    /**
     * Calls the MD to HTML convertor @GitHub
     * @param  {string} md md contents
     * @return {JSON}    HMTL content inside JSON object
     */
    xxxxxxxxxx_mdToHtml = function(md:string, user:any) {
        var body = {"text":md,"mode":"gfm", "content":md};
        this.header = new Headers();
        this.header.set('Authorization', user.auth);
        this.header.set('Content-Type', 'application/json'); // Used by POSTS
        return new Promise(resolve => {
            this.http.post('https://api.github.com/markdown', JSON.stringify(body), {headers:this.header})
            .subscribe(res => {
                resolve(res);
            }, error => {
                var data = error;
                data.gmErrorCode = error.status;
                data.message = error.status+' - '+data.message;
                resolve(data);
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
            self.http.post('https://api.github.com/markdown', JSON.stringify(body), {headers:this.header})
            .subscribe(res => {
                resolve(res);
            }, error => {
                error.message = JSON.parse(error._body).message;
                reject(error);
            });
        });
    }

}
