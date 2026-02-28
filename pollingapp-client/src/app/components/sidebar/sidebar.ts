import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @Output() sectionChange = new EventEmitter<string>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  isCollapsed = false;
  activeSection = 'dashboard';
  expandedGroups = new Set<string>(['polls']);

  private router = inject(Router);
  private authService = inject(AuthService);

  toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  selectSection(section: string): void {
    this.activeSection = section;
    this.sectionChange.emit(section);
  }

  toggleGroup(group: string): void {
    // When collapsed, expand the sidebar first so sub-items become visible
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.collapsedChange.emit(false);
      this.expandedGroups.add(group);
      return;
    }
    if (this.expandedGroups.has(group)) {
      this.expandedGroups.delete(group);
    } else {
      this.expandedGroups.add(group);
    }
  }

  isGroupExpanded(group: string): boolean {
    return this.expandedGroups.has(group) && !this.isCollapsed;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
