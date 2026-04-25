'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-card text-card-foreground border-border shadow-lift rounded-xl',
          description: 'text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
