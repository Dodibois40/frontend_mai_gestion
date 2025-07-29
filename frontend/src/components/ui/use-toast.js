import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: (options) => {
      if (typeof options === 'string') {
        toast(options);
      } else if (options.variant === 'destructive') {
        toast.error(options.description || options.title);
      } else {
        toast.success(options.description || options.title);
      }
    }
  };
}; 