import {App, Page, IonicApp, Platform, Events} from 'ionic-angular';
import {SearchPage} from './pages/search/search';
import {ReposPage} from './pages/repos/repos';
import {UsersPage} from './pages/profile/users';
import {IssuesPage} from './pages/issues/issues';
import {GistsPage} from './pages/gists/gists';
import {LoginPage} from './pages/auth/login';
import {ProfilePage} from './pages/profile/profile';
import {ProfileService} from './providers/profileService.ts';
// https://angular.io/docs/ts/latest/api/core/Type-interface.html
import {Type} from 'angular2/core';


@App({
  templateUrl: 'build/app.html',
  providers: [ProfileService],
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
class MyApp {
  // make HelloIonicPage the root (or first) page
  rootPage: Type = null; //HelloIonicPage
  gists: Array<{title: string, component: Type}>;
  users: Array<{title: string, action:string, component: Type}>;
  issues:Array<{title: string, action:string, component: Type}>;
  repos: Array<{title: string, action:string, component: Type}>;
  events: Events;
  connected: boolean;
  user: any;

  constructor(
    private app: IonicApp,
    private platform: Platform,
    private profileService: ProfileService,
    events: Events
  ) {
      this.events = events;
      this.connected = false;
      this.profileService.get()
      .then(data => {
          this.user = data;
          this.initializeApp();
      });
      this.repos = [
          { title: 'Mine',      action:'mine',           component: ReposPage },
          { title: 'Starred',   action:'starred',           component: ReposPage },
          { title: 'Watching',  action:'watching',           component: ReposPage },
          { title: 'Search',    action:'repos', component: SearchPage  }
      ];
      this.issues = [
          { title: 'Assigned',  action:'assigned',      component: IssuesPage },
          { title: 'Mine',      action:'mine',      component: IssuesPage },
          { title: 'Search',    action:'Issues',  component: SearchPage  }
      ];
      this.users = [
          { title: 'Following', action:'following',       component: UsersPage },
          { title: 'Followers', action:'followers',         component: UsersPage },
          { title: 'Search',    action:'users-orgs',  component: SearchPage }
      ];
      this.gists = [
          { title: 'Mine', component: GistsPage },
          { title: 'Starred', component: GistsPage },
          { title: 'Recent', component: GistsPage }
      ];
  }

  initializeApp() {
      this.platform.ready().then(() => {
          let nav = this.app.getComponent('nav');

          // ????????????????????
          // For some reason if there is no console output here the emualtor and ios
          // device hangs with a white screen
          console.log('READY > profile loaded:', JSON.stringify(this.user))
          if (this.user == null){
              nav.setRoot(LoginPage);
          }
          else{
              this.connected = true;
              nav.setRoot(ReposPage, {trigger:'affiliations-me-all', user:this.user});
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
        //StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
        //console.log('StatusBar', navigator.StatusBar);
      });

  }


  logOut(){
      this.app.getComponent('leftMenu').close();
      this.connected = false;
      this.profileService.remove();
      this.user = null;
      let nav = this.app.getComponent('nav');
      nav.setRoot(LoginPage);
  }

  openPage(page) {
      //console.log('Page', page);
      // close the menu when clicking a link from the menu
      this.app.getComponent('leftMenu').close();
      // navigate to the new page if it is not the current page
      let nav = this.app.getComponent('nav');
      if(page == 'profile')
          nav.setRoot(ProfilePage, {trigger:'me', user:this.user, username:this.user.login} );
      else if(page == 'repos')
          nav.setRoot(ReposPage, {user:this.user});
      else if(page == 'issues')
          nav.setRoot(IssuesPage, {user:this.user});
      else if(page == 'users')
          nav.setRoot(UsersPage, {user:this.user, username:this.user.login});
      else if(page == 'gists')
          nav.setRoot(GistsPage, {user:this.user});
      else if(page == 'search')
          nav.setRoot(SearchPage, {user:this.user});
      //else
          //nav.setRoot(page.component, {title:page.title, action:page.action, user:this.user});
  }
}
