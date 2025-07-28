import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-gmail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="email-window">
      <div class="window-header">Email Classifier</div>

      <div *ngIf="calendarMessage"
          [ngClass]="calendarMessage.type === 'success' ? 'calendar-success' : 'calendar-error'"
          class="calendar-feedback">
        {{ calendarMessage.text }}
      </div>

      <div *ngIf="!emailsLoaded" class="button-container">
        <button class="connect-btn" (click)="connectToGmail()">Connect to Gmail</button>
      </div>

      <div *ngIf="emailsLoaded" class="filter-buttons">
        <button class="filter-btn" [class.active]="selectedCategory === ''" (click)="filterByCategory('')">All</button>
        <button class="filter-btn" [class.active]="selectedCategory === 'Job Offer'" (click)="filterByCategory('Job Offer')">Job Offer</button>
        <button class="filter-btn" [class.active]="selectedCategory === 'Appointment'" (click)="filterByCategory('Appointment')">Appointment</button>
        <button class="filter-btn" [class.active]="selectedCategory === 'General'" (click)="filterByCategory('General')">General</button>
      </div>

      <div class="email-content-wrapper">
        <p><strong>Sender:</strong> {{ emailSender }}</p>
        <p><strong>Subject:</strong> {{ emailSubject }}</p>
        <p><strong>Category:</strong> {{ emailCategory }}</p>
      </div>

      <div class="nav-buttons-fixed">
        <button (click)="previousEmail()" [disabled]="currentIndex === 0">⬅️ Previous</button>
        <button *ngIf="emailCategory === 'appointment'" class="calendar-btn" (click)="addToCalendar()">
          📅 Add to Calendar
        </button>
        <button (click)="nextEmail()" [disabled]="currentIndex === filteredEmails.length - 1">➡️ Next</button>
      </div>
    </div>
  `,
  styles: [`
    .email-window {
      position: relative;
      top: 30px;
      left: 50%;
      transform: translateX(-50%);
      width: 500px;
      background-color: #f4f4f4;
      border: 2px solid #001f3f;
      border-radius: 15px;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      transition: height 0.3s ease-in-out;
      min-height: 300px;
      height: 300px;
      
      
    }

    .email-window.is-loaded {
      height: 450px;
      
      
    }

    .window-header, .calendar-feedback, .button-container, .filter-buttons {
      flex-shrink: 0;
      
      
    }

    .window-header {
      background-color: #001f3f;
      color: white;
      padding: 12px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      
    }

    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 10px 20px;
      justify-content: center;
      
    }

    .filter-btn {
      padding: 10px 12px;
      font-size: 14px;
      background-color: #eee;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      
    }

    .filter-btn.active {
      background-color: #007BFF;
      color: white;
      
    }

    .email-content-wrapper {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px 20px;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      
    }

    .email-content-wrapper p {
      margin: 8px 0;
      
    }

    .nav-buttons-fixed {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-top: 1px solid #ccc;
      background-color: #f4f4f4;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      
    }

    .nav-buttons-fixed button {
      border: none;
      padding: 10px 18px;
      font-size: 14px;
      border-radius: 5px;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s ease, box-shadow 0.15s ease, transform 0.1s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.15);
      
    }

    .nav-buttons-fixed button:active {
      box-shadow: 0 2px 3px rgba(0,0,0,0.2);
      transform: translateY(2px);
      
      
    }

    .nav-buttons-fixed button:not(.calendar-btn) {
      background-color: #007BFF;
      
    }

    .nav-buttons-fixed .calendar-btn {
      background-color: #28a745;
    }

    .nav-buttons-fixed button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .calendar-feedback {
      margin: 10px 20px 0 20px;
      padding: 10px;
      border-radius: 8px;
      font-size: 14px;
      text-align: center;
    }

    .calendar-success { background-color: #d4edda; color: #155724; }
    .calendar-error { background-color: #f8d7da; color: #721c24; }

    .button-container { text-align: center; padding: 20px; }
    .connect-btn {
      background-color: #007BFF;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 6px;
      cursor: pointer;
      
    }
  `]
})
export class GmailComponent {
  emails: any[] = [];
  filteredEmails: any[] = [];
  currentIndex = 0;
  selectedCategory: string = '';
  emailsLoaded = false;
  calendarMessage: { type: 'success' | 'error', text: string } | null = null;

  constructor(private http: HttpClient) {}

  connectToGmail() {
    this.http.get<any[]>('http://127.0.0.1:8000/emails').subscribe({
      next: (response: any[]) => {
        this.emails = response;
        this.filteredEmails = [...this.emails];
        this.currentIndex = 0;
        this.emailsLoaded = true;
      },
      error: (error: any) => console.error("Error fetching emails:", error)
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.filteredEmails = category
      ? this.emails.filter(e => e.category.toLowerCase() === category.toLowerCase())
      : [...this.emails];
    this.currentIndex = 0;
  }

  get emailSender(): string { return this.filteredEmails[this.currentIndex]?.sender || ''; }
  get emailSubject(): string { return this.filteredEmails[this.currentIndex]?.subject || ''; }
  get emailCategory(): string { return this.filteredEmails[this.currentIndex]?.category?.toLowerCase() || ''; }

  previousEmail() { if (this.currentIndex > 0) this.currentIndex--; }
  nextEmail() { if (this.currentIndex < this.filteredEmails.length - 1) this.currentIndex++; }

  addToCalendar() {
    const email = this.filteredEmails[this.currentIndex];
    this.http.post('http://127.0.0.1:8000/add-to-calendar', {
      subject: email.subject,
      body: email.body || '',
      sender: email.sender
    }).subscribe({
      next: () => {
        this.calendarMessage = { type: 'success', text: '✅ Event added to Google Calendar' };
        setTimeout(() => this.calendarMessage = null, 4000);
      },
      error: (err) => {
        const msg = err?.error?.error || '❌ Error while adding to calendar';
        this.calendarMessage = { type: 'error', text: msg };
        setTimeout(() => this.calendarMessage = null, 4000);
      }
    });
  }
}
