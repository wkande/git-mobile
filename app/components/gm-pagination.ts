import {Component, Input} from 'angular2/core';

@Component({
    selector: 'gm-pagination',
    template: `
    <ion-buttons start>
        <button
          style="width:46px;">
          <ion-icon name="ios-arrow-back-outline" style="font-size:22pt"></ion-icon><ion-icon name="ios-arrow-back-outline" style="font-size:22pt"></ion-icon>
        </button>
        <button
          style="width:46px;">
          <ion-icon name="ios-arrow-back-outline"></ion-icon>
        </button>
    </ion-buttons>

    <ion-buttons end>
        <button
          style="width:46px;">
          <ion-icon name="ios-arrow-forward-outline"></ion-icon>
        </button>
        <button
          style="width:46px;">
          <ion-icon name="ios-arrow-forward-outline" style="font-size:22pt"></ion-icon><ion-icon name="ios-arrow-forward-outline" style="font-size:22pt"></ion-icon>
        </button>
    </ion-buttons>`,
    directives: [],
    inputs:[]
})

export class GmPagination {
}
