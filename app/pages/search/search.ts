import {Page, NavController, NavParams, Storage, LocalStorage} from 'ionic-angular';
import { Component } from 'angular2/core';
import { FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl } from 'angular2/common';
import {UsersPage} from '../profile/users';
import {IssuesPage} from '../issues/issues';
import {ReposPage} from '../repos/repos';
import {GistsPage} from '../gists/gists';

@Page({
  templateUrl: 'build/pages/search/search.html'
})
export class SearchPage {

  authForm: ControlGroup;
  searchValue: AbstractControl;
  searchStorage: any;
  local: any;
  action = 'repos';
  user:any;

  constructor(private fb: FormBuilder, private nav: NavController, navParams: NavParams) {
      console.log('SearchPage.constructor');
      console.log(navParams)
      this.user = navParams.get('user');
      this.local = new Storage(LocalStorage);
      this.local.get('search')
      .then((data:any) => {
          if(data == null){
              data = {repos:null, users:null, issues:null, action:this.action};
              this.local.set('search', JSON.stringify(data) );
          }
          else{
              data = JSON.parse(data);
          }
          this.searchStorage = data;
          this.action = this.searchStorage.action;
          this.authForm = this.fb.group({
              'searchValue': [data[this.action], Validators.compose([Validators.required, Validators.minLength(2)])]
          });
          this.searchValue = this.authForm.controls['searchValue'];

      });
  }

  changeAction(event, form:any){
      this.authForm = this.fb.group({
          'searchValue': [this.searchStorage[event.value], Validators.compose([Validators.required, Validators.minLength(2)])]
      });
      this.searchValue = this.authForm.controls['searchValue'];

      // Store the searchValue
      this.searchStorage[this.searchStorage.action] = form.searchValue;
      this.searchStorage.action = this.action;
      this.local.set('search', JSON.stringify(this.searchStorage) );
  }

  onSubmit(value: any): void {
      // Store the searchValue
      this.searchStorage[this.action] = value.searchValue;
      this.searchStorage.action = this.action;
      this.local.set('search', JSON.stringify(this.searchStorage) );


      if(this.action == 'users')
          this.nav.push(UsersPage, {action:'search', searchValue: value.searchValue, user:this.user});
      else if(this.action == 'repos')
          this.nav.push(ReposPage, {action:'search', searchValue: value.searchValue, user:this.user});
      else if(this.action == 'issues')
          this.nav.push(IssuesPage, {action:'search', searchValue: value.searchValue, user:this.user});
  }
}
