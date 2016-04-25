import {Page, Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {IssueDetailPage} from './issueDetail';

@Page({
  templateUrl: 'build/pages/issues/issues.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class IssuesPage {

  // PARAMS > DATA
  user:any;
  trigger:string;
  repo:any;

  // DATA
  data: any;
  pagination:any;
  lastPage = 0;
  state = 'open';
  description:string;
  foundExcess:string;
  searchValue:string;

  // URLS
  url:string;
  lastSearchUrl:string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0};

  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private utils: Utils) {
      console.log('\n\n| >>> +++++++++++++ IssuesPage.constructor +++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.trigger = (navParams.get('trigger') == null) ? 'assigned-me': navParams.get('trigger');
      this.repo = navParams.get('repo');
      this.searchValue = navParams.get('searchValue');
      this.setURL();
      this.load();
  }


  setURL(){
      //console.log('setURL', this.trigger)
      if (this.trigger == 'created-me' ){
          this.description = "Created by Me";
          this.url = '/search/issues?q=+type:issue+state:___+author:'+this.user.login;
      }
      else if (this.trigger == 'assigned-me' ){
          this.description = "Assigned to Me";
          this.url = '/search/issues?q=+type:issue+state:___+assignee:'+this.user.login;
      }
      else if (this.trigger == 'mentioned-me' ){
          this.description = "Mentions Me";
          this.url = '/search/issues?q=+type:issue+state:___+mentions:'+this.user.login;
      }
      else if (this.trigger == 'commented-me' ){
          this.description = "I Commented";
          this.url = '/search/issues?q=+type:issue+state:___+commenter:'+this.user.login;
      }
      else if (this.trigger == 'repo' ){
          this.description = this.repo.owner.login+'/'+this.repo.name;
          this.url = '/search/issues?q=+type:issue+repo:'+this.repo.owner.login+'/'+this.repo.name+'+state:___';
      }
      else if(this.trigger == 'search' ){
          // Description already set by search dialog
          this.description = 'Search: '+this.searchValue;
          // NOTICE, in "in" quaifier does not see to work right, omit it and the seach still
          // looks in all three stated fields.
          this.url = '/search/issues?q='+this.searchValue+" type:issue";
      }
  }

  load(){
      var self = this;
      this.dataLoaded = false;
      this.async = {cnt:1, completed:0};
      this.error = {flag:false, status:null, message:null};
      this.spinner = {flag:true, message:null};

      var url = this.url;
      if(this.state != 'all'){
          url = url.replace('+state:___', '+state:'+this.state);
      }
      else{
          url = url.replace('+state:___', '');
      }
      //console.log("| >>> IssuesPage.load: ", url);

      this.httpService.load('https://api.github.com'+url, this.user)
      .then((data:any) => {
          //console.log(data)
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;
          this.data = data;

          if(this.data.total_count <= (30 * this.lastPage) || this.lastPage == 0)
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

          // Parse out repo name
          this.data.items.forEach(function(item){
              var arr = item.repository_url.split('/');
              item.repository = {};
              item.repository.name = arr[arr.length-1];
              item.created_at = self.utils.formatDate(item.created_at);
              item.updated_at = self.utils.formatDate(item.updated_at);
          });
          //console.log(this.pagination)
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

  // Open, Closed, All
  tabLoad(){
      this.setURL();
      this.load();
  }

  // Load for pagination
  paginationLoad(url){
      //console.log(url)
      this.url = url.split('github.com')[1];
      this.load();
  }


  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Filter Issues',
        buttons: [
          {
            text: 'Assigned',
            handler: () => {
              this.trigger = 'assigned-me';
              this.setURL(); this.load();}
          },{
            text: 'Created',
            handler: () => {
              this.trigger = 'created-me';
              this.setURL(); this.load();}
          },{
            text: 'Mentioned',
            handler: () => {
              this.trigger = 'mentioned-me';
              this.setURL(); this.load();}
          },{
            text: 'Commented',
            handler: () => {
              this.trigger = 'commented-me';
              this.setURL(); this.load();}
          },{
            text: 'Cancel',
            style: 'cancel',
            handler: () => {;}
          }
        ]
      });
      this.nav.present(actionSheet);
  }

  itemTapped(event, item) {
    this.nav.push(IssueDetailPage, {
        user: this.user, issueURL:item.url, repoURL:item.repository_url,
        commentsURL:item.comments_url, eventsURL:item.events_url
    });
  }
}
