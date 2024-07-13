import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { HelpRequestComponent } from './pages/help-request/help-request.component';
import { SendHelpComponent } from './pages/send-help/send-help.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
        {
          path: 'home',
          component: HomeComponent,
        },
        {
          path: 'request-help',
          component: HelpRequestComponent,
        },
        {
          path: 'send-help',
          component: SendHelpComponent,
        },

    ]
  },
];
