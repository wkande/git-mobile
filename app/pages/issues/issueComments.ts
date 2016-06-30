import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ProfilePage} from '../profile/profile';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';

@Component({
  templateUrl: 'build/pages/issues/issueComments.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class IssueCommentsPage extends PageClass{

  description:string;
  user:any;
  items = [];
  comments:any;
  events:any;
  issue:any;
  

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService, private utils: Utils) {
      super();
      console.log('IssueCommentsPage.constructor ++++++++++++++++++++++++++++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.issue = navParams.get('issue');
      this.description = this.issue.title;
      this.startAsyncController(2, null);
      this.loadComments();
      this.loadEvents();
  }

  loadComments(){
      console.log("| >>> IssueCommentsPage.loadComments: ", this.issue.comments_url);
      this.httpService.load(this.issue.comments_url, this.user)
      .then((data:any) => {
          console.log('COMMENTS', data)
          this.comments = data;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  loadEvents(){
      console.log("| >>> IssueCommentsPage.loadEvents: ", this.issue.events_url);
      this.httpService.load(this.issue.events_url, this.user)
      .then((data:any) => {
          console.log('EVENTS', data)
          this.events = data;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  convertMarkdown(txt, row){
      var self = this;
      this.httpService.mdToHtml(txt, this.user)
      .then((data:any) => {
          self.items[row].body = data._body.replace(/<p>/gi,"<br/><p class='_black'>");
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
            var self = this;

            // COMMENTS
            this.comments.forEach(function(comment, i){
                self.items.push({type:'comment',
                      body:comment.body,
                      created_at:comment.created_at,
                      created:self.utils.formatDate(comment.created_at),
                      timeAgo: self.utils.timeAgo(comment.created_at),
                      creator:comment.user.login,
                      avatar:comment.user.avatar_url});
            });

            // EVENTS
            this.events.forEach(function(event, i){
                var icon = 'octicon-unverified';
                var e = { type:'event',
                          icon: null,
                          label: {color:null, name:null, textColor:null},
                          event:event.event,
                          created:self.utils.formatDate(event.created_at),
                          timeAgo: self.utils.timeAgo(event.created_at),
                          creator:event.actor.login,
                          avatar:event.actor.avatar_url};
                if(event.event == 'unassigned'){
                    e.icon = 'octicon-person';
                }
                else if(event.event == 'assigned'){
                  console.log('+++++++++++++++++++++++++++++++++++++++++++++')
                    e.icon = 'octicon-person';
                    e.event = 'assigned to '+event.assignee.login;
                }
                else if(event.event == 'closed')
                    e.icon = 'octicon-issue-closed';
                else if(event.event == 'opened')
                    e.icon = 'octicon-issue-opened';
                else if(event.event == 'reopened')
                    e.icon = 'octicon-issue-reopened';
                else if(event.event == 'milestoned')
                    e.icon = 'octicon-milestone';
                else if(event.event == 'renamed')
                    e.icon = 'octicon-pencil';
                else if(event.event == 'locked'){
                    e.icon = 'octicon-lock';
                }
                else if(event.event == 'unlocked'){
                    e.icon = 'octicon-key';
                }
                else if(event.event == 'labeled' || event.event == 'unlabeled'){
                    e.icon = 'octicon-tag';
                    e.label = event.label;
                    e.label.color = '#'+event.label.color;
                    e.label.textColor = self.getLabelTextColor(event.label.name);
                }
                self.items.push(e);
            });


            // SORT
            this.items.sort(function(a,b){
              // Turn strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              a = new Date(a.created), b = new Date(b.created);
              return ( a - b );
            });

            // Update the MARKDOWN
            this.items.forEach(function(item, i){
                if(item.type == 'comment'){
                    self.convertMarkdown(item.body, i);
                }
            });

            this.spinner.flag = false;
            this.dataLoaded = true;
            console.log('ITEMS', this.items)
        }
    }
  }

  itemTapped(event, item, creatorUsername) {
      if(item == "profile")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:null});
      else if(item == "profile-commentor")
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:creatorUsername});
  }

}
