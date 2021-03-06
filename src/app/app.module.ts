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
import { DialogModule } from 'primeng/dialog';

import { AngularSplitModule } from 'angular-split';
import { ConnectionDetailsComponent } from './components/setup/connection-details.component';
import { PageNotFoundComponent } from './components/page-not-found.component';

import { NgxMdModule } from 'ngx-md';
import { ErrorHandlingInterceptor } from './lib/error-handling.interceptor';
import { GoogleAnalyticsService } from './lib/google-analytics.service';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';

import { appInitialState } from './+state/app.init';
import { appReducer } from './+state/app.reducer';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AppCommonModule } from './common/app-common.module';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { environment } from '../environments/environment';
import { ProjectConfigComponent } from './components/setup/project-config.component';
import { HierarchyFieldEditorComponent } from './components/setup/hierarchy-field.component';
import { OrganizationComponent } from './components/setup/organization.component';
import { PrivacyComponent } from './components/help/privacy.component';
import { TermsComponent } from './components/help/terms.component';
import { GapiSession } from './googledrive/gapi.session';
import { AppRepository } from './googledrive/app.repository';
import { FileRepository } from './googledrive/file.repository';
import { UserRepository } from './googledrive/user.repository';
import { ConfigurationsComponent } from './components/setup/configurations.component';
import { ExportConfigurationComponent } from './components/setup/export-configuration.component';
import { ImportConfigurationComponent } from './components/setup/import-configuration.component';

import { CopyrightComponent } from './components/header/copyright.component';
import { ToolsComponent } from './components/header/tools.component';
import { NavbarComponent } from './components/header/navbar.component';
import { SearchboxComponent } from './components/header/searchbox.component';
import { CurrentProjectComponent } from './components/header/current-project.component';
import { AppEffects } from './+state/app.effects';
// import { IssueEntryComponent } from './components/issuemanager/issue-entry.component';
import { SetupComponent } from './components/setup.component';
import { SharedLibModule } from './shared-lib/shared-lib.module';

export function initGapi(gapiSession: GapiSession) {
  return () => gapiSession.initClient();
}
@NgModule({
  declarations: [
    NavbarComponent, CopyrightComponent, ToolsComponent, SearchboxComponent, CurrentProjectComponent,

    AppComponent, PageNotFoundComponent, SetupComponent,

    ConnectionDetailsComponent, ProjectConfigComponent, OrganizationComponent, HierarchyFieldEditorComponent,
    ConfigurationsComponent, ExportConfigurationComponent, ImportConfigurationComponent,

    PrivacyComponent, TermsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,

    SharedLibModule,

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
    DialogModule,

    AngularSplitModule.forRoot(),
    NgxMdModule.forRoot(),

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
    EffectsModule.forRoot([AppEffects]),

    AppCommonModule,
    //SearchModule,

    AppRoutingModule
  ],
  providers: [
    GoogleAnalyticsService,
    MessageService,
    // { provide: APP_INITIALIZER, useFactory: initGapi, deps: [GapiSession], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHandlingInterceptor, multi: true },
    GapiSession,
    AppRepository,
    FileRepository,
    UserRepository
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(library: FaIconLibrary) {
    // Add an icon to the library for convenient access in other components
    library.addIconPacks(fas, fab, far);
  }
}
