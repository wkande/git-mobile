import {Page, NavController, NavParams, Storage, LocalStorage} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {CodeBrowserPage} from '../../pages/code/codeBrowser';
import {ProfilePage} from '../profile/profile';
import {UsersPage} from '../profile/users';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/repos/repoDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class RepoDetailPage {

  // PARAMS
  repo: any;
  user:any;

  // DATA
  ownerProfile:any;
  items: Array<any>;

  // URLS
  //url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      console.log('\n\n| >>> +++++++++++++ RepoDetailPage.constructor +++++++++++++++');
      console.log(navParams)
      new Storage(LocalStorage).set('lastBranchTag', 'master');
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.repo.created_at = this.utils.formatDate(this.repo.created_at);
      this.repo.updated_at = this.utils.formatDate(this.repo.updated_at);
      this.repo.pushed_at = this.utils.timeAgo(this.repo.pushed_at);
      this.repo.public = ((this.repo.private == false) ?  null : 'md-lock');
      if(!this.repo.description) this.repo.description = 'No description available.';
      console.log(this.repo)
      this.items = [];
      //this.items.push({title: 'Branches/Tags', note: null, icon: null});
      this.items.push({title: 'Code', note: null, icon: null});
      this.items.push({title: 'Issues', note: null, icon: null, badgeIssues:true});
      this.items.push({title: 'Releases', note: null, icon: null});
      this.items.push({title: 'Stargazers', note: null, icon: null, badgeStargazers:true});
      this.items.push({title: 'Watchers', note: null, icon: null, badgeWatchers:true});
  }


  ngOnInit() {
      this.loadProfile();
  }


  loadProfile(){
      var self = this;
      console.log("| >>> RepoDetailPage.loadProfile: ", this.repo.owner.login, ' - ',this.user);
      this.httpService.getProfile(this.repo.owner.login, this.user)
      .then((data:any) => {
          if ('gmErrorCode' in data) {
              this.error = {flag:true, message:data.message};
          }
          else{
              this.ownerProfile = data;
              //this.profileLoaded = true;
              this.asyncController(true, null);
          }
      }, function(error) {
          self.asyncController(null, error);
      });
  }


  asyncController(success, error){
      if(this.error.flag) return; // Onec async call has already failed so ignore the rest
      if(error){
          this.error = {flag:true, message:error.message};
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
    console.log(item)
      if(item.title == "Code")
          this.nav.push(CodeBrowserPage, {owner: this.owner, name:this.name});
      else if(item == 'profile'){
          var profile = {username:this.repo.owner.login, type:this.repo.owner.type};
          this.nav.push(ProfilePage, {user:this.user, profile:profile}  );
      }
      else if(item.title == 'Stargazers')
          this.nav.push(UsersPage, {trigger:'stargazers', user:this.user, repo: this.repo});
      else if(item.title == 'Watchers')
          this.nav.push(UsersPage, {trigger:'watchers', user:this.user, repo:this.repo});
  }
}
