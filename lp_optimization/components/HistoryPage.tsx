import React, { useState } from 'react';
import { Search, Calendar, Eye, Edit3, Trash2, ExternalLink, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface HistoryItem {
  id: string;
  url: string;
  title: string;
  date: string;
  status: 'draft' | 'published' | 'archived';
  optimizations: number;
}

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const historyItems: HistoryItem[] = [
    {
      id: '1',
      url: 'https://example.com',
      title: 'SaaS Landing Page - Q1 Campaign',
      date: '2025-01-25',
      status: 'draft',
      optimizations: 12
    },
    {
      id: '2',
      url: 'https://productlaunch.com',
      title: 'Product Launch Page',
      date: '2025-01-22',
      status: 'published',
      optimizations: 8
    },
    {
      id: '3',
      url: 'https://webinarpage.com',
      title: 'Webinar Registration Page',
      date: '2025-01-20',
      status: 'published',
      optimizations: 15
    },
    {
      id: '4',
      url: 'https://oldcampaign.com',
      title: 'Holiday Campaign 2024',
      date: '2024-12-15',
      status: 'archived',
      optimizations: 6
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30 dark:bg-chart-4/20 dark:text-chart-4 dark:border-chart-4/30';
      case 'published':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30 dark:bg-chart-2/20 dark:text-chart-2 dark:border-chart-2/30';
      case 'archived':
        return 'bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border';
      default:
        return 'bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-emerald-50/30 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
              Optimization History
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your previously saved landing page optimizations
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} of {historyItems.length} sessions
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-input-background border-border focus:border-chart-1 focus:ring-chart-1/20 text-foreground"
              />
            </div>
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-input-background border-border text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="date" className="text-foreground hover:bg-accent">Latest First</SelectItem>
                  <SelectItem value="title" className="text-foreground hover:bg-accent">Title A-Z</SelectItem>
                  <SelectItem value="optimizations" className="text-foreground hover:bg-accent">Most Optimized</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px] bg-input-background border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground hover:bg-accent">All Status</SelectItem>
                  <SelectItem value="draft" className="text-foreground hover:bg-accent">Draft</SelectItem>
                  <SelectItem value="published" className="text-foreground hover:bg-accent">Published</SelectItem>
                  <SelectItem value="archived" className="text-foreground hover:bg-accent">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* History Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center bg-card border-border">
              <div className="text-muted-foreground mb-4">
                <Calendar className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No sessions found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search criteria' : 'Start optimizing landing pages to see your history here'}
              </p>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-md transition-all duration-200 bg-card border-border hover:border-accent">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{item.title}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-xs">{item.url}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-muted-foreground">
                        <span className="font-medium text-chart-1">{item.optimizations}</span> optimizations applied
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="hover:bg-chart-1/10 hover:border-chart-1 hover:text-chart-1 border-border text-foreground">
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="hover:bg-accent hover:text-accent-foreground border-border text-foreground">
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive border-border text-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredItems.length > 0 && (
          <div className="text-center pt-4">
            <Button variant="outline" className="border-dashed border-border text-foreground hover:bg-accent hover:text-accent-foreground">
              Load More Sessions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}