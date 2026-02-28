import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

const GROUP_MAP: Record<string, string> = {
  'all-polls': 'polls', 'my-polls': 'polls', 'saved-polls': 'polls',
  'analytics': 'insights', 'reports': 'insights',
  'profile': 'account', 'settings': 'account',
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnChanges {
  @Input() activeSection = 'dashboard';
  @Output() sectionChange = new EventEmitter<string>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  isCollapsed = false;
  expandedGroups = new Set<string>(['polls']);

  ngOnChanges(): void {
    const group = GROUP_MAP[this.activeSection];
    if (group) this.expandedGroups.add(group);
  }

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
  }
}
