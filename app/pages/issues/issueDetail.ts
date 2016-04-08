import {Page, NavController, NavParams} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {RepoDetailPage} from '../../pages/repos/repoDetail';
import {ProfilePage} from '../profile/profile';
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
  repo:any;
  issue:any;
  comments:any;
  items: Array<any>;

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

      this.dataLoaded = false;
      this.async = {cnt:1, completed:0};
      this.error = {flag:false, message:null};
      this.spinner = {flag:true, message:null};
      this.loadRepo(navParams.get('repoURL'));
      this.loadIssue(navParams.get('issueURL'));
      this.loadComments(navParams.get('commentsURL'));
  }

  loadRepo(url){
      var self = this;
      console.log("| >>> IssueDetailPage.loadRepo: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          if ('gmErrorCode' in data) {
              this.error = {flag:true, message:data.message};
          }
          else{
            console.log('REPO', data)
              this.repo = data;
              this.repo.created_at = this.utils.formatDate(this.repo.created_at);
              this.repo.updated_at = this.utils.formatDate(this.repo.updated_at);
              this.repo.pushed_at = this.utils.timeAgo(this.repo.pushed_at);
              this.repo.public = ((this.repo.private == false) ?  null : 'md-lock');
              if(!this.repo.description) this.repo.description = 'No description available.';
              this.asyncController(true, null);
          }
      }, function(error) {
          self.asyncController(null, error);
      });
  }

  loadIssue(url){
      var self = this;
      console.log("| >>> IssueDetailPage.loadIssue: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          if ('gmErrorCode' in data) {
              this.error = {flag:true, message:data.message};
          }
          else{
            console.log('loadIssue ------------------------', data)
              this.issue = data;
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
              //this.issue.closed_at = this.utils.formatDate(this.issue.closed_at);
          }
      }, function(error) {
          self.asyncController(null, error);
      });
  }

  loadComments(url){
      var self = this;
      console.log("| >>> IssueDetailPage.loadComments: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          if ('gmErrorCode' in data) {
              this.error = {flag:true, message:data.message};
          }
          else{
            console.log('loadComments', data)
              this.comments = data;
              this.comments.forEach(function(comment){
                  comment.created_at = self.utils.formatDate(comment.created_at);
              });
              //this.issue.closed_at = this.utils.formatDate(this.issue.closed_at);
          }
      }, function(error) {
          self.asyncController(null, error);
      });
  }


  asyncController(success, error){
      if(this.error.flag) return; // Onec async call has already failed so ignore the rest
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
      if(item == "repo")
          this.nav.push(RepoDetailPage, {repo: this.repo, user:this.user});
      else if(item == "profile")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.issue.user.login});

  }
}
