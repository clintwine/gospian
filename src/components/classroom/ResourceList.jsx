import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Link as LinkIcon, Trash2, Download, Plus } from 'lucide-react';
import AddResourceForm from './AddResourceForm';

export default function ResourceList({
  resources,
  onDelete,
  isLoading,
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const getResourceIcon = (type) => {
    switch (type) {
      case 'link': return LinkIcon;
      case 'video': return FileText;
      default: return FileText;
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shared Resources</CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-[#3E82FC]"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </CardHeader>
        <CardContent>
          {resources && resources.length > 0 ? (
            <div className="grid gap-3">
              {resources.map((resource) => {
                const Icon = getResourceIcon(resource.resource_type);
                return (
                  <div
                    key={resource.id}
                    className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[#3E82FC]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#3E82FC]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {resource.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-[#D7E5FF] dark:bg-slate-800 text-[#243B73] dark:text-white"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {resource.file_url && (
                        <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#3E82FC] hover:text-[#243B73]"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      {resource.link_url && (
                        <a href={resource.link_url} target="_blank" rel="noopener noreferrer">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-[#3E82FC] hover:text-[#243B73]"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(resource.id)}
                        className="text-[#E76F51] hover:text-[#E76F51]/80"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No resources shared yet</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-[#3E82FC]"
              >
                Add First Resource
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddResourceForm
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </>
  );
}