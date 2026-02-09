import { useState } from 'react';
import { useTaskCatalog } from '../../hooks/queries/useTasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskDetail } from './TaskDetail';
import { TaskType } from '../../backend';
import { MousePointerClick, Youtube, Share2, Wand2, Video } from 'lucide-react';

const taskTypeLabels: Record<TaskType, string> = {
  [TaskType.tapTapTask]: 'Tap-Tap Task',
  [TaskType.watchYouTubeVideo]: 'Watch YouTube',
  [TaskType.followSocialMedia]: 'Follow Social Media',
  [TaskType.aiPhotoEdit]: 'AI Photo Edit',
  [TaskType.aiVideoEdit]: 'AI Video Edit',
};

const taskTypeIcons: Record<TaskType, any> = {
  [TaskType.tapTapTask]: MousePointerClick,
  [TaskType.watchYouTubeVideo]: Youtube,
  [TaskType.followSocialMedia]: Share2,
  [TaskType.aiPhotoEdit]: Wand2,
  [TaskType.aiVideoEdit]: Video,
};

export function TaskCatalog() {
  const { data: tasks = [], isLoading } = useTaskCatalog();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  if (selectedTask) {
    const task = tasks.find(t => t.id === selectedTask);
    if (task) {
      return <TaskDetail task={task} onBack={() => setSelectedTask(null)} />;
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No tasks available at the moment. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  const groupedTasks = tasks.reduce((acc, task) => {
    const type = task.taskType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(task);
    return acc;
  }, {} as Record<TaskType, typeof tasks>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Available Tasks</h3>
        <p className="text-muted-foreground">Complete tasks to earn rewards</p>
      </div>

      {Object.entries(groupedTasks).map(([type, typeTasks]) => {
        const Icon = taskTypeIcons[type as TaskType];
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-primary" />
              <h4 className="text-lg font-semibold">{taskTypeLabels[type as TaskType]}</h4>
              <Badge variant="secondary">{typeTasks.length}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {typeTasks.map(task => (
                <Card
                  key={task.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTask(task.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Reward</span>
                      <Badge className="bg-gradient-to-r from-[oklch(0.75_0.20_85)] to-[oklch(0.80_0.18_85)]">
                        ${(Number(task.rewardCents) / 100).toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
