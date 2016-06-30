/**
 * Copyright 2016 Wyoming Software, Inc.
 * All Rights Reserved
 *
 * If you have gotten this far you've gone to far.
 */

import {ionicBootstrap, App, MenuController, Platform, Events, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {SearchPage} from './pages/search/search';
import {ReposPage} from './pages/repos/repos';
import {UsersPage} from './pages/profile/users';
import {IssuesPage} from './pages/issues/issues';
import {GistsPage} from './pages/gists/gists';
import {LoginPage} from './pages/auth/login';
import {RoadmapPage} from './pages/roadmap/roadmap';
import {ProfilePage} from './pages/profile/profile';
import {ProfileService} from './providers/profileService.ts';
// https://angular.io/docs/ts/latest/api/core/Type-interface.html
import {Component, Type, ViewChild, enableProdMode} from '@angular/core';




@Component({
  templateUrl: 'build/app.html',
  providers: [ProfileService]
})
class MyApp {

  @ViewChild(Nav) nav: Nav;
  connected: boolean;
  user: any;
  rootPage: any;

  constructor(
    private app: App,
    private platform: Platform,
    private profileService: ProfileService,
    private events: Events,
    private menu: MenuController
  ) {
      this.connected = false;
      this.profileService.get()
      .then(data => {
          this.user = data;
          this.initializeApp();
      });
  }

  initializeApp() {
      this.platform.ready().then(() => {
          //let nav = this.app.getComponent('nav');

          // IMPORTANT *** IMPORTANT
          // For some reason if there is no console output here the emualtor and ios
          // device hangs with a white screen
          console.log('DO NOT REMOVE THIS MESSAGE >>> STARTUP');
          if (this.user == null){
              this.nav.setRoot(LoginPage);
          }
          else{
              this.connected = true;
              this.nav.setRoot(ReposPage, {trigger:'affiliations-me-all', user:this.user});
          }

          this.events.subscribe('user:connected', (user) => {
              this.profileService.get()
              .then(data => {
                  this.user = data;
                  this.connected = true;
              });
          });

          // The platform is now ready. Note: if this callback fails to fire, follow
          // the Troubleshooting guide for a number of possible solutions:
          //
          // Okay, so the platform is ready and our plugins are available.
          // Here you can do any higher level native things you might need.
          //
          // First, let's hide the keyboard accessory bar (only works natively) since
          // that's a better default:
          //
          //Keyboard.setAccessoryBarVisible(false);
          //
          // For example, we might change the StatusBar color. This one below is
          // good for dark backgrounds and light text:
          //StatusBar.styleDefault();
          //StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
      });

  }


  logOut(){
      this.menu.close(); //.app.getComponent('leftMenu').close();
      this.connected = false;
      this.profileService.remove();
      this.user = null;
      //let nav = this.app.getComponent('nav');
      this.nav.setRoot(LoginPage);
  }

  openPage(page) {
      console.log('Page', page);
      // close the menu when clicking a link from the menu
      this.menu.close(); //.app.getComponent('leftMenu').close();
      // navigate to the new page if it is not the current page
      //let nav = this.app.getComponent('nav');
      if(page == 'profile')
          this.nav.setRoot(ProfilePage, {trigger:'me', user:this.user, username:this.user.login} );
      else if(page == 'search')
          this.nav.setRoot(SearchPage, {user:this.user});
      else if(page == 'repos')
          this.nav.setRoot(ReposPage, {user:this.user});
      else if(page == 'issues')
          this.nav.setRoot(IssuesPage, {user:this.user});
      else if(page == 'users')
          this.nav.setRoot(UsersPage, {user:this.user, username:this.user.login});
      else if(page == 'gists')
          this.nav.setRoot(GistsPage, {user:this.user});
      else if(page == 'roadmap')
          this.nav.setRoot(RoadmapPage);
      //else
          //nav.setRoot(page.component, {title:page.title, action:page.action, user:this.user});
  }
}
enableProdMode();
ionicBootstrap(MyApp);
