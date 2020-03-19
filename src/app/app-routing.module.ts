import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { IssueviewerComponent } from './components/issueviewer.component';
import { AboutComponent } from './components/help/about.component';
import { WorkspaceComponent } from './components/workspace.component';
import { SubItemsComponent } from './components/sub-items.component';
import { PurposeDetailsComponent } from './purpose/components/details.component';
import { ExtendedFieldsComponent } from './components/extended-fields.component';


const routes: Routes = [
  { path: 'about', component: AboutComponent },
  {
    path: 'for', component: WorkspaceComponent, children: [
      {
        path: ':issue', component: IssueviewerComponent, children: [
          { path: 'items', component: SubItemsComponent },
          { path: 'details', component: ExtendedFieldsComponent },
          { path: 'purpose', component: PurposeDetailsComponent },
          { path: '', component: PurposeDetailsComponent, pathMatch: 'full' }
        ]
      },
      { path: '', component: PageNotFoundComponent, pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }