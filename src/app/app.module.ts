import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SidebarModule } from 'primeng/sidebar';
import { TreeModule } from 'primeng/tree';
import { SliderModule } from 'primeng/slider';
import { TabMenuModule } from 'primeng/tabmenu';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FileUploadModule } from 'primeng/fileupload';

import { AngularSplitModule } from 'angular-split';
import { ConnectionDetailsComponent } from './components/setup/connection-details.component';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { IssueviewerComponent } from './components/issueviewer.component';
import { IssueEntryComponent } from './components/issue-entry.component';

import { DisqusModule } from "ngx-disqus";
import { NgxMdModule } from 'ngx-md';
import { ErrorHandlingInterceptor } from './lib/error-handling.interceptor';
import { AboutComponent } from './components/help/about.component';
import { WorkspaceComponent } from './components/workspace.component';
import { FooterComponent } from './components/footer.component';
import { GoogleAnalyticsService } from './lib/google-analytics.service';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { PurposeModule } from './purpose/purpose.module';
import { RecentlyViewedComponent } from './components/recently-viewed.component';

import { appInitialState } from './+state/app.init';
import { appReducer } from './+state/app.reducer';
import { UiSwitchModule } from 'ngx-ui-switch';
import { CommonComponentsModule } from './common-components/common-components.module';
import { CopyrightComponent } from './components/help/copyright.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { environment } from '../environments/environment';
import { ProjectConfigComponent } from './components/setup/project-config.component';
import { FieldSelectorListComponent } from './components/setup/field-selector-list.component';
import { IssuelistComponent } from './components/issue-list.component';

@NgModule({
  declarations: [
    IssuelistComponent, AboutComponent, CopyrightComponent, WorkspaceComponent, FooterComponent,

    AppComponent, PageNotFoundComponent,
    IssueviewerComponent,

    IssueEntryComponent, RecentlyViewedComponent,

    ConnectionDetailsComponent, ProjectConfigComponent,
    FieldSelectorListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LoadingBarHttpClientModule,

    FontAwesomeModule,
    UiSwitchModule,

    NgbModule,

    SliderModule,
    SidebarModule,
    TreeModule,
    TabMenuModule,
    ToastModule,
    ContextMenuModule,
    SplitButtonModule,
    FileUploadModule,

    AngularSplitModule.forRoot(),
    NgxMdModule.forRoot(),
    DisqusModule.forRoot('disqus_storypurpose'),
    StoreModule.forRoot(
      { app: appReducer },
      {
        runtimeChecks: {
          strictStateImmutability: false,
          strictActionImmutability: false,
          strictStateSerializability: true,
          strictActionSerializability: true
        },
        initialState: { app: appInitialState }
      }),

    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),

    CommonComponentsModule,

    AppRoutingModule
  ],
  providers: [
    GoogleAnalyticsService,
    MessageService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas, fab, far);
  }
}
