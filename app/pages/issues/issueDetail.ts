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
  comments:any;
  items: Array<any> = [];
  events:Array<any>;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:4, completed:0}; // Number of async calls to load the view

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      console.log('\n\n| >>> +++++++++++++ IssueDetailPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.loadRepo(navParams.get('repoURL'));
      this.loadIssue(navParams.get('issueURL'));
      this.loadComments(navParams.get('commentsURL'));
      this.loadEvents(navParams.get('eventsURL')); // /repos/:owner/:repo/issues/:issue_number/events
  }

  loadRepo(url){
      var self = this;
      console.log("| >>> IssueDetailPage.loadRepo: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          console.log('REPO', data)
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
      console.log("| >>> IssueDetailPage.loadIssue: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          console.log('ISSUE', data)
          this.issue = data;
          //this.issue.created_at = this.utils.formatDate(this.issue.created_at);
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
          self.httpService.mdToHtml(this.issue.body.toString(), self.user)
          .then((data:any) => {
              this.issue.body = data._body.replace(/<p>/gi,"<br/><p>");

              console.log(this.issue.body);
          });
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadComments(url){
      var self = this;
      console.log("| >>> IssueDetailPage.loadComments: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          console.log('COMMENTS', data)
          this.comments = data;

          //this.issue.closed_at = this.utils.formatDate(this.issue.closed_at);
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadEvents(url){
      var self = this;
      console.log("| >>> IssueDetailPage.loadEvents: ", url);
      this.httpService.load(url, this.user)
      .then((data:any) => {
          console.log('EVENTS', data)
          this.events = data;
          /*this.events.forEach(function(item, i) {
              self.getEventDetails(item.url, i);
          });*/
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  setCommentHTML(txt, rowNumb){
      this.httpService.mdToHtml(txt, this.user)
      .then((data:any) => {
          console.log(data);
          this.comments[rowNumb].body = data._body;
      }).catch(error => {
          console.log(error);
      });
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
              var self = this;

              this.items.push({type:'creator', body:this.issue.body, created:this.issue.created_at,
                creator:this.issue.user.login, avatar:this.issue.user.avatar_url});

              this.comments.forEach(function(comment, i){
                  self.items.push({type:'comment', body:comment.body, created:comment.created_at,
                        creator:comment.user.login, avatar:comment.user.avatar_url});
                  //comment.created_at = self.utils.formatDate(comment.created_at);
                  //self.setCommentHTML(comment.body, i)
              });
              this.events.forEach(function(event, i){
                  var icon = 'octicon-unverified';
                  var e = { type:'event',
                            event:event.event,
                            created:event.created_at,
                            creator:event.actor.login,
                            avatar:event.actor.avatar_url};
                  if(event.event == 'unassigned' || event.event == 'assigned')
                      e.icon = 'octicon-person';
                  else if(event.event == 'milestoned')
                      e.icon = 'octicon-milestone';
                  else if(event.event == 'renamed')
                      e.icon = 'octicon-pencil';
                  else if(event.event == 'labeled' || event.event == 'unlabeled'){
                      e.icon = 'octicon-tag';
                      e.label = event.label;
                      e.label.color = '#'+event.label.color;
                      if(event.label.name == 'bug' || event.label.name == 'question'
                          || event.label.name == 'help wanted' || event.label.name == 'enhancement')
                          e.label.textColor = '#ffffff';
                      else
                          e.label.textColor = 'black';

                  }


                  self.items.push(e);

              });

              // Update the MARKDOWN, TIMEAGO
              this.items.forEach(function(item, i){
                  item.timeAgo = self.utils.timeAgo(item.created);
                  console.log(typeof item.timeAgo);
                  //comment.created_at = self.utils.formatDate(comment.created_at);
                  //self.setCommentHTML(item.body, i)
              });

              this.items.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(a.created) - new Date(b.created);
              });

              this.spinner.flag = false;
              this.dataLoaded = true;
              console.log('ITEMS', this.items)
          }
      }
  }

  itemTapped(event, item, commentUser) {
    console.log(item, commentUser)
      if(item == "repo")
          this.nav.push(RepoDetailPage, {repo: this.repo, user:this.user});
      else if(item == "profile")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.issue.user.login});
      else if(item == "profile-assignee")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.issue.assignee.login});
      else if(item == "profile-commentor")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:commentUser});
      else if(item.clicked == 'comment')
          this.nav.push(IssueCommentsPage, {user:this.user, issueTitle:this.issue.title, comment:item.comment, repo: this.repo});

  }
}
