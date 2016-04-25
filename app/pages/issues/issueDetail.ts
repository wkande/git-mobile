import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {RepoDetailPage} from '../../pages/repos/repoDetail';
import {ProfilePage} from '../profile/profile';
import {IssueCommentsPage} from '../issues/issueComments';
import {UsersPage} from '../profile/users';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/issues/issueDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class IssueDetailPage {

  // PARAMS
  user: any;

  // DATA
  color = 'blue';
  repo:any;
  issue:any;
  items: Array<any> = [];

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:2, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      console.log('\n\n| >>> +++++++++++++ IssueDetailPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.loadRepo(navParams.get('repoURL'));
      this.loadIssue(navParams.get('issueURL'));
  }

  loadRepo(url){
      var self = this;
      //console.log("| >>> IssueDetailPage.loadRepo: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          //console.log('REPO', data)
          this.repo = data;
          this.repo.created_at = this.utils.formatDate(this.repo.created_at);
          this.repo.updated_at = this.utils.formatDate(this.repo.updated_at);
          this.repo.pushed_at = this.utils.timeAgo(this.repo.pushed_at);
          this.repo.public = ((this.repo.private == false) ?  null : 'md-lock');
          if(!this.repo.description) this.repo.description = 'No description available.';
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadIssue(url){
      var self = this;
      //console.log("| >>> IssueDetailPage.loadIssue: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          //console.log('ISSUE', data)
          this.issue = data;
          this.convertMarkdown(this.issue.body);
          this.issue.timeAgo = this.utils.timeAgo(this.issue.created_at);
          this.issue.created_at = this.utils.formatDate(this.issue.created_at);

          // WARNING: There is an issue with the url in that it shows everything as open
          if(this.issue.closed_by != null &&  this.issue.closed_at == null){
              this.issue.stateIcon = 'octicon-issue-reopened';
              this.issue.state = 're-opened';
          }
          else if(this.issue.state == 'open')
              this.issue.stateIcon = 'octicon-issue-opened';
          else if(this.issue.state == 'closed')
              this.issue.stateIcon = 'octicon-issue-closed';

          this.issue.labels.forEach(function(label){
              label.color = '#'+label.color;
              label.textColor = self.getLabelTextColor(label.name);
          });

          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }




  convertMarkdown(txt){
      var self = this;
      this.httpService.mdToHtml(txt, this.user)
      .then((data:any) => {
          //console.log(data)
          self.issue.body = data._body;
      }).catch(error => {
          console.log(error);
      });
  }

  getLabelTextColor(labelName){
      if(labelName == 'bug' || labelName == 'question'
          || labelName == 'help wanted' || labelName == 'enhancement')
          return '#ffffff';
      else
          return 'black';
  }

  asyncController(success, error){
      if(this.error.flag) return;
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

  itemTapped(event, item, commentUser) {
      if(item == "repo")
          this.nav.push(RepoDetailPage, {repo: this.repo, user:this.user});
      else if(item == "profile-creator")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.issue.user.login});
      else if(item == "profile-assignee")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.issue.assignee.login});
      else if(item == "profile-commentor")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:commentUser});
      else if(item == 'comments')
          this.nav.push(IssueCommentsPage, {user:this.user, issue:this.issue});

  }
}
