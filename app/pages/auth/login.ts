import {Page, NavController, NavParams, Events} from 'ionic-angular';
import {HttpService} from '../../providers/httpService.ts';
import {ProfileService} from '../../providers/profileService.ts';
import {ReposPage} from '../repos/repos';
import {Component} from 'angular2/core';
import {FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl} from 'angular2/common';
import {GmError} from '../../components/gm-error';

@Page({
  templateUrl: 'build/pages/auth/login.html',
  providers: [HttpService, ProfileService],
  directives: [FORM_DIRECTIVES, GmError]
})
export class LoginPage {
    profile: any;
    error = {flag:false, status:null, message:null};

    authForm: ControlGroup;
    username: AbstractControl;
    password: AbstractControl;

    constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private profileService: ProfileService, private events: Events, fb: FormBuilder) {

        this.authForm = fb.group({
            'username': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(1)])]
        });

        this.username = this.authForm.controls['username'];
        this.password = this.authForm.controls['password'];
    }

    onSubmit(value: any): void {
        if(this.authForm.valid) {
            this.error.flag = false;
            var self = this;
            var auth = 'Basic '+ btoa(value.username+':'+value.password);
            this.httpService.load('https://api.github.com/user', {auth:auth})
            .then((data:any) => {
                if ('gmErrorCode' in data) {
                    if(data.gmErrorCode == 401){
                        this.error = {flag:true, message:"Invalid credentials, please try again."};
                    }
                    else{
                        this.error = {flag:true, message:data.message};
                    }
                }
                else{
                    var profile = this.profileService.set(value.username, value.password, data.name, data.avatar_url, data.url);
                    console.log(data)
                    this.nav.setRoot(ReposPage, {user:profile});
                    this.events.publish('user:connected', {});
                }
            }, function(error) {
                self.error = {flag:true, message:error};
            });
        }
    }

}
