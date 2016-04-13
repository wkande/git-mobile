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


            var url = 'https://api.github.com/search/repositories?q='+this.textValue+'+in:name,description,readme';
            if(this.affiliations == true) url = url+'+user:'+this.user.login;
            let data = { 'ref': 'ok', url:url};
            this.viewCtrl.dismiss(data);

    }

    popupSearchText() {
      let alert = Alert.create({
        title: 'Usage',
        subTitle: `<div style="text-align:left;">
        <b>Search Text</b>: Used to search the repo name, description, and readme.
        <br/><br/>
        <b>Restrict to repositories I own:</b> Searches only in repos that you own.
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
