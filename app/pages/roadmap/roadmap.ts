import {Component} from '@angular/core';
import *  as appConfig from '../../../appConfig.ts';


@Component({
    templateUrl: 'build/pages/roadmap/roadmap.html',
    providers: [],
    directives: []
})


export class RoadmapPage {

  version:string;

  constructor() {
    this.version = appConfig.data['version'];
  }

}
