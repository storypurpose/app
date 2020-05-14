import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';

import { ConfigurationsComponent } from './components/setup/configurations.component';
import { AuthenticatedGuard } from './lib/auth.guard';

const routes: Routes = [
  { path: 'configurations', component: ConfigurationsComponent },
  { path: 'search', loadChildren: () => import('./search/search.module').then(m => m.SearchModule) },
  { path: 'browse', loadChildren: () => import('./issue/issue.module').then(m => m.IssueModule) },
  { path: '', redirectTo: '/browse', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
