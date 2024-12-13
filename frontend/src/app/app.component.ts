import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <mat-toolbar color="primary">
        <span>Разделяне на сметка</span>
        <div class="spacer"></div>
        <nav>
          <a mat-button routerLink="/upload" routerLinkActive="active">
            <mat-icon>upload</mat-icon>
            Качване на касова бележка
          </a>
          <a mat-button routerLink="/bills" routerLinkActive="active">
            <mat-icon>receipt_long</mat-icon>
            Моите сметки
          </a>
        </nav>
      </mat-toolbar>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .spacer {
      flex: 1 1 auto;
    }

    nav {
      display: flex;
      gap: 16px;

      a {
        display: flex;
        align-items: center;
        gap: 8px;
        
        &.active {
          background: rgba(255, 255, 255, 0.1);
        }

        mat-icon {
          margin-right: 4px;
        }
      }
    }

    main {
      flex: 1;
      padding: 20px;
      background: #f5f5f5;
    }

    @media (max-width: 600px) {
      nav {
        a {
          padding: 0 8px;
          
          span {
            display: none;
          }
          
          mat-icon {
            margin: 0;
          }
        }
      }
    }
  `],
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class AppComponent {}
