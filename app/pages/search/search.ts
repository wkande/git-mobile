import {NavController, NavParams, Storage, LocalStorage} from 'ionic-angular';
import {Component} from '@angular/core';
import {UsersPage} from '../profile/users';
import {IssuesPage} from '../issues/issues';
import {ReposPage} from '../repos/repos';
import {GistsPage} from '../gists/gists';
import {PageClass} from '../../extendables/page';


@Component({
  templateUrl: 'build/pages/search/search.html'
})


export class SearchPage extends PageClass{

  searchText:string;
  validated:boolean = true;
  searchStorage: any;
  local: any;
  action = 'repos';
  user:any;
  description:string;
  loaded:boolean = false;
  triggered_for:string = null;

  constructor(private nav: NavController, navParams: NavParams) {
      super();
      this.triggered_for = navParams.get('triggered_for');

      this.user = navParams.get('user');
      this.local = new Storage(LocalStorage);
      this.local.get('search')
      .then((data:any) => {
          if(data == null){
              data = {repos:null, users:null, issues:null, repos2:null, users2:null, issues2:null, action:this.action};
              this.local.set('search', JSON.stringify(data) );
          }
          else{
              data = JSON.parse(data);
          }
          this.searchStorage = data;
          if(this.triggered_for != null){
              this.action = this.triggered_for;
              this.setDescription();
          }
          else{
              this.action = this.searchStorage.action;
          }
          this.searchText = this.searchStorage[this.action];
          this.loaded = true;
      });
  }


  changeAction(event, action){
      // Remember current state
      this.searchStorage[this.searchStorage.action] = this.searchText;
      this.local.set('search', JSON.stringify(this.searchStorage) );

      // Switch
      this.action = event.value;
      this.searchStorage.action = event.value;
      this.searchText = this.searchStorage[this.action];
  }


  setDescription(){
      if(this.action == 'repos2')
          this.description = "Repositories";
      else if(this.action == 'issues2')
          this.description = "Issues";
      else if(this.action == 'pulls2')
          this.description = "Pull Requests";
      else if(this.action == 'users2')
          this.description = "Users/Organizations";
  }


  onSubmit(event): void {
      // Store the searchValue
      if(this.triggered_for == null){
          this.searchStorage.action = this.action;
      }
      this.searchStorage[this.action] = this.searchText;
      this.local.set('search', JSON.stringify(this.searchStorage) );

      if(this.action == 'users' || this.action == 'users2')
          this.nav.push(UsersPage, {trigger:'search', searchValue: this.searchText, user:this.user});
      else if(this.action == 'repos' || this.action == 'repos2')
          this.nav.push(ReposPage, {trigger:'search', searchValue: this.searchText, user:this.user});
      else if(this.action == 'issues' || this.action == 'issues2')
          this.nav.push(IssuesPage, {trigger:'search', searchValue: this.searchText, user:this.user});
  }

}
