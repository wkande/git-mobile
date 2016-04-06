import {Component, Input} from 'angular2/core';

@Component({
    selector: 'gm-banner',
    template: `<ion-card class="_card">
      <ion-card-content ion-item>
        <div class="_font-small _bold">{{title}}</div>
        <span class="_font-small _gray" item-wrap>{{body}}</span>
      </ion-card-content>
    </ion-card>
    <ion-card class="_card">
      <ion-card-content ion-item>
        <div class="_font-small _bold">Dude</div>
        <div class="_font-small _gray" item-wrap>Created:</div>
        <ion-icon name="add" style="float:right;"></ion-icon>
      </ion-card-content>
    </ion-card>`,
    directives: [],
    inputs:['title', 'body', 'octicon']
})

export class GmBanner {
    public title:string; body:string; octicon:string;
}

/**
<ion-card class="_card">
  <ion-card-content ion-item>
    <div class="_font-small _bold">{{gist.description}}</div>
    <div class="_font-small _gray" >Created: {{gist.created_at}}</div>
    <ion-icon name="{{gist.public}}" class="_gray" item-right></ion-icon>
  </ion-card-content>
</ion-card>


<!--button class="disable-hover bar-button bar-button-default bar-button-icon-only item-right" style="float:right" (click)="bannerIconClicked($event)"-->

<!--/button>-->


<!--span class="octicon {{octicon}}" style="font-size:20pt;" item-right style="float:right"></span-->


*/
