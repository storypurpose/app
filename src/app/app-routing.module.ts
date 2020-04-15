import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { AboutComponent } from './components/help/about.component';
import { WorkspaceComponent } from './components/workspace.component';

import { IssueviewerComponent } from './components/issuemanager/issueviewer.component';
import { TermsComponent } from './components/help/terms.component';
import { PrivacyComponent } from './components/help/privacy.component';
import { ConfigurationsComponent } from './components/setup/configurations.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'configurations', component: ConfigurationsComponent },
  {
    path: 'browse', component: WorkspaceComponent, children: [
      {
        path: ':issue', component: IssueviewerComponent, children: [
          { path: 'purpose', loadChildren: () => import('./purpose/purpose.module').then(m => m.PurposeModule) },
          { path: 'storyboard', loadChildren: () => import('./storyboarding/storyboarding.module').then(m => m.StoryboardingModule) }]
      },
      { path: '', component: PageNotFoundComponent }]
  },
  { path: '', redirectTo: '/about', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
