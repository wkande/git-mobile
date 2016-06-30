import {Component, Input} from '@angular/core';

@Component({
    selector: 'gm-spinner',
    template: `
    <div class="_center-text" style="margin-top:50px;" *ngIf="spinner.flag === true">
      <img src="img/spiffygif_42x42.gif"><div style="margin-top:-31px;margin-left:120px;">{{spinner.message}}</div>
    </div>`,
    directives: [],
    inputs:['spinner']
})

export class GmSpinner {
    public spinner = {flag:false, message:null};
}
