import {Component, Input} from 'angular2/core';

@Component({
    selector: 'gm-card',
    template: `
    <ion-card class="_card">
      <ion-card-content ion-item>
        <div class="_font-small _bold">{{card.title}}</div>
        <div class="_font-small _gray" item-wrap>Created: {{card.body}}</div>
        <ion-icon name="card.icon" class="_gray" item-right></ion-icon>
      </ion-card-content>
    </ion-card>`,
    directives: [],
    inputs:['card']
})

export class GmCard {
    public card = {title:null, body:null, icon:null};
}
