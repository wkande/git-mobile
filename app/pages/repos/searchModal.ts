import {Page, Modal, ViewController, NavController, NavParams, Storage, LocalStorage, Alert} from 'ionic-angular';
import { Component } from 'angular2/core';
import {GmError} from '../../components/gm-error';

@Page({
    templateUrl: 'build/pages/repos/searchModal.html',
    providers: [],
    directives: [GmError]
})
export default class SearchModal {
    user:any;
    textValue:string;
    localStorage: any;
    error = {flag:false, message:null};

    affiliations = false;

    constructor(private nav: NavController, private viewCtrl: ViewController, navParams: NavParams) {
        console.log('\n\n| >>> +++++++++++++ SearchModal.constructor +++++++++++++++');
        console.log(navParams)
        this.user = navParams.get('user');
        this.localStorage = new Storage(LocalStorage);
        this.localStorage.get('search-repos')
        .then((data:any) => {
            if(data == null){
                data = {text:null,
                        affiliations:this.affiliations};
                this.localStorage.set('search-issues', JSON.stringify(data) );
            }
            else{
                data = JSON.parse(data);
            }
            this.textValue = data.text;
            this.affiliations = data.affiliations;
        });
    }

    onSubmit(){

            this.localStorage.set('search-repos', JSON.stringify( {text:this.textValue,
                                                                    affiliations:this.affiliations}) );


            var url = 'https://api.github.com/search/repositories?q='+this.textValue;
            if(this.affiliations == true) url = url+'+user:'+this.user.login;
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
        </div>`,

        buttons: ['Ok']
      });
      this.nav.present(alert);
    }

    dismiss() {
        let data = { 'ref': 'canceled' };
        this.viewCtrl.dismiss(data);
    }
}
