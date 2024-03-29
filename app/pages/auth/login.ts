import {NavController, NavParams, Events} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {ProfileService} from '../../providers/profileService.ts';
import {ReposPage} from '../repos/repos';
import {Component} from '@angular/core';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl} from '@angular/common';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';

@Component({
  templateUrl: 'build/pages/auth/login.html',
  providers: [HttpService, ProfileService],
  directives: [FORM_DIRECTIVES, GmError, GmSpinner]
})
export class LoginPage extends PageClass{
    profile: any;
    //error = {flag:false, status:null, message:null};

    authForm: ControlGroup;
    username: AbstractControl;
    password: AbstractControl;

    constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private profileService: ProfileService, private events: Events, fb: FormBuilder) {
        super();
        console.log('LoginPage.constructor ++++++++++++++++++')
        this.authForm = fb.group({
            'username': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        this.username = this.authForm.controls['username'];
        this.password = this.authForm.controls['password'];
    }

    onSubmit(value: any): void {
        if(this.authForm.valid) {
            //this.error.flag = false;
            this.startAsyncController(1, null);
            var self = this;
            var auth = 'Basic '+ btoa(value.username+':'+value.password);
            var user = {auth:null};
            user.auth = auth;
            this.httpService.load('https://api.github.com/user', user)
            .then((data:any) => {
                  var profile = this.profileService.set(value.username, value.password, data.name, data.avatar_url, data.url);
                  this.nav.setRoot(ReposPage, {user:profile});
                  this.events.publish('user:connected', {});
              }).catch(error => {
                  if(error.status == 401){
                      var err:any = {flag:true, status:401, message:"Invalid credentials, please try again."};
                  }
                  else{
                      var err:any = {flag:true, status:error.status, message:error.message};
                  }
                  this.asyncController(null, err);
              });
        }
    }

}
