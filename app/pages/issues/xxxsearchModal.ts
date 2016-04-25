import {Page, Modal, ViewController, NavController, NavParams, Storage, LocalStorage} from 'ionic-angular';
import { Component } from 'angular2/core';
import {GmError} from '../../components/gm-error';

@Page({
    templateUrl: 'build/pages/issues/searchModal.html',
    providers: [],
    directives: [GmError]
})
export default class SearchModal {
    user:any;
    textValue:string;
    localStorage: any;
    error = {flag:false, message:null};

    assigned = false;
    created = false;
    mentioned = false;
    commented = false;

    constructor(private nav: NavController, private viewCtrl: ViewController, navParams: NavParams) {
        console.log('\n\n| >>> +++++++++++++ SearchModal.constructor +++++++++++++++');
        console.log(navParams);
        this.user = navParams.get('user');
        this.localStorage = new Storage(LocalStorage);
        this.localStorage.get('search-issues')
        .then((data:any) => {
            if(data == null){
                data = {text:null,
                        assigned:this.assigned,
                        created:this.created,
                        mentioned:this.mentioned,
                        commented:this.commented};
                this.localStorage.set('search-issues', JSON.stringify(data) );
            }
            else{
                data = JSON.parse(data);
            }
            this.textValue = data.text;
            this.assigned = data.assigned;
            this.created = data.created;
            this.mentioned = data.mentioned;
            this.commented = data.commented;
        });
    }

    onSubmit(){
            this.localStorage.set('search-issues', JSON.stringify(
              { text:this.textValue,
                assigned:this.assigned,
                created:this.created,
                mentioned:this.mentioned,
                commented:this.commented
              }));

            var url = '/search/issues?q='+this.textValue+'+type:issue+state:___';
            if(this.assigned == true) url = url+'+assignee:'+this.user.login;
            if(this.created == true) url = url+'+author:'+this.user.login;
            if(this.mentioned == true) url = url+'+mentions:'+this.user.login;
            if(this.commented == true) url = url+'+commenter:'+this.user.login;
            let data = { 'ref': 'ok', url:url};
            this.viewCtrl.dismiss(data);

    }


    dismiss() {
        let data = { 'ref': 'canceled' };
        this.viewCtrl.dismiss(data);
    }
}
