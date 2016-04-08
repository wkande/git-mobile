import {Page, Modal, ViewController, NavController, NavParams, Storage, LocalStorage, Alert} from 'ionic-angular';
import { Component } from 'angular2/core';
import {GmError} from '../../components/gm-error';

@Page({
    templateUrl: 'build/pages/profile/searchModal.html',
    providers: [],
    directives: [GmError]
})
export default class SearchModal {
    textValue:string;
    user:any;
    localStorage: any;
    error = {flag:false, message:null};

    constructor(private nav: NavController, private viewCtrl: ViewController, navParams: NavParams) {
        console.log('\n\n| >>> +++++++++++++ SearchModal.constructor +++++++++++++++');

        this.user = navParams.get('user');
        this.localStorage = new Storage(LocalStorage);
        this.localStorage.get('search-users')
        .then((data:any) => {
            if(data == null){
                data = {text:null};
                this.localStorage.set('search-users', JSON.stringify(data) );
            }
            else{
                data = JSON.parse(data);
            }
            this.textValue = data.text;
        });
    }

    onSubmit(){
            this.localStorage.set('search-users', JSON.stringify( {text:this.textValue}) );
            var url = '/search/users?q='+this.textValue;
            let data = { 'ref': 'ok', url:url};
            this.viewCtrl.dismiss(data);

    }

    popupSearchText() {
      let alert = Alert.create({
        title: 'Usage',
        subTitle: `<div style="text-align:left;">
        <b>Search Text</b>: Used to search the user or
        organization account data.`,
        buttons: ['Ok']
      });
      this.nav.present(alert);
    }

    dismiss() {
        let data = { 'ref': 'canceled' };
        this.viewCtrl.dismiss(data);
    }
}
