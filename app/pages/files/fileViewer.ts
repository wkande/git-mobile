import {NavController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {HttpService} from '../../providers/httpService.ts';
import {GmError} from '../../components/gm-error';
import {GmSpinner} from '../../components/gm-spinner';
import {PageClass} from '../../extendables/page';


@Component({
  templateUrl: 'build/pages/files/fileViewer.html',
  providers: [HttpService],
  directives: [GmError, GmSpinner]
})


export class FileViewerPage extends PageClass{

  // PARAMS
  trigger:string;
  path:any;
  repo:any;
  branchTagName: string;
  user:any;
  gistName:string;

  // DATA
  file: any;
  content:any;
  description:string;
  fileType:number;// 0=text, 1=image, 2=binary

  // URLS
  url: string;




  constructor(private nav: NavController, navParams: NavParams, private httpService: HttpService) {
      super();
      console.log('\n\n| >>> +++++++++++++ FileViewerPage.constructor +++++++++++++++');
      //console.log(navParams);
      this.trigger = navParams.get('trigger');
      this.path = navParams.get('path');
      this.repo = navParams.get('repo')
      this.branchTagName = (navParams.get('branchTagName') == null) ? 'origin': navParams.get('branchTagName');
      this.user = navParams.get('user');

      if(this.trigger == 'readme'){
          this.description = '';
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/readme';
          this.loadMD();
      }
      else if(this.trigger == 'gist-file'){
          this.description = navParams.get('gistFileName');
          this.gistName = navParams.get('gistName');
          this.content = this.prepContent(navParams.get('content'));
          this.fileType = 0;
          this.asyncController(true, null);
      }
      else{
          this.url = 'https://api.github.com/repos/'+this.repo.owner.login+'/'+this.repo.name+'/contents/'+this.path+'?ref='+this.branchTagName;
          this.load();
      }
  }



  load(){
      var self = this;
      this.startAsyncController(1, null);
      this.httpService.load(this.url, this.user)
      .then((data: any) => {
        console.log("------------------- load --------------------", JSON.stringify(data))
          this.file = data;
          this.description = '/'+data.path;

          //this.file.content = new Buffer(this.file.content, 'base64').toString();

          // Safari does not like the \n that may be at teh end of the file,
          // need to end with =
          this.file.content = this.file.content.replace(/\n/g, '')

          console.log('+++++++++++++++++++++++++++++++++++')
          //console.log(JSON.stringify(this.b64DecodeUnicode(this.file.content)))
console.log('ready to convert atob')
          this.file.content = atob(this.file.content).toString();




console.log('ready to check file type')
          if(this.isText(this.file.content)){ // IS TEXT
              console.log(">>>>>>>>>>>>>>>>>>>>>>>>> TEXT")
              console.log(JSON.stringify(this.file.content))
              this.fileType = 0;
              self.content = this.prepContent(this.file.content);
          }
          else if (this.isImage(this.file.content)){ // IS IMAGE
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>> IMAGE")
              this.fileType = 1;
          }
          else{ // IS BINARY
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>> BINARY")
              this.fileType = 2;
          }
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  reverse(str) {
    return Array.from(str).reverse().join("")
  }

  loadMD(){
      this.startAsyncController(1, null);
      this.httpService.loadMediaHtml(this.url, this.user)
      .then((data: any) => {
        console.log("------------------- loadMD --------------------", data)
          this.content = data;
          this.description = 'Default Repo README';
          this.asyncController(true, null);
      }).catch(error => {
          this.asyncController(null, error);
      });
  }

  hexToBase64(str) {
      return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
  }

  isText(content){
    console.log('checking if text')
      for (var x = 0; x < content.length; x++)
      {
          var c = content.charCodeAt(x);
          if(c > 127) {
              return false;
          }
      }
      return true;
  }

  isImage(content){
    var str = content.substr(0,30).toLowerCase();
      if( str.indexOf('png') > -1 ||
          str.indexOf('gif') > -1 ||
          str.indexOf('jpeg') > -1 ||
          str.indexOf('jpg') > -1){
          return true;
      }
      return false;
  }

  prepContent(content){
      var c;
      var arr = content.split('\n');
      var numb = 1;
      arr.forEach(function(line){
        if(numb == 1) console.log(line);
          var spaces;
          if(numb < 10)
              spaces = '&nbsp;&nbsp;&nbsp;'+numb+'&nbsp;';
          else if(numb < 100)
              spaces = '&nbsp;&nbsp;'+numb+'&nbsp;';
          else if(numb < 1000)
              spaces = '&nbsp;'+numb+'&nbsp;';

          spaces = '<span style="border-left: 1px solid #387ef5;border-right: 1px solid gray;">'+spaces+'</span>&nbsp;';

          var newLine = spaces + line.replace(/\t/g, '&nbsp;').replace(/\ /g, '&nbsp;').replace(/\</g, '&lt') +'<br/>';
          if(numb == 1)
              c = newLine;
          else
              c = c+newLine;
          numb++;
      })
      return c;
  }


  // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  b64DecodeUnicode(str) {
      return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  }

}
