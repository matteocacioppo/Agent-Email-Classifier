import { Component } from '@angular/core';
import { GmailComponent } from './gmail/gmail';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GmailComponent],
  template: `<app-gmail></app-gmail>`
})
export class App {}
