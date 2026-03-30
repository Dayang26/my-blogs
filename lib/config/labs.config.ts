import { LabModule } from '@/types/lab';

export const labModules: LabModule[] = [
  {
    id: 'hand-tracking',
    title: {
      zh: '手势追踪 3D',
      en: 'Hand Tracking 3D',
    },
    description: {
      zh: '使用 MediaPipe 进行实时手势检测，在 3D 场景中与虚拟物体交互',
      en: 'Real-time hand gesture detection using MediaPipe, interact with virtual objects in 3D scene',
    },
    path: '/labs/hand-tracking',
    icon: '🖐️',
    status: 'ready',
  },
  // Future modules can be added here
  // {
  //   id: 'face-detection',
  //   title: { zh: '面部检测', en: 'Face Detection' },
  //   ...
  // },
];

export function getLabModule(id: string): LabModule | undefined {
  return labModules.find((module) => module.id === id);
}