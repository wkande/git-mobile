import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ReposPage} from '../repos/repos';
import {UsersPage} from '../profile/users';
import {GistsPage} from '../gists/gists';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';


@Page({
    templateUrl: 'build/pages/profile/profile.html',
    providers: [HttpService, Utils],
    directives: [GmError, GmSpinner]
})
export class ProfilePage {

  // PARAMS > DATA
  user:any;
  trigger:string;

  // DATA
  profile:any;
  org_cnt: number;
  starred_cnt: number;
  member_cnt: number;

  // URLS
  url:string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:3, completed:0}; // Number of async calls to load the view


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
              private utils: Utils) {

        this.user = navParams.get('user');
        var username = navParams.get('username');
        this.trigger = navParams.get('trigger');

        console.log('\n\n| >>> +++++++++++++ ProfilePage.constructor +++++++++++++++');
        console.log(navParams);

        if(this.trigger == 'me'){
            this.async.cnt = 1;
            this.url = 'https://api.github.com/user';
        }
        else if (this.trigger == 'user' || this.trigger == 'org'){
            this.async.cnt = 1;
            this.url = 'https://api.github.com/users/'+username;
        }
        this.loadProfile();
  }

  loadProfile(){
      console.log('| >>> ProfilePage.loadProfile', this.url)
      this.httpService.load(this.url, this.user)
      .then((data: any) => {
        console.log(data)
          this.profile = data;
          this.profile.timeAgo = this.utils.timeAgo(this.profile.created_at);
          this.profile.since = this.utils.formatDate(this.profile.created_at);
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }


  asyncController(success, error){
      if(this.error.flag) return; // Once async call has already failed so ignore the rest
      if(error){
          this.error = {flag:true, status:error.status, message:error.message};
          this.spinner.flag = false;
      }
      else{
          this.async.completed++;
          if(this.async.cnt == this.async.completed){
              this.spinner.flag = false;
              this.dataLoaded = true;
          }
      }
  }

  itemTapped(event, item) {
      console.log('profilePage.itemTapped +++++++++++', item);
      console.log(this.user.login, this.profile.login)

      if(item.clicked == 'repos'){
          var trigger = (this.user.login == this.profile.login) ? 'owned-me' : 'owned-user';
          this.nav.push(ReposPage, {trigger:trigger, user:this.user, username: this.profile.login});
      }
      else if(item.clicked == 'starred'){
          var trigger = (this.user.login == this.profile.login) ? 'starred-me' : 'starred-user';
          this.nav.push(ReposPage, {trigger:trigger, user:this.user, username: this.profile.login});
      }
      else if(item.clicked == 'gists'){
          var trigger = (this.user.login == this.profile.login) ? 'mine' : 'user';
          this.nav.push(GistsPage, {trigger:trigger, user:this.user, username:this.profile.login});
      }
      else if(item.clicked == 'followers'){
          var trigger = (this.user.login == this.profile.login) ? 'followers-me' : 'followers';
          this.nav.push(UsersPage, {trigger: trigger, user:this.user, username:this.profile.login});
      }
      else if(item.clicked == 'following'){
          var trigger = (this.user.login == this.profile.login) ? 'following-me' : 'following';
          this.nav.push(UsersPage, {trigger: trigger, user:this.user, username:this.profile.login});
      }
      else if(item.clicked == 'orgs'){
          var trigger = (this.user.login == this.profile.login) ? 'orgs-me' : 'orgs';
          this.nav.push(UsersPage, {trigger: trigger, user:this.user, username:this.profile.login});
      }
      else if(item.clicked == 'members')
          this.nav.push( UsersPage, {trigger: 'members', user:this.user, username:this.profile.login} );

  }
}
