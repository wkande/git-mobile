import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {Utils} from '../../providers/utils.ts';
import {ProfilePage} from '../profile/profile';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';


@Component({
  templateUrl: 'build/pages/releases/releaseDetail.html',
  providers: [HttpService, Utils],
  directives: [GmError, GmSpinner]
})


export class ReleaseDetailPage extends PageClass{
  // PARAMS
  repo: any;
  release:any;
  user:any;
  // DATA
  releaseBody:string;
  // URLS
  url: string;


  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService,
        private utils: Utils) {
      super();
      console.log('\n\n| >>> +++++++++++++ ReleaseDetailPage.constructor +++++++++++++++');
      console.log(navParams)
      this.user = navParams.get('user');
      this.repo = navParams.get('repo');
      this.release = navParams.get('release');
      this.releaseBody = this.release.body;
      this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/releases/'+this.release.id;
  }


  ngOnInit() {
      this.startAsyncController(2, null);
      this.load();
      this.loadMD()
  }


  load(){
      this.httpService.load(this.url, this.user)
      .then((data:any) => {
          this.release = data;
          this.release.created_at = this.utils.formatDate(this.release.created_at);
          this.release.published_at = (this.release.published_at == null) ? 'Draft' : this.utils.formatDate(this.release.published_at);
          this.release.draft = (this.release.draft == null) ? null : 'Draft';
          this.release.prerelease = (this.release.prerelease == null) ? null : 'Pre-release';
          this.release.tag_name = (this.release.tag_name == null) ? 'Draft' : this.release.tag_name;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }


  loadMD(){
      this.httpService.mdToHtml(this.releaseBody, this.user)
      .then((data:any) => {
          //console.log(data)
          this.releaseBody = data._body;
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }


  itemTapped(event, item) {
      if(item == 'profile'){
          this.nav.push(ProfilePage, {trigger:'user', user:this.user, username:this.release.author.login}  );
      }

  }
}
