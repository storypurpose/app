import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';

import { ConfigurationsComponent } from './components/setup/configurations.component';
import { AuthenticatedGuard } from './lib/auth.guard';
import { SetupComponent } from './components/setup.component';

const routes: Routes = [
  { path: 'configurations', component: ConfigurationsComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'search', canActivate: [AuthenticatedGuard], loadChildren: () => import('./search/search.module').then(m => m.SearchModule) },
  { path: 'browse', canActivate: [AuthenticatedGuard], loadChildren: () => import('./issue/issue.module').then(m => m.IssueModule) },
  { path: '', redirectTo: '/browse', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
