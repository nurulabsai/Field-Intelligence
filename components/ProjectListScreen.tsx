import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, ChevronRight, ClipboardList, AlertTriangle, MapPin, Edit2, Calendar, FileText } from 'lucide-react';
import './ProjectListScreen.css';

export interface AuditItem {
  id: string;
  title: string;
  type: string;
  status: 'completed' | 'in-progress' | 'assigned' | 'syncing';
  priority?: 'high' | 'medium' | 'low';
  date: string;
}

interface ProjectListScreenProps {
  projectName: string;
  audits: AuditItem[];
  onAuditClick: (auditId: string) => void;
  onBack: () => void;
}

export const ProjectListScreen: React.FC<ProjectListScreenProps> = ({
  projectName,
  audits,
  onAuditClick,
  onBack,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { id: 'all', label: 'All', icon: ClipboardList },
    { id: 'highpriority', label: 'High Priority', icon: AlertTriangle },
    { id: 'geolegal', label: 'Geolegal', icon: MapPin },
    { id: 'edit', label: 'Drafts', icon: Edit2 },
  ];

  const getStatusBadge = (status: string) => {
    const badgeConfig: Record<string, { label: string; className: string }> = {
      'completed': { label: 'Completed', className: 'success' },
      'synced': { label: 'Synced', className: 'success' },
      'in-progress': { label: 'In Progress', className: 'warning' },
      'assigned': { label: 'Assigned', className: 'info' },
      'syncing': { label: 'Syncing', className: 'warning' },
      'draft': { label: 'Draft', className: 'default' },
    };
    return badgeConfig[status] || { label: status, className: 'default' };
  };

  const filteredAudits = audits.filter(audit => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'highpriority') return audit.priority === 'high';
    if (activeFilter === 'edit') return audit.status === 'in-progress' || audit.status === 'assigned' || (audit.status as any) === 'draft';
    // Mock filter for demo
    return true;
  });

  return (
    <div className="project-list-screen animate-in slide-in-from-right">
      {/* Header */}
      <div className="project-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="project-title">{projectName}</h1>
        <button className="menu-button">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            <filter.icon className="w-4 h-4" />
            <span className="filter-label">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Audit List */}
      <div className="audit-list">
        {filteredAudits.map((audit, index) => {
          const statusBadge = getStatusBadge(audit.status);
          const isHighPriority = audit.priority === 'high';

          return (
            <div
              key={audit.id}
              className="audit-list-card hover-lift slide-up-fade"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onAuditClick(audit.id)}
            >
              <div className={`audit-icon-container ${isHighPriority ? 'text-red-500 bg-red-900/20' : ''}`}>
                {isHighPriority ? <AlertTriangle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div className="audit-content">
                <div className="audit-header-row">
                  <h3 className="audit-title">{audit.title}</h3>
                  <span className={`status-badge ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <div className="audit-meta">
                  <span className="audit-type">{audit.type}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {audit.date}
                  </span>
                </div>
              </div>
              <div className="audit-action">
                <button className="action-button">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredAudits.length === 0 && (
          <div className="text-center p-8 text-gray-400">
            No items found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};