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

import { SidebarModule } from 'primeng/sidebar';
import { TreeModule } from 'primeng/tree';
import { EpicListComponent } from './components/obsolete/epiclist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SliderModule } from 'primeng/slider';
import { SubItemsComponent } from './components/sub-items.component';
import { ConnectionDetailsComponent } from './components/setup/connection-details.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { AngularSplitModule } from 'angular-split';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { IssueviewerComponent } from './components/issueviewer.component';
import { IssueEntryComponent } from './components/issue-entry.component';
import { CustomFieldsComponent } from './components/setup/custom-fields.component';
import { ButtonPanelComponent } from './components/setup/button-panel.component';
import { MappingListComponent } from './components/setup/mapping-list.component';
import { NodeTemplateComponent } from './components/node-template.component';
import { DisqusModule } from "ngx-disqus";
import { OrganizationComponent } from './components/setup/organization.component';
import { NgxMdModule } from 'ngx-md';
import { ErrorHandlingInterceptor } from './lib/error-handling.interceptor';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ContextMenuModule } from 'primeng/contextmenu';
import { HierarchyFieldEditorComponent } from './components/setup/hierarchy-field.component';
import { AboutComponent } from './components/help/about.component';
import { WorkspaceComponent } from './components/workspace.component';
import { FooterComponent } from './components/footer.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { GoogleAnalyticsService } from './lib/google-analytics.service';
import { StoreModule } from '@ngrx/store';
import { PurposeModule } from './purpose/purpose.module';
import { RecentlyViewedComponent } from './components/recently-viewed.component';

import { appInitialState } from './+state/app.init';
import { appReducer } from './+state/app.reducer';
import { ExtendedFieldsComponent } from './components/extended-fields.component';

@NgModule({
  declarations: [
    AboutComponent, WorkspaceComponent, FooterComponent,

    ButtonPanelComponent, NodeTemplateComponent,

    AppComponent, PageNotFoundComponent, EpicListComponent,
    IssueviewerComponent, ExtendedFieldsComponent,
    SubItemsComponent, IssueEntryComponent, RecentlyViewedComponent,

    ConnectionDetailsComponent, CustomFieldsComponent,
    OrganizationComponent, HierarchyFieldEditorComponent, MappingListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LoadingBarHttpClientModule,

    FontAwesomeModule,

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

    PurposeModule,

    AppRoutingModule,
    StoreModule.forRoot({ app: appReducer }, { initialState: { app: appInitialState } })
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
