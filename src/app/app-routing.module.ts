import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';

import { IssueviewerComponent } from './components/issuemanager/issueviewer.component';
import { ConfigurationsComponent } from './components/setup/configurations.component';
import { AuthenticatedGuard } from './lib/auth.guard';
import { WorkspaceComponent } from './components/workspace.component';

const routes: Routes = [
  { path: 'configurations', component: ConfigurationsComponent },
  { path: 'search', loadChildren: () => import('./search/search.module').then(m => m.SearchModule) },
  //  { path: 'issue', loadChildren: () => import('./issue/issue.module').then(m => m.IssueModule) },
  {
    path: 'browse', component: WorkspaceComponent, children: [
      {
        path: ':issue', component: IssueviewerComponent, // canActivate: [AuthenticatedGuard],
        children: [
          { path: 'purpose', loadChildren: () => import('./issue/issue.module').then(m => m.IssueModule) }
        ]
      },
      { path: '', component: PageNotFoundComponent }]
  },
  { path: '', redirectTo: '/browse', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
