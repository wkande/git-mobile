import {Page, Modal, ViewController, NavController, NavParams, Storage, LocalStorage, Alert} from 'ionic-angular';
import { Component } from 'angular2/core';
import {GmError} from '../../components/gm-error';

@Page({
    templateUrl: 'build/pages/issues/searchModal.html',
    providers: [],
    directives: [GmError]
})
export default class SearchModal {
    user:any;
    textValue: AbstractControl;
    localStorage: any;
    error = {flag:false, message:null};

    assigned:false;
    created:false;
    mentioned:false;
    commented:false;

    constructor(private nav: NavController, private viewCtrl: ViewController, navParams: NavParams) {
        console.log('\n\n| >>> +++++++++++++ SearchModal.constructor +++++++++++++++');
        console.log(navParams)
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

            this.localStorage.set('search-issues', JSON.stringify( {text:this.textValue,
                                                                    assigned:this.assigned,
                                                                    created:this.created,
                                                                    mentioned:this.mentioned,
                                                                    commented:this.commented}) );


            var url = '/search/issues?q='+this.textValue+'+type:issue+state:___';
            if(this.assigned == true) url = url+'+assignee:'+this.user.login;
            if(this.created == true) url = url+'+author:'+this.user.login;
            if(this.mentioned == true) url = url+'+mentions:'+this.user.login;
            if(this.commented == true) url = url+'+commenter:'+this.user.login;
            let data = { 'ref': 'ok', url:url};
            this.viewCtrl.dismiss(data);

    }

    popupSearchText() {
      let alert = Alert.create({
        title: 'Usage',
        subTitle: `<div style="text-align:left;">
        <b>Search Text</b>: Used to search the issue title, issue body,
        and comments body.
        <br/><br/>
        <b>Assigned to me:</b> Issues you are responsible for.
        <br/><br/>
        <b>Created by me:</b> Issues you created.
        <br/><br/>
        <b>Mentions me:</b> Issues where you are @mentioned.
        <br/><br/>
        <b>I commented:</b> Issues you commented on.
        </div>`

        buttons: ['Ok']
      });
      this.nav.present(alert);
    }

    dismiss() {
        let data = { 'ref': 'canceled' };
        this.viewCtrl.dismiss(data);
    }
}
