import {Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';
import {IssueDetailPage} from './issueDetail';
import {SearchPage} from '../search/search';

@Component({
  templateUrl: 'build/pages/issues/issues.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class IssuesPage extends PageClass{

  // PARAMS > DATA
  user:any;
  trigger:string;
  repo:any;

  // DATA
  data = {row:null, total_count:null, items:[], gm_pagination:null, next:null}; // TMP declarations prevent compile warnings
  pagination:any;
  lastPage = 0;
  state = 'open';
  description:string;
  foundExcess:string;
  searchValue:string;

  // URLS
  url:string;
  lastSearchUrl:string;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private utils: Utils) {
      super();
      console.log('\n\n| >>> +++++++++++++ IssuesPage.constructor +++++++++++++++');
      console.log(navParams);
      this.user = navParams.get('user');
      this.trigger = (navParams.get('trigger') == null) ? 'assigned-me': navParams.get('trigger');
      this.repo = navParams.get('repo');
      this.searchValue = navParams.get('searchValue');
      this.setURL();
      this.loadScrolling(null);
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
      this.url = 'https://api.github.com'+this.url;
  }


  loadScrolling(infiniteScroll){
      // Disable infiniteScroll if no more data
      if(infiniteScroll != null && this.data.next == null){
        console.log('setting scroll to complete')
          infiniteScroll.complete();
          return;
      }

      var self = this;
      var url = this.url;

      // New load
      if(infiniteScroll == null){
          this.data.items = [];
          if(this.state != 'all'){
              url = url.replace('+state:___', '+state:'+this.state);
          }
          else{
              url = url.replace('+state:___', '');
          }
          this.startAsyncController(1, null, false);
      }
      // InfiniteScroll load
      else{
          this.startAsyncController(1, null, true);
          url = this.data.next;
      }

      this.httpService.load(url, this.user)
      .then((data:any) => {
          //console.log(data)

          // Pagination, need last page number
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.data.next = this.pagination.next;
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;

          //// Populate items
          var row = this.data.items.length;
          for(var i=0; i< data.items.length; i++){
              data.items[i].row = row++;
              this.data.items.push(data.items[i]);
          }
          this.data.total_count = data.total_count;

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

          if(infiniteScroll != null){
              infiniteScroll.complete();
          }

          this.asyncController(true, null);
      }).catch(error => {
          if(infiniteScroll != null){
              infiniteScroll.complete();
          }
          this.asyncController(null, error);
      });
  }


  loadxxxxxxxxxx(){
      var self = this;
      this.startAsyncController(1, null);

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



  // Open, Closed, All
  tabLoad(){
      this.setURL();
      this.loadScrolling(null);
  }

  // Load for pagination
  /*paginationLoad(url){
      this.url = url.split('github.com')[1];
      this.load();
  }*/


  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Issues',
        buttons: [
          {
            text: 'Assigned',
            handler: () => {
              this.trigger = 'assigned-me';
              this.setURL(); this.loadScrolling(null);}
          },{
            text: 'Created',
            handler: () => {
              this.trigger = 'created-me';
              this.setURL(); this.loadScrolling(null);}
          },{
            text: 'Mentioned',
            handler: () => {
              this.trigger = 'mentioned-me';
              this.setURL(); this.loadScrolling(null);}
          },{
            text: 'Commented',
            handler: () => {
              this.trigger = 'commented-me';
              this.setURL(); this.loadScrolling(null);}
          },{
            text: 'Search',
            handler: () => {
              this.nav.push(SearchPage, {triggered_for:'issues2', user:this.user});
            }
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
