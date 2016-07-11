import {Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {ProfileService} from '../../providers/profileService.ts';
import {Utils} from '../../providers/utils.ts';
import {RepoDetailPage} from './repoDetail';
import {SearchPage} from '../search/search';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';


@Component({
  templateUrl: 'build/pages/repos/repos.html',
  providers: [HttpService, ProfileService, Utils],
  directives: [GmError, GmSpinner]
})


export class ReposPage  extends PageClass{
  // PARAMS
  trigger: string;
  user:any;
  username:string;
  // DATA
  data = {row:null, total_count:null, items:[], gm_pagination:null, next:null}; // TMP decalrations prevent compile warnings
  profileServiceData:any;
  pagination:any;
  lastPage = 0;
  type = 'public';
  searchValue:string;

  description:string;
  foundExcess:string;
  // URLS
  url: string;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
          private profileService: ProfileService, private utils: Utils) {
      super();
      console.log('\n\n| >>> +++++++++++++ ReposPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.username = navParams.get('username');
      this.searchValue = navParams.get('searchValue');
      this.trigger = (navParams.get('trigger') == null) ? 'affiliations-me-all': navParams.get('trigger');
      this.setURL();
      this.loadScrolling(null);
  }


  setURL(){
      if(this.trigger == 'owned-me'){
          this.description = "Owned by Me";
          this.url = 'https://api.github.com/user/repos?type=owner';
      }
      else if(this.trigger == 'owned-user'){
          this.description = "Owned by: "+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/repos?type=owner';
      }
      else if(this.trigger == 'affiliations-me-all'){
          this.description = "My Affiliations";
          this.url = 'https://api.github.com/user/repos';
      }
      else if(this.trigger == 'starred-me'){
          this.description = "Starred by Me";
          this.url = 'https://api.github.com/user/starred';
      }
      else if(this.trigger == 'starred-user'){
          this.description = "Starred by: "+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/starred';
      }
      else if(this.trigger == 'watching-me'){ // Current user watching repos
          this.description = "I\'m Watching";
          this.url = 'https://api.github.com/user/subscriptions';
      }
      else if(this.trigger == 'user'){ // Current user watching repos
          this.description = "Repositories for: "+this.username;
          this.url = 'https://api.github.com/users/'+this.username+'/repos';
      }
      else if(this.trigger == 'search'){
          this.description = 'Search: '+this.searchValue;
          this.url = 'https://api.github.com/search/repositories?q='+this.searchValue.toLowerCase()+" in:name,description,readme";
      }

  }

  loadScrolling(infiniteScroll){

      // Disable infiniteScroll if no more data
      if(infiniteScroll != null && this.data.next == null){
          infiniteScroll.complete();
          return;
      }

      var self = this;
      var url = this.url;

      // New load
      if(infiniteScroll == null){
          this.data.items = [];
          this.startAsyncController(1, null, false);
          if(this.trigger == 'affiliations-me-all' && this.type != 'all' && this.url.indexOf('?') > -1)
              url = url+'&type='+this.type;
          else if(this.trigger == 'affiliations-me-all' && this.type != 'all')
              url = url+'?type='+this.type;
      }
      // Infinite scroll load
      else{
          this.startAsyncController(1, null, true);
          url = this.data.next;
      }


      this.httpService.load(url, this.user)
      .then((data:any) => {

          // Pagination, need last page number
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.data.next = this.pagination.next;
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;

          // Populate items
          var row = this.data.items.length;
          if(this.trigger == 'search'){
              for(var i=0; i< data.items.length; i++){
                  data.items[i].row = row++;
                  this.data.items.push(data.items[i]);
              }
              this.data.total_count = data.total_count;
          }
          else{
              for(var i=0; i< data.length; i++){
                  data[i].row = row++;
                  this.data.items.push(data[i]);
              }
              this.data.total_count = 0;
          }

          // Calc total found and total viewble
          if(this.data.total_count <= (30 * this.lastPage) )
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

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

  /*loadxxxxxxxxx(){
      var self = this;
      this.startAsyncController(1, null);
      var url = this.url;
      if(this.trigger == 'affiliations-me-all' && this.type != 'all' && this.url.indexOf('?') > -1)
          url = url+'&type='+this.type;
      else if(this.trigger == 'affiliations-me-all' && this.type != 'all')
          url = url+'?type='+this.type;

      this.httpService.load(url, this.user)
      .then((data:any) => {
          this.pagination = this.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber == null) ? this.lastPage : this.pagination.lastPageNumber;
          this.data.gm_pagination = data.gm_pagination;
          if(this.trigger == 'search'){
              this.data.items = data.items;
              this.data.total_count = data.total_count;
          }
          else{
              this.data.items = data;
              this.data.total_count = 0;
          }

          if(this.data.total_count <= (30 * this.lastPage) )
              this.foundExcess = null;
          else
              this.foundExcess = 'Found '+this.data.total_count.toLocaleString('en')+'; Viewable '+(30 * this.lastPage).toLocaleString('en')+'; Please narrow the search.';
          // Must follow above calcs or the math will fail
          this.data.total_count = this.data.total_count.toLocaleString('en');

          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }*/



  // Load for pagination
  /*paginationLoad(url){
      this.url = url;
      this.load();
  }*/


  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Repositories',
        buttons: [
          {
            text: 'Owned',
            handler: () => {
              this.trigger = 'owned-me';
              this.setURL();
              this.loadScrolling(null);}
          },
          {
            text: 'Affiliations',
            handler: () => {
              this.trigger = 'affiliations-me-all';
              this.setURL();
              this.loadScrolling(null);}
          },{
            text: 'Starred',
            handler: () => {
              this.trigger = 'starred-me';
              this.setURL();
              this.loadScrolling(null);}
          },{
            text: "Watching",
            handler: () => {
              this.trigger = 'watching-me';
              this.setURL();
              this.loadScrolling(null);}
          },{
            text: 'Search',
            handler: () => {
              this.nav.push(SearchPage, {triggered_for:'repos2', user:this.user});
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
      this.nav.push(RepoDetailPage, {repo:item, user:this.user});
  }

}
