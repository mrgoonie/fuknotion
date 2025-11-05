import { useAppStore } from '../stores/appStore';
import { Workspace } from '../types';

export function useWorkspace() {
  const { currentWorkspace, setWorkspace } = useAppStore();

  const selectWorkspace = (workspace: Workspace) => {
    setWorkspace(workspace);
  };

  const clearWorkspace = () => {
    setWorkspace(null);
  };

  return {
    currentWorkspace,
    selectWorkspace,
    clearWorkspace,
  };
}
