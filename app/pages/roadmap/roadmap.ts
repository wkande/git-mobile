import {NavParams, NavController} from 'ionic-angular';
import {Component} from '@angular/core';
import *  as appConfig from '../../../appConfig.ts';
import {UsersPage} from '../profile/users';


@Component({
    templateUrl: 'build/pages/roadmap/roadmap.html',
    providers: [],
    directives: []
})


export class RoadmapPage {

    version:string;
    user:any;

    constructor(private nav: NavController, navParams: NavParams) {
      this.version = appConfig.data['version'];
      this.user = navParams.get('user');
    }


    itemTapped(event, item) {
            this.nav.push( UsersPage, {trigger: 'wyosoft-members', user:this.user} );

    }

}
