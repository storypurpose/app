import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { PersistenceService } from '../persistence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  showConnectionDetailsSetup = false;
  showCustomFieldSetup = false;

  issue: string;
  connectionDetails: any;
  missingConnectionDetails = true;
  constructor(public router: Router, public persistenceService: PersistenceService) {
  }

  ngOnInit() {
    this.connectionDetails = this.persistenceService.getConnectionDetails();
    if (this.connectionDetails) {
      this.missingConnectionDetails = false;
    }
  }
  navigateTo(issue) {
    this.router.navigate([issue]);
  }

  connectionDetailsSetupCompleted() {
    this.showConnectionDetailsSetup = false;
    window.location.reload();
  }

  customFieldSetupCompleted() {
    this.showCustomFieldSetup = false;
    window.location.reload();
  }
}