import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { HttpClientModule } from '@angular/common/http';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { SidebarModule } from 'primeng/sidebar';
import { TreeModule } from 'primeng/tree';
import { EpicListComponent } from './components/obsolete/epiclist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SliderModule } from 'primeng/slider';
import { SubDetailsComponent } from './components/sub-details.component';
import { ConnectionDetailsComponent } from './components/settings/connection-details.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { AngularSplitModule } from 'angular-split';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { PurposeComponent } from './components/purpose.component';
import { IssueviewerComponent } from './components/issueviewer.component';
import { IssueEntryComponent } from './components/issue-entry.component';
import { CustomFieldsComponent } from './components/settings/custom-fields.component';
import { ButtonPanelComponent } from './components/settings/button-panel.component';
import { MappingListComponent } from './components/settings/mapping-list.component';
import { NoteTemplateComponent } from './components/node-template.component';

@NgModule({
  declarations: [
    ButtonPanelComponent, NoteTemplateComponent,

    AppComponent, PageNotFoundComponent, EpicListComponent,
    IssueviewerComponent, PurposeComponent,
    SubDetailsComponent, IssueEntryComponent,

    MappingListComponent,
    ConnectionDetailsComponent, CustomFieldsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LoadingBarHttpClientModule,

    SliderModule,
    SidebarModule,
    TreeModule,
    TabMenuModule,

    AngularSplitModule.forRoot(),

    AppRoutingModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas);
  }
}