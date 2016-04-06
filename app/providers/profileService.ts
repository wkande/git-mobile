import {Storage, LocalStorage} from 'ionic-angular';
import {Injectable} from 'angular2/core';


@Injectable()
export class ProfileService {
    profile: any;
    local:LocalStorage;

    constructor() {
        this.local = new Storage(LocalStorage);
        this.profile = null;
    }

    remove = function(){
        this.local.remove('profile');
        this.profile = null;
    }

    set = function(username, pswd, name, avatar_url, url){
        var b = 'Basic '+ btoa(username+':'+pswd);
        var profile = {"login":username, "auth":b, "name":name, "avatar_url":avatar_url, "url":url};
        this.local.set('profile', JSON.stringify(profile));
        return profile;
    }

    get = function(){
        return new Promise(resolve => {
            if(this.profile != null){
                resolve(this.profile);
            }
            else{
            this.local.get('profile')
                .then(data => {
                    this.profile = JSON.parse(data);
                    resolve(this.profile);
                });
            }
        });
    }

}
