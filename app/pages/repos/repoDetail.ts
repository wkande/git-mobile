/**
 * Author: Warren Anderson
 * Compnay: Wyoming Software, Inc.
 */

import {NavController, NavParams, Storage, LocalStorage} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {CodeBrowserPage} from '../../pages/code/codeBrowser';
import {ProfilePage} from '../profile/profile';
import {IssuesPage} from '../issues/issues';
import {ReleasesPage} from '../releases/releases';
import {ForksPage} from '../forks/forks';
import {FileViewerPage} from '../../pages/files/fileViewer';
import {UsersPage} from '../profile/users';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';


/**
 * Display details of a single repo. This page accepts a full repo object and
 * the authenticated user object. Repo details are pull from the repo object.
 *
 * On page load the branch is set and saved localally as master as a default.
 * The branch can  be changed by the codeBrowser when it is pushed onto the nav
 * stack. Changes to the current branch are saved while the codeBrowser page
 * is on top of the nav stack should the user interact with branches.
 */
@Component({
  templateUrl: 'build/pages/repos/repoDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})


export class RepoDetailPage extends PageClass{
  // PARAMS
  repo: any;
  user:any;

  // DATA
  ownerProfile:any;
  items: Array<any>;
  readme:string;
  baseURL:string = this.httpService.getBaseURL();


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      super();
      new Storage(LocalStorage).set('lastBranchTag', 'master');
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');

      this.repo.created_at = this.utils.formatDate(this.repo.created_at);
      this.repo.updated_at = this.utils.formatDate(this.repo.updated_at);
      this.repo.pushed_at = this.utils.timeAgo(this.repo.pushed_at);
      this.repo.public = ((this.repo.private == false) ?  null : 'md-lock');
      if(!this.repo.description) this.repo.description = 'No description available.';

      this.items = [];
      this.items.push({title: 'Code', note: null, icon: null});
      this.items.push({title: 'Issues', note: null, icon: null, badgeIssues:true});
      this.items.push({title: 'Releases', note: null, icon: null});
      this.items.push({title: 'Forks', note: null, icon: null, badgeForks:true});
      this.items.push({title: 'Stargazers', note: null, icon: null, badgeStargazers:true});
      this.items.push({title: 'Watchers', note: null, icon: null, badgeWatchers:true});
  }


  ngOnInit() {
      this.startAsyncController(2, null);
      this.loadProfile();
      this.loadReadme();
  }


  loadProfile(){
      this.httpService.getProfile(this.repo.owner.login, this.user)
      .then((data:any) => {
          this.ownerProfile = data;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadReadme(){
      this.httpService.loadMediaHtml(this.baseURL+'/repos/'+this.repo.owner.login+'/'+this.repo.name+'/readme', this.user)
      .then((data:any) => {
          this.readme = data;
          this.asyncController(true, null);
      }).catch(error => {
          this.readme = "No default README file found."
          this.asyncController(true, null);
      });
  }


  itemTapped(event, item) {
      if(item.title == "Code"){
          this.nav.push(CodeBrowserPage, {user: this.user, repo:this.repo});
      }
      else if(item == 'profile'){
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.repo.owner.login}  );
      }
      else if(item.title == "Issues"){
          this.nav.push(IssuesPage, {trigger:'repo', user:this.user, repo:this.repo}  );
      }
      else if(item.title == "Releases"){
          this.nav.push(ReleasesPage, {trigger:'repo', user:this.user, repo:this.repo}  );
      }
      else if(item.title == "Forks"){
          this.nav.push(ForksPage, {user:this.user, repo:this.repo}  );
      }
      else if(item.title == 'Stargazers'){
          this.nav.push(UsersPage, {trigger:'stargazers', user:this.user, repo: this.repo});
      }
      else if(item.title == 'Watchers'){
          this.nav.push(UsersPage, {trigger:'watchers', user:this.user, repo:this.repo});
      }
      else if(item == 'readme'){
            this.nav.push(FileViewerPage, {trigger:'readme', user:this.user, repo: this.repo});
      }
  }

}
