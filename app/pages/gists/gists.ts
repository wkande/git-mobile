import {Modal, NavController, NavParams, ActionSheet} from 'ionic-angular';
import {Component} from '@angular/core';
import {OnInit} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {GistDetailPage} from './gistDetail';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';

@Component({
  templateUrl: 'build/pages/gists/gists.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})
export class GistsPage extends PageClass{
  // PARAMS
  trigger: string;
  user:any;
  username:string;

  // DATA
  data: any;
  pagination:any;
  lastPage = 0;
  description:string;

  // URLS
  url: string;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
         private utils: Utils) {
      super();
      console.log('\n\n| >>> +++++++++++++ GistsPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.username = navParams.get('username');
      this.trigger = (navParams.get('trigger') == null) ? 'mine': navParams.get('trigger');
      this.setURL();
      this.loadScrolling(null);
  }

  setURL(){
      //console.log('setURL', this.trigger)
      if (this.trigger == 'mine' ){
          this.description = "Mine";
          this.url = 'https://api.github.com/users/'+this.user.login+'/gists';
      }
      else if (this.trigger == 'user' ){
        this.description = "Gists for: "+this.username;
        this.url = 'https://api.github.com/users/'+this.username+'/gists';
      }
      else if (this.trigger == 'starred-me' ){
          this.description = "Starred by Me";
          this.url = 'https://api.github.com/gists/starred';
      }
      else if (this.trigger == 'recent' ){
          this.description = "Recent";
          this.url = 'https://api.github.com/gists/public';
      }
  }


  loadScrolling(infiniteScroll){

      // Disable inifiniteScroll if no more data
      if(infiniteScroll != null && this.data.next == null){
          infiniteScroll.complete();
          return;
      }

      var self = this;

      // New load
      if(infiniteScroll == null){
          this.data = {}; // Jumps the view to the top
          this.data.items = [];
          this.startAsyncController(1, null, false);
      }

      else{ // Infinite scroll load
          this.startAsyncController(1, null, true);
          this.url = this.data.next;
      }


      //this.startAsyncController(1, null);
      this.httpService.load(this.url, this.user)
      .then((data:any) => {

          this.pagination = self.utils.formatPagination(data.gm_pagination);
          this.data.next = this.pagination.next;
          this.lastPage = (this.pagination.lastPageNumber != null) ? this.pagination.lastPageNumber: this.lastPage;
          this.data.gm_pagination = data.gm_pagination;

          // Set data
          var lastRow:number = this.data.items.length; // Last row in old data set
          var row = this.data.items.length;
          for(var i=0; i< data.length; i++){
              data[i].row = row++;
              this.data.items.push(data[i]);
          }

          console.log('this.data', this.data, lastRow, this.data.items.length)
          for(var i=lastRow; i < this.data.items.length; i++){
              console.log('this.data.items[i]', this.data.items[i])
              this.data.items[i].timeAgo = self.utils.timeAgo(this.data.items[i].created_at);
              if(!this.data.items[i].owner){ // Some gists do not have owner, /gists/public
                  this.data.items[i].owner = {};
                  this.data.items[i].owner.login = 'User unknown';
                  this.data.items[i].owner.avatar_url = 'img/blank_avatar.png';
              }

          }

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

  /*loadxxxxxxx(){
      var self = this;
      this.data = {}; // Jumps the view to the top
      this.startAsyncController(1, null);
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
        console.log(data)
          this.pagination = self.utils.formatPagination(data.gm_pagination);
          this.lastPage = (this.pagination.lastPageNumber != null) ? this.pagination.lastPageNumber: this.lastPage;
          this.data.gm_pagination = data.gm_pagination;



          this.data.items.forEach(function(item){
              item.timeAgo = self.utils.timeAgo(item.created_at);
              if(!item.owner){ // Some gist do not have owner, /gists/public
                  item.owner = {};
                  item.owner.login = 'User unknown';
                  item.owner.avatar_url = 'img/blank_avatar.png';
              }
              if(!item.description){
                for (var first in item.files) break;
                item.description = first;
              }
          })




          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }*/

  // Load for pagination
  /*paginationLoad(url){
      this.url = url;//.split('github.com')[1];
      this.load();
  }*/


  presentActionSheet() {
      let actionSheet = ActionSheet.create({
        title: 'Gists',
        buttons: [
          {
            text: 'Mine',
            handler: () => {
              this.trigger = 'mine';
              this.setURL();
              this.loadScrolling(null);}
          },{
            text: 'Starred',
            handler: () => {
              this.trigger = 'starred-me';
              this.setURL();
              this.loadScrolling(null);}
          },{
            text: 'Recent',
            handler: () => {
              this.trigger = 'recent';
              this.setURL();
              this.loadScrolling(null);}
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
    this.nav.push(GistDetailPage, {user:this.user, owner: item.owner.login, id:item.id
    });
  }
}
