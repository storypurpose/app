import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { AboutComponent } from './components/help/about.component';
import { WorkspaceComponent } from './components/workspace.component';

import { IssueviewerComponent } from './components/issueviewer.component';
import { TermsComponent } from './components/help/terms.component';
import { PrivacyComponent } from './components/help/privacy.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  {
    path: 'browse', component: WorkspaceComponent, children: [
      {
        path: ':issue', component: IssueviewerComponent, children: [
          { path: 'selected', loadChildren: () => import('./purpose/purpose.module').then(m => m.PurposeModule) },
          { path: 'storyboard', loadChildren: () => import('./storyboarding/storyboarding.module').then(m => m.StoryboardingModule) }]
      }]
  },
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
