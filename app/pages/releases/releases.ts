import {Page, Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {OnInit} from 'angular2/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ReleaseDetailPage} from './releaseDetail';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';

@Page({
  templateUrl: 'build/pages/releases/releases.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class ReleasesPage {
  // PARAMS
  trigger: string;
  user:any;
  username:string;
  repo:any;

  // DATA
  data: any;
  pagination:any;
  lastPage = 0;
  description:string;

  // URLS
  url: string;

  // LOADER
  dataLoaded: boolean = false;
  error = {flag:false, status:null, message:null};
  spinner = {flag:true, message:null};
  async = {cnt:1, completed:0}; // Number of async calls to load the view


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
         private utils: Utils) {

      console.log('\n\n| >>> +++++++++++++ ReleaasesPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.trigger = (navParams.get('trigger') == null) ? 'repo': navParams.get('trigger');
      this.setURL();
      this.load();

  }

  setURL(){
      console.log('setURL', this.trigger)
      if (this.trigger == 'repo' ){
          this.description = this.repo.name;
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/releases';
      }
  }

  load(){
      var self = this;
      this.data = {}; // Jumps the view to the top
      console.log("| >>> ReleasesPage.load: ", this.url);
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          console.log('RELEASES DATA', data);
          this.pagination = self.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber != null) ? this.pagination.lastPageNumber: this.lastPage;
          this.data.gm_pagination = data.gm_pagination;

          this.data.items = data;
          this.data.items.forEach(function(item){
            item.published = (item.published_at == null) ? null : self.utils.formatDate(item.published_at);
          })
          console.log(this.data);
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  // Load for pagination
  paginationLoad(url){
      console.log(url)
      this.url = url;//.split('github.com')[1];
      this.load();
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

/*
  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Filter Gists',
        buttons: [
          {
            text: 'Mine',
            handler: () => {
              this.trigger = 'mine';
              this.setURL();
              this.load();}
          },{
            text: 'Starred',
            handler: () => {
              this.trigger = 'starred-me';
              this.setURL();
              this.load();}
          },{
            text: 'Recent',
            handler: () => {
              this.trigger = 'recent';
              this.setURL();
              this.load();}
          },{
            text: 'Cancel',
            style: 'cancel',
            handler: () => {;}
          }
        ]
      });
      this.nav.present(actionSheet);
  }

*/
  itemTapped(event, item) {
    this.nav.push(ReleaseDetailPage, {user:this.user,
      repo: this.repo, release:item
    });
  }
}
